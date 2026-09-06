import type { NextConfig } from "next";

// Security fix: *.supabase.co matches every Supabase project's storage
// domain, not just this one — and /_next/image?url=... is a public,
// unauthenticated endpoint anyone can hit directly with any URL matching
// an allowed pattern, regardless of what images this app actually
// renders anywhere. That wildcard let an attacker have this app's own
// server fetch/process arbitrary content from ANY Supabase project's
// bucket, not just this site's own. Narrowed to the exact host this
// project's own images live on, derived from the same URL the app
// already uses to talk to Supabase (so it can't drift out of sync) —
// falls back to the wildcard only if that env var isn't set at build
// time (e.g. running next build locally without it configured).
const supabaseHostname = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : null;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: supabaseHostname ?? "*.supabase.co" },
    ],
  },

  // Baseline security headers — none were set before, so browsers fell
  // back to defaults with no hardening at all. A strict Content-Security-
  // Policy is deliberately NOT included here: getting one right for
  // Next.js's own inline bootstrap scripts needs a nonce wired through
  // middleware and real testing against every page, and a wrong CSP fails
  // (or silently breaks features) more easily than it protects — better
  // done as its own deliberate change than folded into a headers sweep.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Stops the browser from guessing a response's MIME type from
          // its content — e.g. treating an uploaded file as HTML/script
          // just because it sniffs like one, regardless of the
          // Content-Type actually served.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Nothing here needs to be framed by another site — blocks
          // clickjacking (an invisible iframe of this site laid under
          // attacker-controlled buttons to hijack real clicks).
          { key: "X-Frame-Options", value: "DENY" },
          // Cross-site navigations to this site still send the origin
          // (useful for referrer-based analytics/abuse checks elsewhere),
          // but never the full path+query — an order confirmation link
          // or password-reset URL won't leak into another site's logs
          // via the Referer header.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // This app never needs the camera, microphone, or the visitor's
          // location — deny them outright rather than leaving the
          // default (which lets an embedding context request them).
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
