"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

interface CartModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function CartModal({ isOpen, setIsOpen }: CartModalProps) {
  const { items, loading, subtotal, updateQuantity } = useCart();

  const shipping = subtotal >= 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Invisible backdrop to catch outside clicks */}
      <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      <div
        className={`absolute right-0 top-full mt-2 z-50 bg-white border border-gray-100 shadow-xl w-[380px] max-w-[92vw] sm:w-[420px] transform overflow-hidden opacity-0 transition-all duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 relative">
          <h2 className="font-[var(--font-heading)] text-[20px] font-bold text-[#1a1a1a]">
            Shopping Cart
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-5 top-5 text-gray-400 hover:text-black transition-colors"
            aria-label="Close cart"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-[13px]">
            Loading cart…
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-4 opacity-50"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M7 21l-4-4 13-13M21 7l-4-4 13-13" />
            </svg>
            <p className="text-gray-600 mb-2">Your cart is empty</p>
            <Link href="/products" className="btn-dark">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="p-5 space-y-3 max-h-[50vh] overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 py-2 border-b border-gray-100 last-border-0"
              >
                {/* Image */}
                <div className="w-12 h-12 rounded overflow-hidden shrink-0">
                  {item.product?.image_url ? (
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-[var(--font-heading)] text-[12px] font-semibold text-[#1a1a1a]">
                    {item.product?.name}
                  </p>
                  <p className="text-gray-400 text-[11px]">${item.product?.price.toFixed(
                    2
                  )}</p>
                </div>

                {/* Quantity & Subtotal */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-6 h-1/2 bg-gray-100 rounded text-[10px] text-gray-500 flex items-center justify-center">
                    −
                  </button>
                  <span className="w-8 text-center font-[var(--font-heading)] text-[11px] font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-6 h-1/2 bg-gray-100 rounded text-[10px] text-gray-500 flex items-center justify-center">
                    +
                  </button>
                  <span className="text-[11px] font-bold">
                    ${((item.product?.price ?? 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        <div className="p-5 border-t border-gray-100">
          <div className="flex justify-between mb-3">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-bold">${subtotal.toFixed(2)}</span>
          </div>
          {subtotal < 100 && (
            <div className="flex justify-between text-xs text-gray-400 mb-3">
              <span>Add ${(100 - subtotal).toFixed(2)} more for free shipping</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="font-bold">Total</span>
            <span className="text-2xl font-bold text-[#171717]">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 border-t border-gray-100">
          {subtotal > 0 ? (
            <Link
              href="/checkout"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center bg-[var(--color-brand)] text-white py-3 rounded text-[14px] font-bold hover:bg-[var(--color-brand-dark)] transition-colors"
            >
              Proceed to Checkout
            </Link>
          ) : (
            <Link
              href="/products"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center text-gray-400 py-3 rounded border border-gray-200 hover:text-black transition-colors text-[13px]"
            >
              Add items to cart first
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
