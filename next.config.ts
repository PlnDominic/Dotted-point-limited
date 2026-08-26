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
};

export default nextConfig;
