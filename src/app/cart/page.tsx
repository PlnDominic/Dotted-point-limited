"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CartItem, Product } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

type CartItemWithProduct = CartItem & { product: Product };

export default function CartPage() {
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  async function loadCart() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }
    const { data } = await supabase
      .from("cart_items").select("*, product:products(*)").eq("user_id", user.id);
    setItems((data as CartItemWithProduct[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { loadCart(); }, []);

  async function updateQty(itemId: string, newQty: number) {
    if (newQty < 1) await supabase.from("cart_items").delete().eq("id", itemId);
    else await supabase.from("cart_items").update({ quantity: newQty }).eq("id", itemId);
    loadCart();
  }

  async function removeItem(itemId: string) {
    await supabase.from("cart_items").delete().eq("id", itemId);
    loadCart();
  }

  const subtotal = items.reduce((s, i) => s + (i.product?.price ?? 0) * i.quantity, 0);
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="max-w-[1300px] mx-auto px-6 py-10">
        <h1 className="font-[var(--font-heading)] text-[32px] font-[800] mb-8">Cart</h1>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse bg-gray-50 p-5 flex gap-5">
              <div className="w-20 h-20 bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-3"><div className="bg-gray-200 h-3 rounded w-1/3" /><div className="bg-gray-200 h-3 rounded w-1/6" /></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1300px] mx-auto px-6 py-10">
      <h1 className="font-[var(--font-heading)] text-[32px] md:text-[40px] font-[800] tracking-[-0.02em] text-[#1a1a1a] mb-8">
        Shopping Cart
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-5xl mb-4 opacity-30">🛒</div>
          <h2 className="font-[var(--font-heading)] text-[18px] font-bold mb-2">Cart is Empty</h2>
          <p className="text-gray-400 text-[14px] mb-6">You haven&apos;t added any items yet.</p>
          <Link href="/products" className="btn-dark text-[13px]">Browse Catalog</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-gray-50 p-4 md:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="w-20 h-20 bg-white overflow-hidden shrink-0">
                  {item.product?.image_url ? (
                    <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><span className="text-xl opacity-20">🔨</span></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-[var(--font-heading)] text-[14px] font-semibold text-[#1a1a1a] truncate">{item.product?.name}</h3>
                  <p className="text-gray-400 text-[13px]">${item.product?.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center border border-gray-200 bg-white">
                  <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-50">−</button>
                  <span className="w-10 text-center font-[var(--font-heading)] text-[13px] font-semibold">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-50">+</button>
                </div>
                <p className="font-[var(--font-heading)] text-[15px] font-bold w-20 text-right">
                  ${((item.product?.price ?? 0) * item.quantity).toFixed(2)}
                </p>
                <button onClick={() => removeItem(item.id)} className="text-[12px] text-gray-400 hover:text-red-500 transition-colors font-[var(--font-heading)] tracking-wide">
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 sticky top-24">
              <h2 className="font-[var(--font-heading)] text-[12px] font-bold tracking-[0.12em] text-gray-400 uppercase mb-5">
                Order Summary
              </h2>
              <div className="space-y-3 text-[14px] mb-5">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-[var(--font-heading)] font-semibold">${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className="font-[var(--font-heading)] font-semibold">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span></div>
                {subtotal > 0 && subtotal < 100 && (
                  <p className="text-[12px] text-gray-400 bg-white p-3 border border-gray-100">
                    Add ${(100 - subtotal).toFixed(2)} more for free shipping.
                  </p>
                )}
              </div>
              <div className="border-t border-gray-200 pt-5 mb-5">
                <div className="flex justify-between">
                  <span className="font-[var(--font-heading)] text-[15px] font-semibold">Total</span>
                  <span className="font-[var(--font-heading)] text-[20px] font-[800]">${total.toFixed(2)}</span>
                </div>
              </div>
              <Link href="/checkout" className="btn-dark block text-center w-full py-4 text-[14px]">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
