"use client";

import Link from "next/link";
import { useState } from "react";

/* ─── Data ─── */
const brands = [
  { name: "DeWalt", logo: "DEWALT" },
  { name: "Milwaukee", logo: "MILWAUKEE" },
  { name: "Makita", logo: "MAKITA" },
  { name: "Bosch", logo: "BOSCH" },
  { name: "Stanley", logo: "STANLEY" },
  { name: "Hilti", logo: "HILTI" },
];

const categories = [
  { name: "Power Tools", icon: "⚡", bg: "#f5f5f5" },
  { name: "Lumber", icon: "🪵", bg: "#f5f5f5" },
  { name: "Concrete", icon: "🧱", bg: "#f5f5f5" },
  { name: "Safety Gear", icon: "🦺", bg: "#f5f5f5" },
  { name: "Fasteners", icon: "🔩", bg: "#f5f5f5" },
  { name: "Plumbing", icon: "🔧", bg: "#f5f5f5" },
  { name: "Electrical", icon: "💡", bg: "#f5f5f5" },
];

const bestSellers = [
  {
    id: "1",
    name: "DeWalt 20V Drill",
    category: "Power Tools",
    price: 179.99,
    rating: 4.8,
    reviews: "2.1k",
    image: "https://picsum.photos/seed/dewalt-drill/400/400",
  },
  {
    id: "2",
    name: "Milwaukee Impact Driver",
    category: "Power Tools",
    price: 149.00,
    rating: 4.7,
    reviews: "1.8k",
    image: "https://picsum.photos/seed/milwaukee-impact/400/400",
  },
  {
    id: "3",
    name: "Makita Circular Saw",
    category: "Power Tools",
    price: 210.00,
    rating: 4.9,
    reviews: "3.2k",
    image: "https://picsum.photos/seed/makita-saw/400/400",
  },
  {
    id: "4",
    name: "Stanley Tape Measure",
    category: "Hand Tools",
    price: 29.97,
    rating: 4.6,
    reviews: "986",
    image: "https://picsum.photos/seed/stanley-tape/400/400",
  },
  {
    id: "5",
    name: "Bosch Level 48\"",
    category: "Hand Tools",
    price: 44.50,
    rating: 4.7,
    reviews: "1.2k",
    image: "https://picsum.photos/seed/bosch-level/400/400",
  },
];

