"use client";

import Link from "next/link";
import { useState } from "react";

/* ─── Data ─── */
const homeCategories = [
  { label: "Automated Gates", slug: "automated-gates" },
  { label: "Roller Shutters", slug: "roller-shutters" },
  { label: "Iron Mongering", slug: "iron-mongering" },
  { label: "Kitchen Cabinets", slug: "kitchen-cabinets" },
  { label: "Bathroom Fittings", slug: "bathroom-fittings" },
  { label: "Shower Cubicle", slug: "shower-cubicle" },
  { label: "Building Materials", slug: "cement" },
  { label: "Building & Construction", slug: "building-and-construction" },
  { label: "Painting", slug: "painting" },
  { label: "Iron Metal Fabrication", slug: "iron-metal-fabrication" },
  { label: "Structural Works", slug: "structural-works" },
  { label: "Cabinet", slug: "cabinet" },
  { label: "Frameless Glass Balustrade", slug: "frameless-glass-balustrade" },
  { label: "Stainless Balustrade", slug: "stainless-balustrade" },
  { label: "Window Glazing", slug: "window-glazing" },
  { label: "Curtain Walls", slug: "curtain-walls" },
];

const services = [
  { name: "Automated Gates", slug: "automated-gates", image: "/images/services/automated-gates.jpg", desc: "Motorized swing & sliding gates with remote access control.", cta: "View Service" },
  { name: "Garage Roller Shutters", slug: "roller-shutters", image: "/images/services/roller-shutters.jpg", desc: "Durable roller shutters for garages, shops and warehouses.", cta: "View Service" },
  { name: "Iron Mongering", slug: "iron-mongering", image: "/images/services/iron-mongering.jpg", desc: "Custom wrought iron gates, rails, grilles and fabrication.", cta: "View Service" },
  { name: "Plasterboard Ceiling", slug: "plasterboard-ceiling", image: "/images/services/plasterboard-ceiling.jpg", desc: "Suspended and plasterboard ceilings with clean, modern finishes.", cta: "View Service" },
  { name: "Painting & Decoration", slug: "painting-decoration", image: "/images/services/painting-decoration.jpg", desc: "Interior and exterior painting, finishing and decoration.", cta: "View Service" },
  { name: "Kitchen Cabinets", slug: "kitchen-cabinets", image: "/images/services/kitchen-cabinets.jpg", desc: "Bespoke fitted kitchen cabinets built to your space.", cta: "View Service" },
];

const buildingMaterials = [
  { name: "Cement", slug: "cement", image: "/images/materials/cement.png", desc: "Portland cement for foundations, blockwork and plastering.", price: 89.99, originalPrice: 129.99, sold: "8.2K+", rating: 4.6, reviews: 1042 },
  { name: "Reinforcement Steel", slug: "reinforcement-steel", image: "/images/materials/reinforcement-steel.jpg", desc: "Rebar and binding wire for structural concrete work.", price: 349.5, originalPrice: 499.0, sold: "3.1K+", rating: 4.7, reviews: 588 },
  { name: "Concrete Blocks", slug: "concrete-blocks", image: "/images/materials/concrete-blocks.jpg", desc: "Sandcrete & hollow concrete blocks for walls and fencing.", price: 12.5, originalPrice: 18.0, sold: "15K+", rating: 4.5, reviews: 2034 },
  { name: "Roofing Sheets", slug: "roofing-sheets", image: "/images/materials/roofing-sheets.jpg", desc: "Aluminium & corrugated roofing sheets, nails and fittings.", price: 145.0, originalPrice: 210.0, sold: "6.4K+", rating: 4.4, reviews: 762 },
  { name: "Timber", slug: "timber", image: "/images/materials/timber.jpg", desc: "Sawn timber for roofing, formwork and carpentry.", price: 65.0, originalPrice: 95.0, sold: "9.7K+", rating: 4.3, reviews: 915 },
  { name: "Floor Tiles", slug: "floor-tiles", image: "/images/materials/floor-tiles.png", desc: "Ceramic & porcelain floor tiles, adhesive and grout.", price: 108.49, originalPrice: 193.99, sold: "15K+", rating: 4.6, reviews: 1173 },
  { name: "Plumbing Pipes & Fittings", slug: "plumbing-pipes", image: "/images/materials/plumbing-pipes.jpg", desc: "PVC pipes, elbows, tees and fittings for water & drainage.", price: 24.99, originalPrice: 39.99, sold: "12K+", rating: 4.5, reviews: 1301 },
  { name: "Electrical Cables", slug: "electrical-cables", image: "/images/materials/electrical-cables.jpg", desc: "Wiring cables, conduit and electrical accessories.", price: 54.78, originalPrice: 98.51, sold: "15K+", rating: 4.5, reviews: 887 },
  { name: "Kitchen Sinks", slug: "kitchen-sinks", image: "/images/services/kitchen-sinks.jpg", desc: "Stainless steel & granite kitchen sinks and taps for sale.", price: 326.71, originalPrice: 596.8, sold: "7K+", rating: 4.7, reviews: 815 },
  { name: "Bathroom Fittings", slug: "bathroom-fittings", image: "/images/services/bathroom-fittings.jpg", desc: "WC, baths, wash basins and taps for sale.", price: 435.39, originalPrice: 796.61, sold: "3.7K+", rating: 4.6, reviews: 166 },
  { name: "Water Tanks", slug: "water-tanks", image: "/images/materials/water-tanks.jpg", desc: "Polytanks and water storage tanks for homes & sites.", price: 39.32, originalPrice: 71.02, sold: "19K+", rating: 4.1, reviews: 769 },
  { name: "Switches & Sockets", slug: "switches-sockets", image: "/images/materials/switches-sockets.jpg", desc: "Wall switches, sockets and electrical accessories.", price: 18.99, originalPrice: 32.99, sold: "10K+", rating: 4.4, reviews: 640 },
];

