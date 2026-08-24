"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const announcements = [
  "Free Site Consultation",
  "Licensed & Insured Tradesmen",
  "We Build · We Fabricate · We Finish",
];

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  }

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Services" },
    { href: "/products?filter=projects", label: "Projects" },
  ];

  const categoryLinks = [
    { href: "/products?category=automated-gates", label: "Automated Gates" },
    { href: "/products?category=roller-shutters", label: "Garage Roller Shutters" },
    { href: "/products?category=iron-mongering", label: "Iron Mongering" },
    { href: "/products?category=plasterboard-ceiling", label: "Plasterboard Ceiling" },
    { href: "/products?category=painting-decoration", label: "Painting & Decoration" },
    { href: "/products?category=kitchen-cabinets", label: "Kitchen Cabinets" },
    { href: "/products?category=kitchen-sinks", label: "Kitchen Sinks" },
    { href: "/products?category=bathroom-fittings", label: "Bathroom Fittings" },
  ];

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-[#171717] text-white text-center py-2.5 px-4">
        <div className="max-w-[1300px] mx-auto flex items-center justify-center gap-3 text-[12px] font-medium tracking-[0.01em]">
          {announcements.map((item, i) => (
            <span key={item} className="flex items-center gap-3">
              <span className="opacity-90">{item}</span>
              {i < announcements.length - 1 && (
                <span className="w-1 h-1 rounded-full bg-white/30 hidden sm:inline-block" />
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Navbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <nav className="max-w-[1300px] mx-auto px-6 flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo.jpg"
              alt="Dotted Point Limited"
              width={162}
              height={54}
              priority
              className="h-[42px] w-auto object-contain"
            />
          </Link>

          {/* Center Nav — Desktop */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[14px] font-medium transition-colors relative py-1 ${
                  pathname === link.href
                    ? "text-[#171717]"
                    : "text-gray-500 hover:text-[#171717]"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Categories dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCategoriesOpen(true)}
              onMouseLeave={() => setCategoriesOpen(false)}
            >
              <button className="flex items-center gap-1 text-[14px] font-medium text-gray-500 hover:text-[#171717] transition-colors py-1">
                Our Services
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {categoriesOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-48 animate-fade-in">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 py-2">
                    {categoryLinks.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className="block px-4 py-2.5 text-[13px] font-medium text-gray-600 hover:text-[#171717] hover:bg-gray-50 transition-colors"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/products"
              className="text-[14px] font-medium text-gray-500 hover:text-[#171717] transition-colors"
            >
              About
            </Link>
            <Link
              href="/products"
              className="text-[14px] font-medium text-gray-500 hover:text-[#171717] transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/products"
              className="text-[14px] font-medium text-gray-500 hover:text-[#171717] transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-5">
            {/* Search */}
            <button
              className="text-gray-600 hover:text-[#171717] transition-colors"
              aria-label="Search"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>

            {/* Wishlist */}
            <button
              className="text-gray-600 hover:text-[#171717] transition-colors hidden sm:block"
              aria-label="Wishlist"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </button>

            {/* Account */}
            {user ? (
              <Link
                href="/account"
                className="text-gray-600 hover:text-[#171717] transition-colors hidden sm:block"
                aria-label="Account"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="5" />
                  <path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-[#171717] transition-colors hidden sm:block"
                aria-label="Sign in"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="5" />
                  <path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
              </Link>
            )}

            {/* Cart */}
            <Link
              href="/cart"
              className="relative text-gray-600 hover:text-[#171717] transition-colors"
              aria-label="Cart"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              <span className="absolute -top-2 -right-2.5 bg-[var(--color-brand)] text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                2
              </span>
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden text-gray-600 hover:text-[#171717]"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {mobileOpen ? (
                  <>
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </>
                ) : (
                  <>
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="6" y2="6" />
                    <line x1="4" x2="20" y1="18" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white animate-slide-up">
            <div className="px-6 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block py-3 text-[15px] font-medium border-b border-gray-50 ${
                    pathname === link.href ? "text-[#171717]" : "text-gray-500"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {categoryLinks.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 text-[15px] font-medium text-gray-500 border-b border-gray-50"
                >
                  {c.label}
                </Link>
              ))}
              {user ? (
                <button
                  onClick={() => { setMobileOpen(false); handleSignOut(); }}
                  className="block py-3 text-[15px] font-medium text-gray-500"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 text-[15px] font-medium text-[var(--color-brand)]"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
