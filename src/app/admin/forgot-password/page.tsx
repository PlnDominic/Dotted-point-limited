"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/admin/reset-password`,
    });

    // Don't reveal whether the email is a real (or admin) account — always
    // show the same "check your email" state either way.
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md animate-scale-in">
          <div className="w-16 h-16 bg-[var(--accent)] rounded-none flex items-center justify-center mx-auto mb-8">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <h1 className="font-display text-3xl tracking-tight mb-4">
            Check Your Email
          </h1>
          <p className="text-[var(--fg-secondary)] leading-relaxed mb-6">
            If <span className="font-medium text-[var(--fg-primary)]">{email}</span>{" "}
            is an admin account, we sent a link to reset your password.
          </p>
          <Link
            href="/admin/login"
            className="font-display text-sm tracking-widest text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md animate-slide-up">
        <div className="mb-10">
          <div className="w-12 h-1 bg-[var(--accent)] mb-6" />
          <h1 className="font-display text-3xl md:text-4xl tracking-tight mb-3">
            Reset Password
          </h1>
          <p className="text-[var(--fg-secondary)]">
            Enter your admin email and we&apos;ll send you a link to reset
            your password.
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
            {loading ? "Sending Link..." : "Send Reset Link"}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--fg-muted)] mt-8">
          <Link
            href="/admin/login"
            className="text-[var(--fg-primary)] underline hover:no-underline"
          >
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
