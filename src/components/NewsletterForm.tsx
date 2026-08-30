"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setStatus("loading");
    setMessage("");

    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: trimmed });

    if (error) {
      // Unique-violation just means they're already on the list — treat
      // that as a success rather than an error.
      if (error.code === "23505") {
        setStatus("done");
        setMessage("You're already subscribed!");
      } else {
        console.error("Newsletter signup error:", error);
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
      return;
    }

    setStatus("done");
    setMessage("Thanks for subscribing!");
    setEmail("");
  }

  if (status === "done") {
    return (
      <p className="text-[13px] text-white/90 max-w-sm">✓ {message}</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm">
      <div className="flex">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          disabled={status === "loading"}
          className="flex-1 min-w-0 bg-white/10 border border-white/10 rounded-l-md px-4 py-2.5 text-[13px] text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          aria-label="Subscribe"
          className="bg-[var(--color-brand)] text-white px-4 font-bold text-[14px] hover:bg-[var(--color-brand-dark)] transition-colors rounded-r-md disabled:opacity-60"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
      {status === "error" && (
        <p className="text-[12px] text-red-400 mt-2">{message}</p>
      )}
    </form>
  );
}
