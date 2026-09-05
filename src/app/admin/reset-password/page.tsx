"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  // The /auth/callback route exchanges the reset-link code for a session
  // before redirecting here, so by the time this page renders the user
  // should already be signed in as whoever the link was sent to. If
  // there's no session (link expired, or someone just typed this URL),
  // send them back to request a fresh one.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/admin/forgot-password");
      } else {
        setReady(true);
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setDone(true);
      setLoading(false);
      setTimeout(() => router.push("/admin"), 1500);
    }
  }

  if (!ready) return null;

  if (done) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md animate-scale-in">
          <h1 className="font-display text-3xl tracking-tight mb-4">
            Password Updated
          </h1>
          <p className="text-[var(--fg-secondary)] leading-relaxed">
            Taking you to the dashboard...
          </p>
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
            Set New Password
          </h1>
          <p className="text-[var(--fg-secondary)]">
            Choose a new password for your admin account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-8"
        >
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block font-display text-xs tracking-[0.15em] text-[var(--fg-muted)] mb-3"
            >
              New Password
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

          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block font-display text-xs tracking-[0.15em] text-[var(--fg-muted)] mb-3"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? "Updating..." : "Update Password"}
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