const heroSlides = [
  {
    headline: "Built to\nLast.",
    subtitle:
      "Premium tools and materials\nfor every job, big or small.",
    badge: "New Arrivals",
    badgeSub: "DeWalt 20V MAX Series",
    image: "https://picsum.photos/seed/hero-tool/800/600",
  },
  {
    headline: "Outfit\nYour Site.",
    subtitle:
      "Everything from framing to\nfinishing — all in one place.",
    badge: "Best Sellers",
    badgeSub: "Milwaukee M18 FUEL",
    image: "https://picsum.photos/seed/hero-milwaukee/800/600",
  },
  {
    headline: "Pro Grade.\nPro Price.",
    subtitle:
      "Contractor pricing on\n12,400+ products.",
    badge: "Limited Time",
    badgeSub: "Up to 30% Off",
    image: "https://picsum.photos/seed/hero-sale/800/600",
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [liked, setLiked] = useState<Set<string>>(new Set());

  function toggleLike(id: string) {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const slide = heroSlides[currentSlide];

  return (
    <div>
      {/* ═══════ HERO ═══════ */}
      <section className="relative bg-[#f5f5f5] overflow-hidden">
        <div className="max-w-[1300px] mx-auto px-6 grid md:grid-cols-2 min-h-[520px]">
          {/* Left — Text */}
          <div className="flex flex-col justify-center py-12 md:py-0 relative z-10">
            <div
              key={currentSlide}
              className="animate-slide-up"
            >
              <h1 className="font-[var(--font-heading)] text-[52px] md:text-[68px] font-[900] leading-[0.95] tracking-[-0.03em] text-[#1a1a1a] mb-5 whitespace-pre-line">
                {slide.headline}
              </h1>
              <p className="text-gray-500 text-[16px] md:text-[17px] leading-relaxed mb-8 whitespace-pre-line max-w-[380px]">
                {slide.subtitle}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/products" className="btn-dark">
                  Shop Now
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
                <Link href="/products" className="btn-outline">
                  View Catalog
                </Link>
              </div>
            </div>
          </div>

          {/* Right — Image */}
          <div className="relative flex items-center justify-center py-8 md:py-0">
            <div className="relative w-full max-w-[480px] aspect-square animate-scale-in" key={currentSlide}>
              <img
                src={slide.image}
                alt="Featured product"
                className="w-full h-full object-cover rounded-lg shadow-2xl"
              />
              {/* Badge */}
              <div className="sale-badge rounded-lg">
                <div className="text-[10px] tracking-[0.1em] opacity-70 mb-0.5">
                  {slide.badge}
                </div>
                <div className="text-[13px] font-bold">{slide.badgeSub}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === currentSlide
                  ? "bg-[#1a1a1a] w-7"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ═══════ TOP BRANDS ═══════ */}
      <section className="border-b border-gray-100">
        <div className="max-w-[1300px] mx-auto px-6 py-6 flex items-center justify-between">
          <span className="font-[var(--font-heading)] text-[12px] font-bold tracking-[0.15em] text-gray-400 uppercase shrink-0">
            Top Brands
          </span>
          <div className="flex items-center gap-8 md:gap-12 overflow-x-auto ml-6 md:ml-10 scrollbar-hide">
            {brands.map((brand) => (
              <span
                key={brand.name}
                className="font-[var(--font-heading)] text-[15px] font-[800] tracking-[0.06em] text-gray-300 hover:text-gray-600 transition-colors cursor-pointer whitespace-nowrap select-none"
              >
                {brand.logo}
              </span>
            ))}
          </div>
          <Link
            href="/products"
            className="text-[13px] font-semibold text-gray-500 hover:text-[#1a1a1a] transition-colors shrink-0 ml-6 hidden md:block"
          >
            View all
          </Link>
        </div>
      </section>

      {/* ═══════ SHOP BY CATEGORY ═══════ */}
      <section className="max-w-[1300px] mx-auto px-6 py-10 md:py-14">
        <h2 className="font-[var(--font-heading)] text-[13px] font-bold tracking-[0.15em] text-gray-400 uppercase mb-8">
          Shop by Category
        </h2>
        <div className="flex gap-6 md:gap-10 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map((cat, i) => (
            <Link
              key={cat.name}
              href="/products"
              className={`flex flex-col items-center gap-3 shrink-0 animate-slide-up delay-${i + 1}`}
            >
              <div className="category-circle">
                <span className="text-3xl">{cat.icon}</span>
              </div>
              <span className="text-[13px] font-medium text-gray-600">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════ BEST SELLERS ═══════ */}
      <section className="max-w-[1300px] mx-auto px-6 py-6 md:py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-[var(--font-heading)] text-[13px] font-bold tracking-[0.15em] text-gray-400 uppercase">
            Best Sellers
          </h2>
          <Link
            href="/products"
            className="text-[13px] font-semibold text-gray-500 hover:text-[#1a1a1a] transition-colors"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
          {bestSellers.map((item, i) => (
            <Link
              key={item.id}
              href={`/products/${item.id}`}
              className={`product-card relative group animate-slide-up delay-${i + 1}`}
            >
              {/* Heart */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleLike(item.id);
                }}
                className={`heart-btn ${liked.has(item.id) ? "active" : ""}`}
                aria-label="Add to wishlist"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={liked.has(item.id) ? "#ef4444" : "none"}
                  stroke={liked.has(item.id) ? "#ef4444" : "#999"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </button>

              {/* Image */}
              <div className="aspect-square bg-[#f8f8f8] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Info */}
              <div className="p-3 md:p-4">
                <h3 className="font-[var(--font-heading)] text-[13px] font-semibold text-[#1a1a1a] mb-0.5 truncate">
                  {item.name}
                </h3>
                <p className="text-[12px] text-gray-400 mb-2">{item.category}</p>
                <div className="flex items-center justify-between">
                  <span className="font-[var(--font-heading)] text-[15px] font-bold text-[#1a1a1a]">
                    ${item.price.toFixed(2)}
                  </span>
                  <span className="flex items-center gap-1 text-[12px]">
                    <span className="star">★</span>
                    <span className="font-medium text-gray-600">{item.rating}</span>
                    <span className="text-gray-400">({item.reviews})</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════ SUMMER SALE BANNER ═══════ */}
      <section className="max-w-[1300px] mx-auto px-6 py-8">
        <div className="bg-[#1a1a1a] rounded-xl overflow-hidden relative">
          <div className="grid md:grid-cols-2 items-center">
            {/* Left — Text */}
            <div className="p-8 md:p-12 lg:p-14 relative z-10">
              <span className="font-[var(--font-heading)] text-[11px] font-bold tracking-[0.15em] text-[#e8721a] uppercase">
                Limited Time Only
              </span>
              <h2 className="font-[var(--font-heading)] text-[36px] md:text-[44px] font-[900] text-white leading-[1.05] tracking-[-0.02em] mt-3 mb-3">
                Contractor
                <br />
                Sale
              </h2>
              <p className="text-gray-400 text-[15px] mb-7 max-w-[300px]">
                Up to 40% off on selected power tools and equipment.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-white text-[#1a1a1a] font-[var(--font-heading)] font-semibold text-[13px] px-6 py-3 hover:bg-gray-100 transition-colors"
              >
                Shop the Sale
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Right — Image + Discount */}
            <div className="relative flex items-center justify-end p-8 md:p-0">
              <img
                src="https://picsum.photos/seed/sale-tools/600/400"
                alt="Sale items"
                className="w-full max-w-[400px] object-cover rounded-lg opacity-80"
              />
              <div className="absolute right-6 md:right-10 bottom-8 md:bottom-12">
                <span className="font-[var(--font-heading)] text-[60px] md:text-[80px] font-[900] text-[#e8721a] leading-none tracking-[-0.03em]">
                  40%
                </span>
                <span className="font-[var(--font-heading)] text-[20px] md:text-[24px] font-[800] text-[#e8721a] block -mt-2 tracking-[0.05em]">
                  OFF
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ TRUST BAR ═══════ */}
      <section className="border-t border-gray-100">
        <div className="max-w-[1300px] mx-auto px-6 py-10 md:py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                    <path d="M15 18H9" />
                    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                    <circle cx="17" cy="18" r="2" />
                    <circle cx="7" cy="18" r="2" />
                  </svg>
                ),
                title: "Free Shipping",
                desc: "On orders over $100",
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    <path d="M21 3v5h-5" />
                  </svg>
                ),
                title: "30-Day Returns",
                desc: "Hassle-free returns",
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                ),
                title: "100% Authentic",
                desc: "Genuine branded products",
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                ),
                title: "Secure Payments",
                desc: "Safe & encrypted checkout",
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className={`flex items-start gap-4 animate-slide-up delay-${i + 1}`}
              >
                <div className="text-gray-400 mt-0.5 shrink-0">{item.icon}</div>
                <div>
                  <h3 className="font-[var(--font-heading)] text-[14px] font-semibold text-[#1a1a1a] mb-1">
                    {item.title}
                  </h3>
                  <p className="text-[13px] text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
