import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types";

async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Product) ?? null;
}

function trimDescription(text: string, max = 160): string {
  const clean = text.trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "This item may have been removed or the link is incorrect.",
    };
  }

  const description = trimDescription(
    product.description ||
      `${product.name} — GH₵${product.price.toFixed(2)}. Shop building materials, fabrication and interior finishing supplies from Dotted Point Limited, Ghana.`
  );
  const images = product.image_url ? [{ url: product.image_url, alt: product.name }] : undefined;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${id}` },
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: product.name,
      description,
      images: product.image_url ? [product.image_url] : undefined,
    },
  };
}

export default async function ProductLayout({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  // Product structured data (schema.org) so search engines can show price,
  // stock, and rating directly in results. JSON.stringify doesn't escape
  // "<", so a description containing "</script>" could otherwise break out
  // of this tag — escape it explicitly before embedding.
  const jsonLd = product
    ? JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description || undefined,
        image: product.image_url || undefined,
        sku: product.id,
        category: product.category,
        offers: {
          "@type": "Offer",
          priceCurrency: "GHS",
          price: product.price,
          availability:
            product.stock > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
        },
        ...(product.rating && product.reviews_count
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: product.rating,
                reviewCount: product.reviews_count,
              },
            }
          : {}),
      }).replace(/</g, "\\u003c")
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      )}
      {children}
    </>
  );
}
