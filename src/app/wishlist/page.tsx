"use client";

import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { formatGHS } from "@/lib/currency";

export default function WishlistPage() {
  const { items, loading, remove } = useWishlist();
  const { addItem } = useCart();

  if (loading) {
    return (
      <div className="max-w-[1300px] mx-auto px-6 py-10">
        <h1 className="font-[var(--font-heading)] text-[32px] font-[800] mb-8">Wishlist</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-100 aspect-square mb-3" />
              <div className="bg-gray-100 h-3 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1300px] mx-auto px-6 py-10">
      <h1 className="font-[var(--font-heading)] text-[32px] md:text-[40px] font-[800] tracking-[-0.02em] text-[#1a1a1a] mb-8">
        Wishlist
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-30">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
          <h2 className="font-[var(--font-heading)] text-[18px] font-bold mb-2">Your wishlist is empty</h2>
          <p className="text-gray-400 text-[14px] mb-6">
            Tap the heart on any product to save it here.
          </p>
          <Link href="/products" className="btn-dark text-[13px]">Browse Catalog</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
          {items.map((line) => (
            <div key={line.id} className="product-card relative group">
              <button
                onClick={() => remove(line.id)}
                className="heart-btn active"
                aria-label="Remove from wishlist"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </button>

              <Link href={`/products/${line.product_id}`} className="block">
                <div className="aspect-square bg-[#f8f8f8] overflow-hidden">
                  {line.product?.image_url ? (
                    <img
                      src={line.product.image_url}
                      alt={line.product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-20">
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="font-[var(--font-heading)] text-[13px] font-semibold text-[#1a1a1a] mb-0.5 truncate">
                    {line.product?.name}
                  </h3>
                  <span className="font-[var(--font-heading)] text-[15px] font-bold text-[#1a1a1a]">
                    {formatGHS(line.product?.price ?? 0)}
                  </span>
                </div>
              </Link>

              <div className="px-3 md:px-4 pb-3 md:pb-4">
                {(line.product?.stock ?? 0) > 0 ? (
                  <button
                    onClick={() => line.product && addItem(line.product)}
                    className="w-full text-[12px] font-bold text-white bg-[var(--color-brand)] py-2 hover:bg-[var(--color-brand-dark)] transition-colors"
                  >
                    Add to Cart
                  </button>
                ) : (
                  <span className="block text-center text-[11px] text-red-500 font-medium py-2">
                    Sold Out
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
