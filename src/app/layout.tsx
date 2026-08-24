import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Dotted Point Limited — Building, Fabrication & Interior Finishing",
  description:
    "A Ghanaian building, fabrication and interior finishing company — automated gates, garage roller shutters, iron mongering, plasterboard ceilings, painting and decoration, kitchen cabinets, plus everything to construct an entire building: cement, reinforcement steel, concrete blocks, roofing sheets, timber, floor tiles, kitchen sinks, WC, baths, taps and more.",
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
                <div className="mb-4 bg-white inline-block px-2 py-1.5 rounded">
                  <Image
                    src="/logo.jpg"
                    alt="Dotted Point Limited"
                    width={162}
                    height={54}
                    className="h-[36px] w-auto object-contain"
                  />
                </div>
                <p className="text-gray-400 text-[13px] leading-relaxed mb-5 max-w-[240px]">
                  We build, we fabricate, we do interiors, building
                  finishing and consulting — end to end.
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

              {/* Services */}
              <div>
                <h3 className="font-[var(--font-heading)] text-[12px] font-bold tracking-[0.15em] text-gray-500 uppercase mb-4">
                  Services
                </h3>
                <ul className="space-y-2.5">
                  {["Automated Gates", "Roller Shutters", "Iron Mongering", "Kitchen Cabinets", "Kitchen Sinks", "Bathroom Fittings", "Building Materials"].map(
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

              {/* Support */}
              <div>
                <h3 className="font-[var(--font-heading)] text-[12px] font-bold tracking-[0.15em] text-gray-500 uppercase mb-4">
                  Support
                </h3>
                <ul className="space-y-2.5">
                  {["Contact Us", "Free Consultation", "Get a Quote", "FAQ", "Warranty"].map(
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
                  {["About Us", "Our Projects", "Careers", "Blog"].map(
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
                  Get project tips, completed work and consulting offers.
                </p>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 bg-white/10 border border-white/10 rounded-l-md px-4 py-2.5 text-[13px] text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30"
                  />
                  <button
                    className="bg-[var(--color-brand)] text-white px-4 font-bold text-[14px] hover:bg-[var(--color-brand-dark)] transition-colors rounded-r-md"
                    aria-label="Subscribe"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
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
