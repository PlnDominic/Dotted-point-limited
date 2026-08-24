"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/types";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      setProduct(data);
      setLoading(false);
    }
    load();
  }, [id, supabase]);

  async function addToCart() {
    setAdding(true);
    setMsg("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    const { data: existing } = await supabase
      .from("cart_items").select("*")
      .eq("user_id", user.id).eq("product_id", id).single();

    if (existing) {
      await supabase.from("cart_items").update({ quantity: existing.quantity + quantity }).eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({ user_id: user.id, product_id: id, quantity });
    }
    setAdding(false);
    setMsg("Added to cart");
    setTimeout(() => setMsg(""), 3000);
  }

  if (loading) {
    return (
      <div className="max-w-[1300px] mx-auto px-6 py-10">
        <div className="animate-pulse grid md:grid-cols-2 gap-12">
          <div className="bg-gray-100 aspect-square" />
          <div className="space-y-4 pt-4">
            <div className="bg-gray-100 h-3 rounded w-1/4" />
            <div className="bg-gray-100 h-8 rounded w-3/4" />
            <div className="bg-gray-100 h-6 rounded w-1/6 mt-4" />
            <div className="bg-gray-100 h-20 rounded mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1300px] mx-auto px-6 py-24 text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-30">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <h1 className="font-[var(--font-heading)] text-[22px] font-bold mb-2">
          Product Not Found
        </h1>
        <p className="text-gray-400 text-[14px] mb-6">
          This item may have been removed or the link is incorrect.
        </p>
        <button onClick={() => router.push("/products")} className="btn-dark text-[13px]">
          Back to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1300px] mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <nav className="mb-8 text-[13px] text-gray-400">
        <a href="/products" className="hover:text-[#1a1a1a] transition-colors">Shop</a>
        <span className="mx-2">/</span>
        <span className="text-gray-600">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Image */}
        <div className="aspect-square bg-[#f8f8f8] overflow-hidden animate-scale-in">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-15">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="animate-slide-up delay-2">
          <p className="font-[var(--font-heading)] text-[12px] font-bold tracking-[0.12em] text-gray-400 uppercase mb-3">
            {product.category.replace(/-/g, " ")}
          </p>
          <h1 className="font-[var(--font-heading)] text-[28px] md:text-[34px] font-[800] tracking-[-0.02em] text-[#1a1a1a] mb-4 leading-tight">
            {product.name}
          </h1>

          <p className="font-[var(--font-heading)] text-[28px] font-[800] text-[#e8721a] mb-6">
            ${product.price.toFixed(2)}
          </p>

          <p className="text-gray-500 text-[15px] leading-relaxed mb-8 max-w-lg">
            {product.description}
          </p>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-gray-50 p-4">
              <p className="font-[var(--font-heading)] text-[11px] font-bold tracking-[0.1em] text-gray-400 uppercase mb-1">
                Availability
              </p>
              <p className={`font-[var(--font-heading)] text-[13px] font-semibold ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
              </p>
            </div>
            <div className="bg-gray-50 p-4">
              <p className="font-[var(--font-heading)] text-[11px] font-bold tracking-[0.1em] text-gray-400 uppercase mb-1">
                SKU
              </p>
              <p className="font-[var(--font-heading)] text-[13px] font-semibold text-[#1a1a1a]">
                DP-{product.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-3 mb-5">
            <span className="font-[var(--font-heading)] text-[12px] font-bold tracking-[0.1em] text-gray-400 uppercase">
              Qty
            </span>
            <div className="flex items-center border border-gray-200">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-12 text-center font-[var(--font-heading)] text-[14px] font-semibold">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to cart */}
          <button
            onClick={addToCart}
            disabled={adding || product.stock === 0}
            className="btn-dark w-full py-4 text-[14px] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {adding ? "Adding..." : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>

          {msg && (
            <p className="mt-3 text-[13px] text-green-600 font-medium text-center animate-fade-in">
              ✓ {msg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
