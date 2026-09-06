import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendOrderConfirmationEmail, sendLowStockAlertEmail } from "@/lib/email";
import type { Order, OrderItem, Product } from "@/types";

type OrderRow = Order & {
  items: (OrderItem & { product: Product | null })[];
};

// Orders placed with stock at or below this, after place_order()'s
// decrement, trigger a low-stock alert to the admin.
const LOW_STOCK_THRESHOLD = 5;

export async function POST(request: Request) {
  const { orderId } = (await request.json().catch(() => ({}))) as {
    orderId?: string;
  };

  if (!orderId) {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  }

  const supabase = await createClient();

  // Bound by the same RLS as everywhere else ("Users can view their own
  // orders" — auth.uid() = user_id OR is_admin()): a caller who isn't
  // signed in as the order's owner (or an admin) simply gets no row back,
  // so this can't be used to email someone else's order confirmation to
  // an arbitrary address.
  const { data: order, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*, product:products(*))")
    .eq("id", orderId)
    .maybeSingle<OrderRow>();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (!order.shipping_email) {
    return NextResponse.json({ sent: false, reason: "no_email" });
  }

  // Rate limit: without this, the order's own owner could call this route
  // repeatedly and have this store's SMTP send real emails to whatever
  // address is on the order, over and over. try_claim_confirmation_send()
  // re-checks ownership itself and only returns true once per 5 minutes
  // per order — see supabase/schema.sql.
  const { data: canSend, error: claimError } = await supabase.rpc(
    "try_claim_confirmation_send",
    { p_order_id: orderId }
  );
  if (claimError) {
    console.error("try_claim_confirmation_send error:", claimError);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
  if (!canSend) {
    return NextResponse.json({ sent: false, reason: "rate_limited" }, { status: 429 });
  }

  const result = await sendOrderConfirmationEmail({
    orderId: order.id,
    customerEmail: order.shipping_email,
    customerName: order.shipping_name ?? "",
    total: order.total,
    shippingFee: order.shipping_fee,
    items: order.items.map((item) => ({
      name: item.product?.name ?? "Item",
      quantity: item.quantity,
      price: item.price,
    })),
    shippingAddress: order.shipping_address ?? "",
    shippingCity: order.shipping_city ?? "",
    shippingRegion: order.shipping_region ?? "",
  });

  // Best-effort, same as the confirmation email above — place_order()
  // already decremented stock, so item.product.stock here reflects the
  // post-order level. One product can appear once per order, so no
  // dedup needed.
  const lowStockItems = order.items
    .filter((item) => item.product && item.product.stock <= LOW_STOCK_THRESHOLD)
    .map((item) => ({ name: item.product!.name, stock: item.product!.stock }));

  if (lowStockItems.length > 0) {
    sendLowStockAlertEmail(lowStockItems).catch((err) =>
      console.error("Low stock alert email error:", err)
    );
  }

  return NextResponse.json(result);
}
