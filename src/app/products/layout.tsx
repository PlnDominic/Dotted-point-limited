import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All Products",
  description:
    "Browse automated gates, garage roller shutters, iron mongering, kitchen cabinets, bathroom fittings, building materials and more from Dotted Point Limited, Ghana.",
  alternates: { canonical: "/products" },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
