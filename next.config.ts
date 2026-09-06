import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product/service images live in Supabase Storage. Scoped to
    // *.supabase.co instead of a bare "**" wildcard — an unrestricted
    // remote pattern lets Next's image optimizer fetch (server-side)
    // whatever URL a caller passes it, which is a live SSRF surface the
    // moment any user-controlled URL reaches next/image.
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
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
