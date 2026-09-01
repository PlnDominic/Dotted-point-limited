import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendOrderConfirmationEmail } from "@/lib/email";
import type { Order, OrderItem, Product } from "@/types";

type OrderRow = Order & {
  items: (OrderItem & { product: Product | null })[];
};

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

  const result = await sendOrderConfirmationEmail({
    orderId: order.id,
    customerEmail: order.shipping_email,
    customerName: order.shipping_name ?? "",
    total: order.total,
    items: order.items.map((item) => ({
      name: item.product?.name ?? "Item",
      quantity: item.quantity,
      price: item.price,
    })),
    shippingAddress: order.shipping_address ?? "",
    shippingCity: order.shipping_city ?? "",
    shippingRegion: order.shipping_region ?? "",
  });

  return NextResponse.json(result);
}
