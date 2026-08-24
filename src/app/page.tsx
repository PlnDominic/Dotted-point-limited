"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/* ─── Data ─── */
const avatars = [
  "https://i.pravatar.cc/64?img=12",
  "https://i.pravatar.cc/64?img=32",
  "https://i.pravatar.cc/64?img=47",
  "https://i.pravatar.cc/64?img=5",
];

const floatingChips = [
  { name: "Air Max 270", price: "$129.99", image: "https://picsum.photos/seed/air-max/120/120" },
  { name: "Smart Watch", price: "$199.99", image: "https://picsum.photos/seed/smart-watch/120/120" },
  { name: "Wireless Headphones", price: "$89.99", image: "https://picsum.photos/seed/headphones/120/120" },
  { name: "Water Bottle", price: "$24.99", image: "https://picsum.photos/seed/water-bottle/120/120" },
];

const trustItems = [
  {
    title: "Free Shipping",
    desc: "On orders over $50",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
        <path d="M15 18H9" />
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
        <circle cx="17" cy="18" r="2" />
        <circle cx="7" cy="18" r="2" />
      </svg>
    ),
  },
  {
    title: "Secure Payments",
    desc: "100% secure checkout",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: "Easy Returns",
    desc: "30-day return policy",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        <path d="M21 3v5h-5" />
      </svg>
    ),
  },
  {
    title: "24/7 Support",
    desc: "Always here to help",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11a9 9 0 0 1 18 0" />
        <path d="M21 12v5a2 2 0 0 1-2 2h-1" />
        <rect x="3" y="11" width="4" height="6" rx="1" />
        <rect x="17" y="11" width="4" height="6" rx="1" />
      </svg>
    ),
  },
];

const categories = [
  { name: "Fashion", image: "https://picsum.photos/seed/cat-fashion/400/500" },
  { name: "Electronics", image: "https://picsum.photos/seed/cat-electronics/400/500" },
  { name: "Beauty", image: "https://picsum.photos/seed/cat-beauty/400/500" },
  { name: "Fitness", image: "https://picsum.photos/seed/cat-fitness/400/500" },
  { name: "Home Decor", image: "https://picsum.photos/seed/cat-home/400/500" },
  { name: "Accessories", image: "https://picsum.photos/seed/cat-accessories/400/500" },
];

const newArrivals = [
  { id: "1", name: "Essential Hoodie", price: 59.99, oldPrice: null, rating: 4.9, reviews: 128, tag: "New", image: "https://picsum.photos/seed/hoodie/400/400" },
  { id: "2", name: "Air Max 270", price: 129.99, oldPrice: 159.99, rating: 4.8, reviews: 89, tag: "-20%", image: "https://picsum.photos/seed/airmax270/400/400" },
  { id: "3", name: "Wireless Headphones", price: 99.99, oldPrice: null, rating: 4.7, reviews: 156, tag: "New", image: "https://picsum.photos/seed/wl-headphones/400/400" },
  { id: "4", name: "Smart Watch Series 9", price: 199.99, oldPrice: 234.99, rating: 4.9, reviews: 103, tag: "-15%", image: "https://picsum.photos/seed/watch9/400/400" },
  { id: "5", name: "Stainless Steel Bottle", price: 24.99, oldPrice: null, rating: 4.6, reviews: 76, tag: "New", image: "https://picsum.photos/seed/bottle/400/400" },
  { id: "6", name: "Aviator Sunglasses", price: 89.99, oldPrice: 99.99, rating: 4.7, reviews: 67, tag: "-10%", image: "https://picsum.photos/seed/aviator/400/400" },
];

