// Falls back to the site's default Vercel domain if NEXT_PUBLIC_SITE_URL
// isn't set — set that env var to your real (custom) domain if you have
// one, so absolute URLs in metadata/sitemap/robots point to the right
// place.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://dotted-point-limited.vercel.app";

export const SITE_NAME = "Dotted Point Limited";
