"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CartItem, Product } from "@/types";
import { useRouter } from "next/navigation";

type CartItemWithProduct = CartItem & { product: Product };

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data } = await supabase
        .from("cart_items")
        .select("*, product:products(*)")
        .eq("user_id", user.id);

      setItems((data as CartItemWithProduct[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  );
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  async function placeOrder() {
    setPlacing(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({ user_id: user.id, total, status: "pending" })
      .select()
      .single();

    if (orderError || !order) {
      setPlacing(false);
      return;
    }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.product?.price ?? 0,
    }));

    await supabase.from("order_items").insert(orderItems);
    await supabase.from("cart_items").delete().eq("user_id", user.id);

    setOrderId(order.id);
    setSuccess(true);
    setPlacing(false);
  }

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="bg-[var(--border-subtle)] h-8 rounded w-1/4" />
          <div className="bg-[var(--border-subtle)] h-64" />
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md animate-scale-in">
          <div className="w-20 h-20 bg-[var(--color-success)] rounded-none flex items-center justify-center mx-auto mb-8">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <p className="font-display text-sm tracking-[0.2em] text-[var(--accent)] mb-4">
            Order Confirmed
          </p>
          <h1 className="font-display text-3xl tracking-tight mb-4">
            Thank You
          </h1>
          <p className="text-[var(--fg-secondary)] mb-2">
            Order{" "}
            <span className="font-display tracking-wider">
              #{orderId.slice(0, 8).toUpperCase()}
            </span>{" "}
            has been placed.
          </p>
          <p className="text-[var(--fg-muted)] text-sm mb-8">
            A confirmation email will arrive shortly.
          </p>
          <button
            onClick={() => router.push("/products")}
            className="btn-primary"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-[var(--border-subtle)] rounded-none flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
          </div>
          <p className="font-display text-xl tracking-wide mb-2">
            Cart is Empty
          </p>
          <p className="text-[var(--fg-secondary)]">
            Add items to your cart before checking out.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="font-display text-sm tracking-[0.2em] text-[var(--accent)] mb-2">
          Final Step
        </p>
        <h1 className="font-display text-4xl md:text-5xl tracking-tight">
          Checkout
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Order items */}
        <div className="lg:col-span-2">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <div className="p-6 border-b border-[var(--border-subtle)]">
              <h2 className="font-display text-sm tracking-[0.2em] text-[var(--fg-muted)]">
                Order Items
              </h2>
            </div>
            <div className="divide-y divide-[var(--border-subtle)]">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-6 flex justify-between items-center"
                >
                  <div>
                    <p className="font-display text-sm tracking-wide">
                      {item.product?.name}
                    </p>
                    <p className="text-[var(--fg-muted)] text-sm mt-1">
                      ${item.product?.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-display text-base tracking-tight">
                    ${((item.product?.price ?? 0) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6 sticky top-24">
            <h2 className="font-display text-sm tracking-[0.2em] text-[var(--fg-muted)] mb-6">
              Summary
            </h2>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-[var(--fg-secondary)]">Subtotal</span>
                <span className="font-display">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--fg-secondary)]">Shipping</span>
                <span className="font-display">
                  {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="border-t border-[var(--border-subtle)] pt-6 mb-6">
              <div className="flex justify-between">
                <span className="font-display text-base tracking-wide">
                  Total
                </span>
                <span className="font-display text-2xl tracking-tight">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={placeOrder}
              disabled={placing}
              className="btn-primary w-full py-4 text-base disabled:opacity-40"
            >
              {placing ? "Processing..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
