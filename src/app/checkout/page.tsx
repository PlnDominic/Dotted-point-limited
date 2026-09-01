"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { formatGHS } from "@/lib/currency";
import { useCart } from "@/context/CartContext";

const GHANA_REGIONS = [
  "Ahafo",
  "Ashanti",
  "Bono",
  "Bono East",
  "Central",
  "Eastern",
  "Greater Accra",
  "North East",
  "Northern",
  "Oti",
  "Savannah",
  "Upper East",
  "Upper West",
  "Volta",
  "Western",
  "Western North",
];

type ShippingDetails = {
  email: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  notes: string;
};

const emptyShipping: ShippingDetails = {
  email: "",
  fullName: "",
  phone: "",
  address: "",
  city: "",
  region: "",
  notes: "",
};

const DRAFT_KEY = "dpl_checkout_shipping_draft";

export default function CheckoutPage() {
  const { items, loading, subtotal, clear } = useCart();
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [awaitingSignIn, setAwaitingSignIn] = useState(false);
  const [shipping, setShipping] = useState<ShippingDetails>(emptyShipping);
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingDetails, string>>>({});
  const router = useRouter();
  const supabase = createClient();

  // Restore an in-progress shipping form (e.g. after leaving to click a
  // magic-link email) and prefill the signed-in user's email if we have one.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) setShipping((prev) => ({ ...prev, ...JSON.parse(raw) }));
    } catch {
      // ignore malformed/unavailable storage
    }
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email;
      if (email) setShipping((prev) => (prev.email ? prev : { ...prev, email }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(shipping));
    } catch {
      // ignore unavailable storage
    }
  }, [shipping]);

  function updateField<K extends keyof ShippingDetails>(field: K, value: string) {
    setShipping((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof ShippingDetails, string>> = {};
    if (!shipping.email.trim()) next.email = "Email is required";
    if (!shipping.fullName.trim()) next.fullName = "Full name is required";
    if (!shipping.phone.trim()) next.phone = "Phone number is required";
    if (!shipping.address.trim()) next.address = "Delivery address is required";
    if (!shipping.city.trim()) next.city = "Town / city is required";
    if (!shipping.region.trim()) next.region = "Region is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  const total = subtotal;

  async function placeOrder() {
    if (!validate()) return;
    setPlacing(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const { error } = await supabase.auth.signInWithOtp({
        email: shipping.email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/checkout`,
        },
      });
      if (error) {
        console.error("Sign in error:", error);
        setErrors((prev) => ({ ...prev, email: "Couldn't send sign-in link. Check the email and try again." }));
        setPlacing(false);
        return;
      }
      // The customer signs in via the emailed link, lands back on /checkout,
      // and their shipping draft (saved above) is restored automatically.
      setAwaitingSignIn(true);
      setPlacing(false);
      return;
    }

    // place_order() prices everything server-side from the live products
    // table (never trusting a client-supplied total/price) and creates the
    // order, its line items, and the stock decrement together in one
    // transaction. See supabase/schema.sql.
    const { data: order, error: orderError } = await supabase
      .rpc("place_order", {
        p_items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        p_shipping_email: shipping.email.trim(),
        p_shipping_name: shipping.fullName.trim(),
        p_shipping_phone: shipping.phone.trim(),
        p_shipping_address: shipping.address.trim(),
        p_shipping_city: shipping.city.trim(),
        p_shipping_region: shipping.region,
        p_shipping_notes: shipping.notes.trim() || null,
      })
      .single<{ id: string }>();

    if (orderError || !order) {
      console.error("Order error:", orderError);
      setPlacing(false);
      return;
    }

    await clear();
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore
    }

    // Best-effort — the order is already placed either way, so a failure
    // here (e.g. SMTP not configured yet) shouldn't block checkout success.
    fetch("/api/send-order-confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    }).catch((err) => console.error("Order confirmation email error:", err));

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
            We&apos;ll deliver to {shipping.address}, {shipping.city}.
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

  if (awaitingSignIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-[var(--border-subtle)] rounded-none flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <p className="font-display text-xl tracking-wide mb-2">
            Check your email
          </p>
          <p className="text-[var(--fg-secondary)] text-sm">
            We sent a sign-in link to <strong>{shipping.email}</strong>.
            Open it to confirm your order — your shipping details are saved.
          </p>
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

  const inputClass =
    "w-full bg-[var(--bg-primary,white)] border border-[var(--border-subtle)] px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-brand)] transition-colors";
  const errorClass = "text-red-500 text-xs mt-1";

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
        {/* Shipping details + order items */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping details */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <div className="p-6 border-b border-[var(--border-subtle)]">
              <h2 className="font-display text-sm tracking-[0.2em] text-[var(--fg-muted)]">
                Shipping Details
              </h2>
            </div>
            <div className="p-6 grid sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[var(--fg-muted)] mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  value={shipping.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                />
                {errors.email && <p className={errorClass}>{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--fg-muted)] mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={shipping.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="Kwame Mensah"
                  className={inputClass}
                />
                {errors.fullName && <p className={errorClass}>{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--fg-muted)] mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={shipping.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="024 000 0000"
                  className={inputClass}
                />
                {errors.phone && <p className={errorClass}>{errors.phone}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[var(--fg-muted)] mb-1.5">
                  Delivery Address *
                </label>
                <input
                  type="text"
                  value={shipping.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="House number, street, landmark"
                  className={inputClass}
                />
                {errors.address && <p className={errorClass}>{errors.address}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--fg-muted)] mb-1.5">
                  Town / City *
                </label>
                <input
                  type="text"
                  value={shipping.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  placeholder="Accra"
                  className={inputClass}
                />
                {errors.city && <p className={errorClass}>{errors.city}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--fg-muted)] mb-1.5">
                  Region *
                </label>
                <select
                  value={shipping.region}
                  onChange={(e) => updateField("region", e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select a region</option>
                  {GHANA_REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                {errors.region && <p className={errorClass}>{errors.region}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[var(--fg-muted)] mb-1.5">
                  Delivery Notes (optional)
                </label>
                <textarea
                  value={shipping.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Gate code, best time to deliver, etc."
                  rows={3}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Order items */}
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
                      {formatGHS(item.product?.price ?? 0)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-display text-base tracking-tight">
                    {formatGHS((item.product?.price ?? 0) * item.quantity)}
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
                <span className="font-display">{formatGHS(subtotal)}</span>
              </div>
            </div>

            <div className="border-t border-[var(--border-subtle)] pt-6 mb-6">
              <div className="flex justify-between">
                <span className="font-display text-base tracking-wide">
                  Total
                </span>
                <span className="font-display text-2xl tracking-tight">
                  {formatGHS(total)}
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
