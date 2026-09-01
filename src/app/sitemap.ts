import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, created_at")
    .order("created_at", { ascending: false });

  const productEntries: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${SITE_URL}/products/${p.id}`,
    lastModified: p.created_at ? new Date(p.created_at) : undefined,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/products`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...productEntries,
  ];
}
