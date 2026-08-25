"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/types";
import Link from "next/link";

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPageContent />
    </Suspense>
  );
}

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(searchParams.get("category") ?? "all");
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const supabase = createClient();

  useEffect(() => {
    async function fetchProducts() {
      let query = supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (category !== "all") {
        query = query.eq("category", category);
      }
      const { data } = await query;
      setProducts(data ?? []);
      setLoading(false);
    }
    fetchProducts();
  }, [category, supabase]);

  function toggleLike(id: string) {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const categories = [
    { value: "all", label: "All" },
    { value: "power-tools", label: "Power Tools" },
    { value: "building-materials", label: "Materials" },
    { value: "safety", label: "Safety" },
    { value: "plumbing-electrical", label: "Electrical" },
    { value: "hardware", label: "Hardware" },
    { value: "shower-cubicle", label: "Shower Cubicle" },
    { value: "building-and-construction", label: "Building & Construction" },
    { value: "painting", label: "Painting" },
    { value: "iron-metal-fabrication", label: "Iron Metal Fabrication" },
    { value: "structural-works", label: "Structural Works" },
    { value: "cabinet", label: "Cabinet" },
    { value: "frameless-glass-balustrade", label: "Frameless Glass Balustrade" },
    { value: "stainless-balustrade", label: "Stainless Balustrade" },
    { value: "window-glazing", label: "Window Glazing" },
    { value: "curtain-walls", label: "Curtain Walls" },
  ];

  return (
    <div className="max-w-[1300px] mx-auto px-6 py-10 md:py-14">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-[var(--font-heading)] text-[32px] md:text-[40px] font-[800] tracking-[-0.02em] text-[#1a1a1a] mb-2">
          Shop All Products
        </h1>
        <p className="text-gray-500 text-[15px] max-w-lg">
          Professional-grade tools and materials for every job. Filter by
          department to find exactly what you need.
        </p>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-8">
        {categories.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`font-[var(--font-heading)] text-[11.5px] sm:text-[13px] font-semibold px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full sm:rounded-none whitespace-nowrap transition-all duration-200 shrink-0 ${
              category === c.value
                ? "bg-[#1a1a1a] text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-[#1a1a1a]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-100 aspect-square mb-3" />
              <div className="bg-gray-100 h-3 rounded w-1/3 mb-2" />
              <div className="bg-gray-100 h-3 rounded w-2/3 mb-2" />
              <div className="bg-gray-100 h-3 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        /* Empty */
        <div className="text-center py-24">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-30">
            <path d="m7.5 4.27 9 5.15" />
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
          </svg>
          <h2 className="font-[var(--font-heading)] text-[18px] font-bold text-[#1a1a1a] mb-2">
            No Products Found
          </h2>
          <p className="text-gray-400 text-[14px] max-w-sm mx-auto mb-6">
            This department is being stocked. Add products via the Supabase
            dashboard.
          </p>
          <p className="text-[12px] text-gray-300">
            Supabase → Table Editor → products → Insert row
          </p>
        </div>
      ) : (
        /* Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
          {products.map((product, i) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className={`product-card relative group animate-slide-up delay-${(i % 6) + 1}`}
            >
              {/* Heart */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleLike(product.id);
                }}
                className={`heart-btn ${liked.has(product.id) ? "active" : ""}`}
                aria-label="Add to wishlist"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={liked.has(product.id) ? "#ef4444" : "none"}
                  stroke={liked.has(product.id) ? "#ef4444" : "#999"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </button>

              {/* Image */}
              <div className="aspect-square bg-[#f8f8f8] overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
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

              {/* Info */}
              <div className="p-3 md:p-4">
                <h3 className="font-[var(--font-heading)] text-[13px] font-semibold text-[#1a1a1a] mb-0.5 truncate">
                  {product.name}
                </h3>
                <p className="text-[12px] text-gray-400 mb-2 capitalize">
                  {product.category.replace(/-/g, " ")}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-[var(--font-heading)] text-[15px] font-bold text-[#1a1a1a]">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.stock > 0 ? (
                    <span className="text-[11px] text-green-600 font-medium">
                      In Stock
                    </span>
                  ) : (
                    <span className="text-[11px] text-red-500 font-medium">
                      Sold Out
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