const capabilities = [
  {
    name: "Building & Fabrication",
    image: "/images/services/fabrication.jpg",
    rating: "500+",
    ratingLabel: "projects built",
    desc: "From structural builds to custom metal fabrication, executed to spec and built to last.",
  },
  {
    name: "Interior Finishing & Consulting",
    image: "/images/services/kitchen-cabinets.jpg",
    rating: "10+",
    ratingLabel: "years experience",
    desc: "Full interior fit-outs, building finishing and expert project consulting from start to handover.",
  },
  {
    name: "Gate & Shutter Automation",
    image: "/images/services/automated-gates.jpg",
    rating: "24/7",
    ratingLabel: "site support",
    desc: "Automated gates, roller shutters and access control systems installed, wired and serviced.",
  },
];

const recentWork = [
  { title: "Automated Gate Installation", tag: "Residential", image: "/images/services/automated-gates.jpg" },
  { title: "Roller Shutter Fit-Out", tag: "Commercial", image: "/images/services/roller-shutters.jpg" },
  { title: "Ornamental Iron Gate", tag: "Fabrication", image: "/images/services/iron-mongering.jpg" },
  { title: "Plasterboard Ceiling", tag: "Renovation", image: "/images/services/plasterboard-ceiling.jpg" },
  { title: "Full Interior Repaint", tag: "Residential", image: "/images/services/painting-decoration.jpg" },
  { title: "Fitted Kitchen Cabinets", tag: "Interior", image: "/images/services/kitchen-cabinets.jpg" },
];

