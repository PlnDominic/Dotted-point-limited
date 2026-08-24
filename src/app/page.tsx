"use client";

import Link from "next/link";
import { useState } from "react";

/* ─── Data ─── */
const heroStats = [
  { value: "10+", label: "Years Experience" },
  { value: "500+", label: "Projects Completed" },
  { value: "100%", label: "Licensed & Insured" },
  { value: "24/7", label: "Site Support" },
];

const trustItems = [
  {
    title: "Licensed & Insured",
    desc: "Fully certified tradesmen",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Free Consultation",
    desc: "Site visit & project quote",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    title: "Quality Materials",
    desc: "Durable, trusted supplies",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m7.5 4.27 9 5.15" />
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
    ),
  },
  {
    title: "On-Time Delivery",
    desc: "Projects done to schedule",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
  },
];

const services = [
  { name: "Automated Gates", slug: "automated-gates", image: "/images/services/automated-gates.jpg", desc: "Motorized swing & sliding gates with remote access control.", cta: "View Service" },
  { name: "Garage Roller Shutters", slug: "roller-shutters", image: "/images/services/roller-shutters.jpg", desc: "Durable roller shutters for garages, shops and warehouses.", cta: "View Service" },
  { name: "Iron Mongering", slug: "iron-mongering", image: "/images/services/iron-mongering.jpg", desc: "Custom wrought iron gates, rails, grilles and fabrication.", cta: "View Service" },
  { name: "Plasterboard Ceiling", slug: "plasterboard-ceiling", image: "/images/services/plasterboard-ceiling.jpg", desc: "Suspended and plasterboard ceilings with clean, modern finishes.", cta: "View Service" },
  { name: "Painting & Decoration", slug: "painting-decoration", image: "/images/services/painting-decoration.jpg", desc: "Interior and exterior painting, finishing and decoration.", cta: "View Service" },
  { name: "Kitchen Cabinets", slug: "kitchen-cabinets", image: "/images/services/kitchen-cabinets.jpg", desc: "Bespoke fitted kitchen cabinets built to your space.", cta: "View Service" },
  { name: "Kitchen Sinks", slug: "kitchen-sinks", image: "/images/services/kitchen-sinks.jpg", desc: "Stainless steel & granite kitchen sinks and taps for sale.", cta: "Shop Now" },
  { name: "Bathroom Fittings", slug: "bathroom-fittings", image: "/images/services/bathroom-fittings.jpg", desc: "WC, baths, wash basins and taps for sale, supplied & fitted.", cta: "Shop Now" },
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

export default function Home() {
  const [liked, setLiked] = useState<Set<string>>(new Set());

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
            <span className="eyebrow uppercase">Proudly Ghanaian · Accra, Ghana</span>
            <h1 className="font-[var(--font-heading)] text-[38px] sm:text-[48px] lg:text-[54px] font-[800] leading-[1.08] tracking-[-0.02em] text-[#171717] mt-4 mb-5">
              We Build. We Fabricate.
              <br />
              We Finish.
            </h1>
            <p className="text-gray-500 text-[16px] leading-relaxed mb-8 max-w-[440px]">
              A full-service Ghanaian building, fabrication and interior
              finishing company — automated gates, roller shutters, iron
              mongering, plasterboard ceilings, painting and decoration,
              kitchen cabinets, plus kitchen sinks, WC, baths, taps and
              other sanitary ware for sale, backed by expert consulting.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <Link href="/products" className="btn-primary">
                Get a Free Quote
              </Link>
              <Link href="/products" className="btn-outline">
                View Our Services
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 max-w-[420px]">
              {heroStats.map((s) => (
                <div key={s.label}>
                  <p className="font-[var(--font-heading)] text-[18px] sm:text-[20px] font-[800] text-[#171717]">
                    {s.value}
                  </p>
                  <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Image + floating cards */}
          <div className="relative flex items-center justify-center py-8 lg:py-16">
            <div className="absolute w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] rounded-[40%] bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-dark)] opacity-90" />
            <div className="relative w-full max-w-[460px] aspect-[4/3] animate-scale-in">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/services/hero-building.jpg"
                alt="Our fabrication and building team at work"
                className="w-full h-full object-cover rounded-3xl shadow-2xl"
              />
            </div>

            {/* Floating chips */}
            <div className="floating-chip absolute top-4 left-0 sm:-left-6 animate-float">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/services/automated-gates.jpg" alt="Automated Gates" className="w-10 h-10 rounded-lg object-cover" />
              <div>
                <p className="text-[11px] font-semibold text-[#171717] leading-tight">Automated Gates</p>
                <p className="text-[11px] text-gray-400">Installed & serviced</p>
              </div>
            </div>

            <div className="floating-chip absolute bottom-8 right-0 sm:-right-6 animate-float delay-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/services/kitchen-cabinets.jpg" alt="Kitchen Cabinets" className="w-10 h-10 rounded-lg object-cover" />
              <div>
                <p className="text-[11px] font-semibold text-[#171717] leading-tight">Kitchen Cabinets</p>
                <p className="text-[11px] text-gray-400">Built to your space</p>
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

      {/* ═══════ OUR SERVICES ═══════ */}
      <section className="max-w-[1300px] mx-auto px-6 py-14 md:py-16">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {services.map((s, i) => (
            <Link
              key={s.slug}
              href={`/products?category=${s.slug}`}
              className={`category-card animate-slide-up delay-${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
              <div className="overlay" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="font-[var(--font-heading)] text-[14px] font-bold text-white mb-0.5 leading-tight">
                  {s.name}
                </h3>
                <span className="text-[12px] font-medium text-white/80 flex items-center gap-1">
                  {s.cta}
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
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-dark)] p-8 md:p-10 flex flex-col justify-center min-h-[280px]">
            <span className="text-white/80 text-[12px] font-semibold uppercase tracking-[0.1em] mb-2">
              Get Started
            </span>
            <h3 className="font-[var(--font-heading)] text-[30px] md:text-[34px] font-[800] text-white leading-[1.05] tracking-[-0.02em] mb-4">
              Free Site Consultation
            </h3>
            <ul className="space-y-1.5 mb-7 text-white/90 text-[13px]">
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
          <div className="relative rounded-2xl overflow-hidden bg-[#171717] min-h-[280px] flex items-end">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/services/fabrication.jpg"
              alt="Fabrication workshop"
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
            <div className="relative z-10 p-8 md:p-10">
              <span className="text-white/80 text-[12px] font-semibold uppercase tracking-[0.1em] mb-2 block">
                Our Portfolio
              </span>
              <h3 className="font-[var(--font-heading)] text-[28px] md:text-[32px] font-[800] text-white leading-[1.05] tracking-[-0.02em] mb-5">
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