const bestSellers = [
  {
    id: "7",
    name: "Classic Hoodie",
    price: 59.99,
    rating: 4.8,
    reviews: 256,
    desc: "Premium quality hoodie perfect for everyday wear.",
    image: "https://picsum.photos/seed/classic-hoodie/500/500",
  },
  {
    id: "8",
    name: "Air Max 270",
    price: 129.99,
    rating: 4.9,
    reviews: 189,
    desc: "Iconic comfort meets modern style.",
    image: "https://picsum.photos/seed/airmax-best/500/500",
  },
  {
    id: "9",
    name: "Sony WH-1000XM5",
    price: 349.99,
    rating: 4.9,
    reviews: 324,
    desc: "Industry-leading noise cancellation.",
    image: "https://picsum.photos/seed/sony-wh1000/500/500",
  },
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function Home() {
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState({ h: 2, m: 15, s: 45, d: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { h, m, s } = prev;
        s -= 1;
        if (s < 0) { s = 59; m -= 1; }
        if (m < 0) { m = 59; h -= 1; }
        if (h < 0) { h = 0; m = 0; s = 0; }
        return { ...prev, h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function toggleLike(id: string) {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div>
      {/* ═══════ HERO ═══════ */}
      <section className="relative bg-[#f6f6f6] overflow-hidden">
        <div className="max-w-[1300px] mx-auto px-6 grid lg:grid-cols-2 gap-10 items-center py-14 lg:py-0 lg:min-h-[600px]">
          {/* Left — Text */}
          <div className="relative z-10 animate-slide-up">
            <span className="eyebrow uppercase">Trending Now</span>
            <h1 className="font-[var(--font-heading)] text-[42px] sm:text-[52px] lg:text-[58px] font-[800] leading-[1.05] tracking-[-0.02em] text-[#171717] mt-4 mb-5">
              Discover Products
              <br />
              You&rsquo;ll Love
            </h1>
            <p className="text-gray-500 text-[16px] leading-relaxed mb-8 max-w-[400px]">
              Shop the latest trending products curated for modern
              lifestyles.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <Link href="/products" className="btn-primary">
                Shop Now
              </Link>
              <Link href="/products" className="btn-outline">
                Explore Collection
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3">
              <div className="avatar-stack flex">
                {avatars.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={src} src={src} alt="Customer" />
                ))}
              </div>
              <span className="text-[13px] text-gray-500">
                Loved by <span className="font-semibold text-[#171717]">50,000+</span> customers worldwide
              </span>
            </div>
          </div>

          {/* Right — Image + floating cards */}
          <div className="relative flex items-center justify-center py-8 lg:py-16">
            <div className="absolute w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] rounded-[40%] bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-dark)] opacity-90" />
            <div className="relative w-[280px] sm:w-[340px] aspect-[3/4] animate-scale-in">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://picsum.photos/seed/hero-model/600/800"
                alt="Featured model wearing new arrivals"
                className="w-full h-full object-cover rounded-3xl shadow-2xl"
              />
            </div>

            {/* Floating chips */}
            <div className="floating-chip absolute top-6 left-0 sm:-left-4 animate-float">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={floatingChips[0].image} alt={floatingChips[0].name} className="w-10 h-10 rounded-lg object-cover" />
              <div>
                <p className="text-[11px] font-semibold text-[#171717] leading-tight">{floatingChips[0].name}</p>
                <p className="text-[11px] text-gray-400">{floatingChips[0].price}</p>
              </div>
            </div>

            <div className="floating-chip absolute top-4 right-0 sm:-right-6 animate-float delay-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={floatingChips[1].image} alt={floatingChips[1].name} className="w-10 h-10 rounded-lg object-cover" />
              <div>
                <p className="text-[11px] font-semibold text-[#171717] leading-tight">{floatingChips[1].name}</p>
                <p className="text-[11px] text-gray-400">{floatingChips[1].price}</p>
              </div>
            </div>

            <div className="floating-chip absolute bottom-16 left-0 sm:-left-8 animate-float delay-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={floatingChips[2].image} alt={floatingChips[2].name} className="w-10 h-10 rounded-lg object-cover" />
              <div>
                <p className="text-[11px] font-semibold text-[#171717] leading-tight">{floatingChips[2].name}</p>
                <p className="text-[11px] text-gray-400">{floatingChips[2].price}</p>
              </div>
            </div>

            <div className="floating-chip absolute bottom-4 right-0 sm:-right-4 animate-float delay-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={floatingChips[3].image} alt={floatingChips[3].name} className="w-10 h-10 rounded-lg object-cover" />
              <div>
                <p className="text-[11px] font-semibold text-[#171717] leading-tight">{floatingChips[3].name}</p>
                <p className="text-[11px] text-gray-400">{floatingChips[3].price}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ TRUST BAR ═══════ */}
      <section className="border-b border-gray-100">
        <div className="max-w-[1300px] mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustItems.map((item, i) => (
            <div key={item.title} className={`flex items-center gap-3 animate-slide-up delay-${i + 1}`}>
              <div className="trust-icon">{item.icon}</div>
              <div>
                <h3 className="font-[var(--font-heading)] text-[13px] font-semibold text-[#171717]">
                  {item.title}
                </h3>
                <p className="text-[12px] text-gray-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ SHOP BY CATEGORIES ═══════ */}
      <section className="max-w-[1300px] mx-auto px-6 py-14 md:py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-[var(--font-heading)] text-[24px] md:text-[28px] font-[800] tracking-[-0.01em] text-[#171717]">
            Shop by Categories
          </h2>
          <Link
            href="/products"
            className="text-[13px] font-semibold text-gray-500 hover:text-[#171717] transition-colors hidden sm:flex items-center gap-1"
          >
            View All Categories
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
          {categories.map((cat, i) => (
            <Link
              key={cat.name}
              href={`/products?category=${cat.name.toLowerCase().replace(/\s+/g, "-")}`}
              className={`category-card animate-slide-up delay-${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
              <div className="overlay" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="font-[var(--font-heading)] text-[15px] font-bold text-white mb-0.5">
                  {cat.name}
                </h3>
                <span className="text-[12px] font-medium text-white/80 flex items-center gap-1">
                  Shop Now
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════ NEW ARRIVALS ═══════ */}
      <section className="max-w-[1300px] mx-auto px-6 py-6 md:py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-[var(--font-heading)] text-[24px] md:text-[28px] font-[800] tracking-[-0.01em] text-[#171717]">
            New Arrivals
          </h2>
          <Link
            href="/products"
            className="text-[13px] font-semibold text-gray-500 hover:text-[#171717] transition-colors hidden sm:block"
          >
            View All New Arrivals
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
          {newArrivals.map((item, i) => (
            <Link
              key={item.id}
              href={`/products/${item.id}`}
              className={`product-card relative group animate-slide-up delay-${i + 1}`}
            >
              <span className={`tag-badge ${item.tag === "New" ? "new" : "sale"}`}>
                {item.tag}
              </span>
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

              <div className="aspect-square bg-[#f8f8f8] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-3 md:p-4">
                <h3 className="font-[var(--font-heading)] text-[13px] font-semibold text-[#171717] mb-1 truncate">
                  {item.name}
                </h3>
                <div className="flex items-center gap-1 mb-2">
                  <span className="star text-[12px]">★</span>
                  <span className="text-[12px] font-medium text-gray-600">{item.rating}</span>
                  <span className="text-[12px] text-gray-400">({item.reviews})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-[var(--font-heading)] text-[15px] font-bold text-[#171717]">
                    ${item.price.toFixed(2)}
                  </span>
                  {item.oldPrice && (
                    <span className="text-[12px] text-gray-400 line-through">
                      ${item.oldPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════ BEST SELLERS ═══════ */}
      <section className="max-w-[1300px] mx-auto px-6 py-10 md:py-14">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-[var(--font-heading)] text-[24px] md:text-[28px] font-[800] tracking-[-0.01em] text-[#171717]">
            Best Sellers
          </h2>
          <Link
            href="/products"
            className="text-[13px] font-semibold text-gray-500 hover:text-[#171717] transition-colors hidden sm:block"
          >
            View All Best Sellers
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {bestSellers.map((item, i) => (
            <div
              key={item.id}
              className={`product-card p-4 flex gap-4 items-center animate-slide-up delay-${i + 1}`}
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-[#f8f8f8]">
                <span className="tag-badge sale !top-1.5 !left-1.5 !text-[9px] !px-2 !py-1">
                  Bestseller
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-[var(--font-heading)] text-[15px] font-bold text-[#171717] mb-1 truncate">
                  {item.name}
                </h3>
                <div className="flex items-center gap-1 mb-1.5">
                  <span className="star text-[12px]">★</span>
                  <span className="text-[12px] font-medium text-gray-600">{item.rating}</span>
                  <span className="text-[12px] text-gray-400">({item.reviews})</span>
                </div>
                <p className="text-[12px] text-gray-400 mb-2.5 line-clamp-1">{item.desc}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-[var(--font-heading)] text-[16px] font-bold text-[#171717]">
                    ${item.price.toFixed(2)}
                  </span>
                  <Link href={`/products/${item.id}`} className="quick-add-btn" aria-label="Quick add to cart">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="8" cy="21" r="1" />
                      <circle cx="19" cy="21" r="1" />
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ FLASH SALE + NEW COLLECTION ═══════ */}
      <section className="max-w-[1300px] mx-auto px-6 py-6 md:py-10">
        <div className="grid md:grid-cols-2 gap-5">
          {/* Flash Sale */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-dark)] p-8 md:p-10 flex flex-col justify-center min-h-[280px]">
            <span className="text-white/80 text-[12px] font-semibold uppercase tracking-[0.1em] mb-2">
              Flash Sale
            </span>
            <h3 className="font-[var(--font-heading)] text-[32px] md:text-[36px] font-[800] text-white leading-[1.05] tracking-[-0.02em] mb-5">
              Up To 70% Off
            </h3>
            <div className="flex gap-3 mb-7">
              {[
                { label: "Hours", value: timeLeft.h },
                { label: "Mins", value: timeLeft.m },
                { label: "Secs", value: timeLeft.s },
              ].map((t) => (
                <div key={t.label} className="timer-box">
                  <div className="font-[var(--font-heading)] text-[20px] font-[800] text-white">
                    {pad(t.value)}
                  </div>
                  <div className="text-[10px] text-white/70 uppercase tracking-[0.05em]">
                    {t.label}
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/products"
              className="inline-flex items-center justify-center bg-white text-[var(--color-brand-dark)] font-[var(--font-heading)] font-bold text-[13px] px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors w-fit"
            >
              Shop Sale Now
            </Link>
          </div>

          {/* New Collection */}
          <div className="relative rounded-2xl overflow-hidden bg-[#171717] min-h-[280px] flex items-end">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://picsum.photos/seed/summer-collection/700/500"
              alt="Summer 2025 collection"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            <div className="relative z-10 p-8 md:p-10">
              <span className="text-white/80 text-[12px] font-semibold uppercase tracking-[0.1em] mb-2 block">
                New Collection
              </span>
              <h3 className="font-[var(--font-heading)] text-[28px] md:text-[32px] font-[800] text-white leading-[1.05] tracking-[-0.02em] mb-5">
                Summer 2025
              </h3>
              <Link
                href="/products"
                className="inline-flex items-center justify-center bg-white text-[#171717] font-[var(--font-heading)] font-bold text-[13px] px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors w-fit"
              >
                Shop Collection
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ BOTTOM TRUST ROW ═══════ */}
      <section className="border-t border-gray-100">
        <div className="max-w-[1300px] mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { title: "Premium Quality", desc: "Made with the finest materials" },
            { title: "Fast Delivery", desc: "Quick and reliable shipping" },
            { title: "Secure Checkout", desc: "Your data is protected" },
            { title: "Customer Satisfaction", desc: "100% satisfaction guarantee" },
          ].map((item, i) => (
            <div key={item.title} className={`flex items-start gap-3 animate-slide-up delay-${i + 1}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <div>
                <h3 className="font-[var(--font-heading)] text-[13px] font-semibold text-[#171717]">
                  {item.title}
                </h3>
                <p className="text-[12px] text-gray-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