function formatGHS(value: number) {
  return `GH₵${value.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i + 1 <= Math.round(rating);
        return (
          <svg
            key={i}
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill={filled ? "#f59e0b" : "none"}
            stroke="#f59e0b"
            strokeWidth="1.5"
          >
            <path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2Z" />
          </svg>
        );
      })}
    </div>
  );
}

export default function Home() {
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState("all");

  function toggleLike(id: string) {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filteredMaterials =
    activeCategory === "all"
      ? buildingMaterials
      : buildingMaterials.filter((m) => m.slug === activeCategory);

  const filteredServices =
    activeCategory === "all"
      ? services
      : services.filter((s) => s.slug === activeCategory);

  return (
    <div>
      {/* ═══════ HERO ═══════ */}
      <section className="relative overflow-hidden h-[260px] lg:h-[340px]">
        {/* Full-bleed background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/services/hero-main.png"
          alt="Modern two-storey house with automated gate and driveway"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Darken for text legibility */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Text overlay */}
        <div className="relative z-10 h-full max-w-[1300px] mx-auto px-6 flex flex-col items-center justify-center text-center animate-slide-up">
          <h1 className="font-[var(--font-heading)] text-[22px] sm:text-[28px] font-[800] tracking-tight leading-[1.15] text-white mb-2 uppercase drop-shadow-md">
            Building &amp; Fabrication
          </h1>
          <p className="text-white/90 text-[12px] sm:text-[14px] leading-relaxed mb-4 max-w-[380px] drop-shadow-md">
            Gates, roofing sheets, kitchen cabinets &amp; every material to
            build your home
          </p>
          <Link href="/products" className="btn-dark">
            Shop Now
          </Link>
        </div>
      </section>

      {/* ═══════ CATEGORY FILTER ═══════ */}
      <section className="border-b border-gray-100">
        <div className="max-w-[1300px] mx-auto px-6 py-4 flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveCategory("all")}
            className={`font-[var(--font-heading)] text-[13px] font-semibold px-5 py-2.5 whitespace-nowrap shrink-0 transition-colors ${
              activeCategory === "all"
                ? "bg-[#171717] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-[#171717]"
            }`}
          >
            All
          </button>
          {homeCategories.map((c) => (
            <button
              key={c.slug}
              onClick={() => setActiveCategory(c.slug)}
              className={`font-[var(--font-heading)] text-[13px] font-semibold px-5 py-2.5 whitespace-nowrap shrink-0 transition-colors ${
                activeCategory === c.slug
                  ? "bg-[#171717] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-[#171717]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      {/* ═══════ AMAZING OFFERS ═══════ */}
      <section className="max-w-[1300px] mx-auto px-6 pt-6 pb-14 md:pt-8 md:pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-[var(--font-heading)] text-[22px] md:text-[26px] font-[800] tracking-[-0.01em] text-[#171717]">
            Amazing offer
          </h2>
          <Link
            href="/products?filter=materials"
            className="text-[13px] font-semibold text-gray-500 hover:text-[#171717] transition-colors hidden sm:flex items-center gap-1"
          >
            View All
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
        {filteredMaterials.length === 0 ? (
          <p className="text-[13px] text-gray-400 py-8 text-center">
            No offers in this category yet — check back soon.
          </p>
        ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
          {filteredMaterials.map((m, i) => {
            const discount = Math.round(
              ((m.originalPrice - m.price) / m.originalPrice) * 100
            );
            return (
              <Link
                key={m.slug}
                href={`/products?category=${m.slug}`}
                className={`group block bg-white border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow animate-slide-up delay-${i + 1}`}
              >
                <div className="aspect-square overflow-hidden bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.image}
                    alt={m.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-[12.5px] text-[#171717] leading-snug mb-0.5 line-clamp-2 min-h-[32px]">
                    {m.name}
                  </h3>
                  <div className="flex items-baseline gap-1.5 flex-wrap mb-0.5">
                    <span className="text-[15px] font-bold text-[#171717]">
                      {formatGHS(m.price)}
                    </span>
                    <span className="text-[11px] text-gray-400 line-through">
                      {formatGHS(m.originalPrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10.5px] text-gray-400">
                      {m.sold} sold
                    </span>
                    <span className="text-[10.5px] font-bold text-white bg-orange-500 rounded px-1.5 py-0.5">
                      -{discount}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <StarRating rating={m.rating} />
                      <span className="text-[10.5px] text-gray-400">
                        ({m.reviews.toLocaleString()})
                      </span>
                    </div>
                    <span
                      className="flex items-center justify-center w-6 h-6 rounded-full bg-[#171717] text-white shrink-0"
                      aria-label="Add to cart"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="8" cy="21" r="1" />
                        <circle cx="19" cy="21" r="1" />
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        )}
      </section>

      {/* ═══════ OUR SERVICES ═══════ */}
      <section className="max-w-[1300px] mx-auto px-6 py-6 md:py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-[var(--font-heading)] text-[24px] md:text-[28px] font-[800] tracking-[-0.01em] text-[#171717]">
            Our Services & Supplies
          </h2>
          <Link
            href="/products"
            className="text-[13px] font-semibold text-gray-500 hover:text-[#171717] transition-colors hidden sm:flex items-center gap-1"
          >
            View All
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
        {filteredServices.length === 0 ? (
          <p className="text-[13px] text-gray-400 py-8 text-center">
            No services in this category yet — check back soon.
          </p>
        ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {filteredServices.map((s, i) => (
            <Link
              key={s.slug}
              href={`/products?category=${s.slug}`}
              className={`category-card animate-slide-up delay-${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
              <div className="overlay" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5">
                <h3 className="font-[var(--font-heading)] text-[11px] sm:text-[12px] font-bold text-white mb-0.5 leading-tight">
                  {s.name}
                </h3>
                <span className="text-[10px] font-medium text-white/80 flex items-center gap-1">
                  {s.cta}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
        )}
      </section>

      {/* ═══════ RECENT WORK ═══════ */}
      <section className="max-w-[1300px] mx-auto px-6 py-6 md:py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-[var(--font-heading)] text-[24px] md:text-[28px] font-[800] tracking-[-0.01em] text-[#171717]">
            Recent Work
          </h2>
          <Link
            href="/products"
            className="text-[13px] font-semibold text-gray-500 hover:text-[#171717] transition-colors hidden sm:block"
          >
            View Full Portfolio
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
          {recentWork.map((item, i) => (
            <div
              key={item.title}
              className={`product-card relative group animate-slide-up delay-${i + 1}`}
            >
              <span className="tag-badge new">{item.tag}</span>
              <button
                onClick={() => toggleLike(item.title)}
                className={`heart-btn ${liked.has(item.title) ? "active" : ""}`}
                aria-label="Save project"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={liked.has(item.title) ? "#ef4444" : "none"}
                  stroke={liked.has(item.title) ? "#ef4444" : "#999"}
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
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-3 md:p-4">
                <h3 className="font-[var(--font-heading)] text-[13px] font-semibold text-[#171717] leading-snug">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ WHAT WE DO BEST ═══════ */}
      <section className="max-w-[1300px] mx-auto px-6 py-10 md:py-14">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-[var(--font-heading)] text-[24px] md:text-[28px] font-[800] tracking-[-0.01em] text-[#171717]">
            What We Do Best
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {capabilities.map((item, i) => (
            <div
              key={item.name}
              className={`product-card p-4 flex gap-4 items-center animate-slide-up delay-${i + 1}`}
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-[#f8f8f8]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-[var(--font-heading)] text-[15px] font-bold text-[#171717] mb-1 leading-tight">
                  {item.name}
                </h3>
                <p className="text-[12px] text-gray-400 mb-2.5 line-clamp-2">{item.desc}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-[var(--font-heading)] text-[13px] font-bold text-[var(--color-brand)]">
                    {item.rating}
                    <span className="text-gray-400 font-medium"> {item.ratingLabel}</span>
                  </span>
                  <Link href="/products" className="quick-add-btn" aria-label="Learn more">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ CONSULTATION + PORTFOLIO CTA ═══════ */}
      <section className="max-w-[1300px] mx-auto px-6 py-6 md:py-10">
        <div className="grid md:grid-cols-2 gap-5">
          {/* Free Consultation */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-dark)] p-6 md:p-8 flex flex-col justify-center min-h-[200px]">
            <span className="text-white/80 text-[12px] font-semibold uppercase tracking-[0.1em] mb-2">
              Get Started
            </span>
            <h3 className="font-[var(--font-heading)] text-[24px] md:text-[28px] font-[800] text-white leading-[1.05] tracking-[-0.02em] mb-3">
              Free Site Consultation
            </h3>
            <ul className="space-y-1 mb-5 text-white/90 text-[13px]">
              {["No-obligation project quote", "Experienced on-site consulting", "Transparent, upfront pricing"].map((li) => (
                <li key={li} className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {li}
                </li>
              ))}
            </ul>
            <Link
              href="/products"
              className="inline-flex items-center justify-center bg-white text-[var(--color-brand-dark)] font-[var(--font-heading)] font-bold text-[13px] px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors w-fit"
            >
              Book a Consultation
            </Link>
          </div>

          {/* Portfolio */}
          <div className="relative rounded-2xl overflow-hidden bg-[#171717] min-h-[200px] flex items-end">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/services/fabrication.jpg"
              alt="Fabrication workshop"
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
            <div className="relative z-10 p-6 md:p-8">
              <span className="text-white/80 text-[12px] font-semibold uppercase tracking-[0.1em] mb-2 block">
                Our Portfolio
              </span>
              <h3 className="font-[var(--font-heading)] text-[22px] md:text-[26px] font-[800] text-white leading-[1.05] tracking-[-0.02em] mb-4">
                See Our Completed Projects
              </h3>
              <Link
                href="/products"
                className="inline-flex items-center justify-center bg-white text-[#171717] font-[var(--font-heading)] font-bold text-[13px] px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors w-fit"
              >
                View Portfolio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ BOTTOM TRUST ROW ═══════ */}
      <section className="border-t border-gray-100">
        <div className="max-w-[1300px] mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { title: "Premium Materials", desc: "Sourced from trusted suppliers" },
            { title: "Skilled Craftsmen", desc: "Experienced, certified tradesmen" },
            { title: "Timely Delivery", desc: "Projects completed on schedule" },
            { title: "Customer Satisfaction", desc: "Consulting through to handover" },
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
