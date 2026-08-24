import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Dotted Point — Premium Tools & Building Materials",
  description:
    "Your destination for professional-grade tools, materials, and supplies. Quality, reliability, and comfort — all in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Navbar />
        <main id="main-content" className="flex-1">
          {children}
        </main>

        {/* ═══════ FOOTER ═══════ */}
        <footer className="bg-[#1a1a1a] text-white">
          <div className="max-w-[1300px] mx-auto px-6 py-14">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-8">
              {/* Brand */}
              <div className="col-span-2 md:col-span-1">
                <div className="mb-4">
                  <span className="font-[var(--font-heading)] text-[20px] font-[800] tracking-tight">
                    Dotted
                  </span>
                  <span className="font-[var(--font-heading)] text-[20px] font-[800] tracking-tight text-[#e8721a]">
                    Point
                  </span>
                </div>
                <p className="text-gray-400 text-[13px] leading-relaxed mb-5 max-w-[240px]">
                  Your destination for professional-grade tools and materials.
                  Quality, reliability, and comfort — all in one place.
                </p>
                {/* Social */}
                <div className="flex gap-3">
                  {["Instagram", "Facebook", "Twitter", "YouTube"].map(
                    (s) => (
                      <a
                        key={s}
                        href="#"
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-white/20 hover:text-white transition-colors text-[11px] font-bold"
                        aria-label={s}
                      >
                        {s[0]}
                      </a>
                    )
                  )}
                </div>
              </div>

              {/* Shop */}
              <div>
                <h3 className="font-[var(--font-heading)] text-[12px] font-bold tracking-[0.15em] text-gray-500 uppercase mb-4">
                  Shop
                </h3>
                <ul className="space-y-2.5">
                  {["All Products", "Power Tools", "Building Materials", "Safety Gear", "Sale"].map(
                    (link) => (
                      <li key={link}>
                        <Link
                          href="/products"
                          className="text-[13px] text-gray-400 hover:text-white transition-colors"
                        >
                          {link}
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Customer Care */}
              <div>
                <h3 className="font-[var(--font-heading)] text-[12px] font-bold tracking-[0.15em] text-gray-500 uppercase mb-4">
                  Customer Care
                </h3>
                <ul className="space-y-2.5">
                  {["Contact Us", "Shipping Info", "Returns & Exchanges", "FAQ", "Size Guide"].map(
                    (link) => (
                      <li key={link}>
                        <a
                          href="#"
                          className="text-[13px] text-gray-400 hover:text-white transition-colors"
                        >
                          {link}
                        </a>
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="font-[var(--font-heading)] text-[12px] font-bold tracking-[0.15em] text-gray-500 uppercase mb-4">
                  Company
                </h3>
                <ul className="space-y-2.5">
                  {["About Us", "Careers", "Sustainability", "Blog", "Store Locator"].map(
                    (link) => (
                      <li key={link}>
                        <a
                          href="#"
                          className="text-[13px] text-gray-400 hover:text-white transition-colors"
                        >
                          {link}
                        </a>
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Newsletter */}
              <div>
                <h3 className="font-[var(--font-heading)] text-[12px] font-bold tracking-[0.15em] text-gray-500 uppercase mb-4">
                  Newsletter
                </h3>
                <p className="text-[13px] text-gray-400 mb-4 leading-relaxed">
                  Get updates on new arrivals, exclusive offers and more.
                </p>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 bg-white/10 border border-white/10 px-4 py-2.5 text-[13px] text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30"
                  />
                  <button
                    className="bg-white text-[#1a1a1a] px-4 font-bold text-[14px] hover:bg-gray-200 transition-colors"
                    aria-label="Subscribe"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10">
            <div className="max-w-[1300px] mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-3">
              <p className="text-[12px] text-gray-500">
                © {new Date().getFullYear()} Dotted Point. All Rights Reserved.
              </p>
              <div className="flex gap-6">
                <a
                  href="#"
                  className="text-[12px] text-gray-500 hover:text-white transition-colors"
                >
                  Terms & Conditions
                </a>
                <a
                  href="#"
                  className="text-[12px] text-gray-500 hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
