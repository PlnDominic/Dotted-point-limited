import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Account/cart/checkout/admin are per-visitor or gated pages — no
      // reason for a crawler to index them, and admin shouldn't be
      // discoverable this way at all.
      disallow: ["/admin", "/account", "/cart", "/checkout", "/auth"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
