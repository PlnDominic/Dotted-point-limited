"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatGHS } from "@/lib/currency";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

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
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [searchInput, setSearchInput] = useState(search);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const supabase = createClient();
  const router = useRouter();
  const { addItem } = useCart();
  const wishlist = useWishlist();

  // Clicking a service/category link, or a search, while already on this
  // page (e.g. from the navbar) changes the URL but doesn't remount this
  // component — keep the filters in sync with the URL when that happens.
  useEffect(() => {
    const nextSearch = searchParams.get("search") ?? "";
    setCategory(searchParams.get("category") ?? "all");
    setSearch(nextSearch);
    setSearchInput(nextSearch);
  }, [searchParams]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      let query = supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (category !== "all") {
        query = query.eq("category", category);
      }
      if (search.trim()) {
        const term = search.trim().replace(/[%_]/g, "");
        query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
      }
      const { data } = await query;
      setProducts(data ?? []);
      setLoading(false);
    }
    fetchProducts();
  }, [category, search, supabase]);

  function handleAddToCart(product: Product) {
    addItem(product);
    setAddedIds((prev) => new Set(prev).add(product.id));
    window.setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 1500);
  }

  const categories = [
    { value: "all", label: "All" },
    { value: "automated-gates", label: "Automated Gates" },
    { value: "roller-shutters", label: "Garage Roller Shutters" },
    { value: "iron-mongering", label: "Iron Mongering" },
    { value: "plasterboard-ceiling", label: "Plasterboard Ceiling" },
    { value: "painting-decoration", label: "Painting & Decoration" },
    { value: "kitchen-cabinets", label: "Kitchen Cabinets" },
    { value: "kitchen-sinks", label: "Kitchen Sinks" },
    { value: "bathroom-fittings", label: "Bathroom Fittings" },
    { value: "shower-cubicle", label: "Shower Cubicle" },
    { value: "concrete-blocks", label: "Building Materials" },
    { value: "building-and-construction", label: "Building & Construction" },
    { value: "painting", label: "Painting" },
    { value: "iron-metal-fabrication", label: "Iron Metal Fabrication" },
    { value: "structural-works", label: "Structural Works" },
    { value: "cabinet", label: "Cabinet" },
    { value: "frameless-glass-balustrade", label: "Frameless Glass Balustrade" },
    { value: "stainless-balustrade", label: "Stainless Balustrade" },
    { value: "window-glazing", label: "Window Glazing" },
    { value: "curtain-walls", label: "Curtain Walls" },
    { value: "power-tools", label: "Power Tools" },
    { value: "safety", label: "Safety" },
    { value: "plumbing-electrical", label: "Plumbing & Electrical" },
    { value: "hardware", label: "Hardware" },
  ];

  const activeCategoryLabel =
    category !== "all" ? categories.find((c) => c.value === category)?.label : undefined;

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (searchInput.trim()) params.set("search", searchInput.trim());
    router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <div className="max-w-[1300px] mx-auto px-6 py-10 md:py-14">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-[var(--font-heading)] text-[32px] md:text-[40px] font-[800] tracking-[-0.02em] text-[#1a1a1a] mb-2">
          {search
            ? `Search results for "${search}"`
            : activeCategoryLabel
            ? activeCategoryLabel
            : "Shop All Products"}
        </h1>
        <p className="text-gray-500 text-[15px] max-w-lg">
          {search
            ? `${products.length} item${products.length === 1 ? "" : "s"} found.`
            : activeCategoryLabel
            ? `Browse everything we offer under ${activeCategoryLabel}.`
            : "Professional-grade tools and materials for every job. Filter by department to find exactly what you need."}
        </p>
      </div>

      {/* Search box */}
      <form onSubmit={submitSearch} className="flex gap-2 mb-6 max-w-md">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search products and services…"
          className="flex-1 min-w-0 px-4 py-2.5 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--color-brand)]"
        />
        <button
          type="submit"
          className="bg-[#1a1a1a] text-white text-[13px] font-semibold px-5 hover:bg-black transition-colors shrink-0"
        >
          Search
        </button>
      </form>

      {/* Category pills */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-8">
        {categories.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className="font-[var(--font-heading)] text-[11.5px] sm:text-[13px] font-semibold px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full sm:rounded-none whitespace-nowrap transition-all duration-200 shrink-0 bg-[var(--color-burgundy)] text-white hover:bg-[var(--color-burgundy-dark)]"
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
          {search ? (
            <p className="text-gray-400 text-[14px] max-w-sm mx-auto mb-6">
              Nothing matched &quot;{search}&quot;. Try a different search term
              or browse by category instead.
            </p>
          ) : (
            <>
              <p className="text-gray-400 text-[14px] max-w-sm mx-auto mb-6">
                This department is being stocked. Add products via the Supabase
                dashboard.
              </p>
              <p className="text-[12px] text-gray-300">
                Supabase → Table Editor → products → Insert row
              </p>
            </>
          )}
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
                  wishlist.toggle(product);
                }}
                className={`heart-btn ${wishlist.has(product.id) ? "active" : ""}`}
                aria-label={wishlist.has(product.id) ? "Remove from wishlist" : "Add to wishlist"}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={wishlist.has(product.id) ? "#ef4444" : "none"}
                  stroke={wishlist.has(product.id) ? "#ef4444" : "#999"}
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
                    {formatGHS(product.price)}
                  </span>
                  {product.stock > 0 ? (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="text-[11px] font-bold text-white bg-[var(--color-brand)] rounded px-2 py-1 hover:bg-[var(--color-brand-dark)] transition-colors"
                      aria-label={`Add ${product.name} to cart`}
                    >
                      {addedIds.has(product.id) ? "Added ✓" : "Add to Cart"}
                    </button>
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
