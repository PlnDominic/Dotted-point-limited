"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
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

    const { error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

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
            {mode === "signin" ? "Admin Sign In" : "Create Admin Account"}
          </h1>
          <p className="text-[var(--fg-secondary)]">
            {mode === "signin"
              ? "Sign in with your admin email and password."
              : "Create an account with email and password. Note: you'll only get into the dashboard if this email is on the admin allowlist."}
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
            {loading
              ? mode === "signin"
                ? "Signing In..."
                : "Creating Account..."
              : mode === "signin"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--fg-muted)] mt-8">
          {mode === "signin" ? (
            <>
              Need an admin account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError("");
                }}
                className="text-[var(--fg-primary)] underline hover:no-underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setError("");
                }}
                className="text-[var(--fg-primary)] underline hover:no-underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
