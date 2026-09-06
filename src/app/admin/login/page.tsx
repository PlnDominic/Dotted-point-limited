"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Security fix: this page used to also offer public self-signup
// ("Create Admin Account") right here. Anyone could use it to register
// an account for an admin's email address before that admin had ever
// signed up themselves — if Supabase Auth's "Confirm email" setting
// happened to be off, that handed them a working session under that
// email with nothing to prove they owned the inbox (is_admin() now
// requires a confirmed email too, as defense in depth — see
// supabase/schema.sql — but there's no reason to leave a public signup
// form sitting on the admin login page at all). Admin accounts should
// be created directly in the Supabase dashboard (Authentication →
// Users → Add user) and the email added to the `admins` table, not
// self-served here.
export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/admin");
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md animate-slide-up">
        <div className="mb-10">
          <div className="w-12 h-1 bg-[var(--accent)] mb-6" />
          <h1 className="font-display text-3xl md:text-4xl tracking-tight mb-3">
            Admin Sign In
          </h1>
          <p className="text-[var(--fg-secondary)]">
            Sign in with your admin email and password.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-8"
        >
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block font-display text-xs tracking-[0.15em] text-[var(--fg-muted)] mb-3"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="w-full bg-transparent border border-[var(--border)] px-4 py-3 text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block font-display text-xs tracking-[0.15em] text-[var(--fg-muted)] mb-3"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full bg-transparent border border-[var(--border)] px-4 py-3 text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors"
            />
            <Link
              href="/admin/forgot-password"
              className="block text-right text-xs text-[var(--fg-muted)] hover:text-[var(--fg-primary)] underline mt-2"
            >
              Forgot password?
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 mb-6 text-sm text-[var(--color-error)]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 text-base disabled:opacity-40"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
