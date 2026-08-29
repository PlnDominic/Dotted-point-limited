"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Product, RecentWorkItem, Capability, HeroContent, Order, OrderItem } from "@/types";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";

const CATEGORIES = [
  { value: "automated-gates", label: "Automated Gates" },
  { value: "roller-shutters", label: "Garage Roller Shutters" },
  { value: "iron-mongering", label: "Iron Mongering" },
  { value: "plasterboard-ceiling", label: "Plasterboard Ceiling" },
  { value: "painting-decoration", label: "Painting & Decoration" },
  { value: "kitchen-cabinets", label: "Kitchen Cabinets" },
  { value: "kitchen-sinks", label: "Kitchen Sinks" },
  { value: "bathroom-fittings", label: "Bathroom Fittings" },
  { value: "shower-cubicle", label: "Shower Cubicle" },
  { value: "concrete-blocks", label: "Building Materials" },
  { value: "building-and-construction", label: "Building & Construction" },
  { value: "painting", label: "Painting" },
  { value: "iron-metal-fabrication", label: "Iron Metal Fabrication" },
  { value: "structural-works", label: "Structural Works" },
  { value: "cabinet", label: "Cabinet" },
  { value: "frameless-glass-balustrade", label: "Frameless Glass Balustrade" },
  { value: "stainless-balustrade", label: "Stainless Balustrade" },
  { value: "window-glazing", label: "Window Glazing" },
  { value: "curtain-walls", label: "Curtain Walls" },
  { value: "power-tools", label: "Power Tools" },
  { value: "safety", label: "Safety" },
  { value: "plumbing-electrical", label: "Plumbing & Electrical" },
  { value: "hardware", label: "Hardware" },
];

const EMPTY_PRODUCT_FORM = {
  id: "",
  name: "",
  description: "",
  price: 0,
  original_price: 0,
  image_urls: [] as string[], // already-uploaded images (populated when editing)
  image_files: [] as File[], // newly picked, not yet uploaded
  category: "",
  stock: 0,
  product_type: "material" as "material" | "service",
  sold_count: "",
  rating: 0,
  reviews_count: 0,
  cta_label: "View Service",
};

const EMPTY_RECENT_WORK_FORM = {
  id: "",
  title: "",
  tag: "",
  image_url: "",
  image_file: null as File | null,
};

const EMPTY_CAPABILITY_FORM = {
  id: "",
  name: "",
  image_url: "",
  image_file: null as File | null,
  rating: "",
  rating_label: "",
  description: "",
};

type Tab = "products" | "orders" | "recent-work" | "capabilities" | "hero";

export default function AdminPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("products");
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      // RLS on `admins` only allows an admin's own row to be read, so a
      // non-admin signed-in user simply gets an empty result here.
      const { data } = await supabase
        .from("admins")
        .select("email")
        .eq("email", user.email)
        .maybeSingle();
      setIsAdmin(!!data);
      setLoading(false);
    }
    checkAdmin();
  }, [user]);

  async function uploadImage(file: File, folder: string): Promise<string | null> {
    const path = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const { data, error } = await supabase.storage.from("products").upload(path, file);
    if (error) {
      console.error("Upload error:", error);
      return null;
    }
    const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(data.path);
    return publicUrl;
  }

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-[1300px] mx-auto">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="animate-pulse bg-white rounded h-48" />
              ))}
            </div>
          ) : !user ? (
            <div className="text-center my-12">
              <Link href="/admin/login" className="btn-dark">
                Sign in to access admin
              </Link>
            </div>
          ) : (
            <div className="text-center my-12">
              <p className="text-gray-500 text-[14px] mb-4">
                Signed in as {user.email}, but this account isn&apos;t on the
                admin list.
              </p>
              <Link href="/" className="btn-dark">
                Back to site
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  const TABS: { value: Tab; label: string }[] = [
    { value: "products", label: "Products" },
    { value: "orders", label: "Orders" },
    { value: "recent-work", label: "Recent Work" },
    { value: "capabilities", label: "What We Do Best" },
    { value: "hero", label: "Homepage Hero" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 py-3 sm:h-[64px] flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link href="/" className="flex items-center shrink-0">
              <span className="text-[15px] sm:text-[16px] font-bold text-[#171717]">Admin</span>
            </Link>
            <span className="text-gray-500 text-[11px] sm:text-[12px] truncate hidden sm:inline">
              Logged in as: {user.email ?? "unknown"}
            </span>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-gray-500 hover:text-black px-3 sm:px-4 py-2 rounded text-[13px] hover:bg-gray-100 transition-colors shrink-0"
            aria-label="Sign out"
          >
            Sign Out
          </button>
          <span className="text-gray-500 text-[11px] w-full sm:hidden truncate">
            Logged in as: {user.email ?? "unknown"}
          </span>
        </div>
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 flex gap-1 border-t border-gray-50 overflow-x-auto scrollbar-hide">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-3 sm:px-4 py-3 text-[12px] sm:text-[13px] font-semibold border-b-2 whitespace-nowrap shrink-0 transition-colors ${
                tab === t.value
                  ? "border-[var(--color-brand)] text-[#171717]"
                  : "border-transparent text-gray-500 hover:text-[#171717]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-[1300px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {tab === "products" && <ProductsTab supabase={supabase} uploadImage={uploadImage} />}
        {tab === "orders" && <OrdersTab supabase={supabase} />}
        {tab === "recent-work" && <RecentWorkTab supabase={supabase} uploadImage={uploadImage} />}
        {tab === "capabilities" && <CapabilitiesTab supabase={supabase} uploadImage={uploadImage} />}
        {tab === "hero" && <HeroTab supabase={supabase} uploadImage={uploadImage} />}
      </main>
    </div>
  );
}

/* ═══════════════════════════ Products ═══════════════════════════ */

function ProductsTab({
  supabase,
  uploadImage,
}: {
  supabase: ReturnType<typeof createClient>;
  uploadImage: (file: File, folder: string) => Promise<string | null>;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"view" | "add" | "edit">("view");
  const [form, setForm] = useState(EMPTY_PRODUCT_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setProducts(data ?? []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const uploadedUrls = (
      await Promise.all(form.image_files.map((file) => uploadImage(file, "products")))
    ).filter((url): url is string => !!url);
    const allImages = [...form.image_urls, ...uploadedUrls];

    const productData = {
      name: form.name,
      description: form.description,
      price: form.price,
      original_price: form.product_type === "material" ? form.original_price || form.price : null,
      image_url: allImages[0] ?? "",
      image_urls: allImages,
      category: form.category,
      stock: form.stock,
      product_type: form.product_type,
      sold_count: form.product_type === "material" ? form.sold_count : null,
      rating: form.product_type === "material" ? form.rating : null,
      reviews_count: form.product_type === "material" ? form.reviews_count : null,
      cta_label: form.product_type === "service" ? form.cta_label : null,
    };

    const { error } =
      mode === "add"
        ? await supabase.from("products").insert([productData])
        : await supabase.from("products").update(productData).eq("id", form.id);

    if (error) console.error(error);
    setSaving(false);
    setMode("view");
    setForm(EMPTY_PRODUCT_FORM);
    fetchProducts();
  }

  function editProduct(product: Product) {
    setForm({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      original_price: product.original_price ?? product.price,
      image_urls:
        product.image_urls && product.image_urls.length > 0
          ? product.image_urls
          : product.image_url
          ? [product.image_url]
          : [],
      image_files: [],
      category: product.category,
      stock: product.stock,
      product_type: product.product_type,
      sold_count: product.sold_count ?? "",
      rating: product.rating ?? 0,
      reviews_count: product.reviews_count ?? 0,
      cta_label: product.cta_label ?? "View Service",
    });
    setMode("edit");
  }

  async function deleteProduct(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) console.error(error);
    fetchProducts();
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="font-[var(--font-heading)] text-[24px] text-[#1a1a1a]">
            Products
          </h2>
          <p className="text-[13px] text-gray-500">
            Materials show in the homepage&apos;s &quot;Amazing offer&quot; grid and
            services show in &quot;Our Services &amp; Supplies&quot; — both also
            list on /products.
          </p>
        </div>
        {mode === "view" && (
          <button
            onClick={() => setMode("add")}
            className="w-full sm:w-auto bg-[var(--color-brand)] text-white px-4 py-2 rounded text-[13px] hover:bg-[var(--color-brand-dark)] transition-colors shrink-0"
          >
            Add Product
          </button>
        )}
      </div>

      {mode !== "view" && (
        <div className="bg-white rounded-xl p-6 mb-8 shadow-md">
          <h3 className="font-[var(--font-heading)] text-[18px] mb-4">
            {mode === "add" ? "Add New Product" : "Edit Product"}
          </h3>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="flex gap-2">
              {(["material", "service"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, product_type: t }))}
                  className={`px-4 py-2 rounded text-[13px] font-semibold ${
                    form.product_type === t
                      ? "bg-[#171717] text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {t === "material" ? "Material (priced)" : "Service (tile)"}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                Product Name
              </label>
              <input
                placeholder="e.g. Automated Sliding Gate"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                className="w-full px-3 py-2 border rounded text-[14px]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                Description
              </label>
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border rounded text-[14px] h-20 resize-y"
              />
            </div>

            <div>
              <label className="text-[12px] text-gray-500 mb-1 block">
                Images (first one is the cover shown in listings)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  setForm((prev) => ({ ...prev, image_files: [...prev.image_files, ...files] }));
                  e.target.value = "";
                }}
                className="w-full px-3 py-2 border rounded text-[14px] cursor-pointer"
              />
              {(form.image_urls.length > 0 || form.image_files.length > 0) && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.image_urls.map((url, i) => (
                    <div key={`existing-${url}-${i}`} className="relative w-20 h-20 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center py-0.5">
                          Cover
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            image_urls: prev.image_urls.filter((_, idx) => idx !== i),
                          }))
                        }
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[11px] leading-none flex items-center justify-center"
                        aria-label={`Remove image ${i + 1}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {form.image_files.map((file, i) => (
                    <div key={`new-${file.name}-${i}`} className="relative w-20 h-20 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New image ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {form.image_urls.length === 0 && i === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center py-0.5">
                          Cover
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            image_files: prev.image_files.filter((_, idx) => idx !== i),
                          }))
                        }
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[11px] leading-none flex items-center justify-center"
                        aria-label={`Remove new image ${i + 1}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                required
                className="w-full px-3 py-2 border rounded text-[14px]"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Price (GH₵)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                  required
                  className="w-full px-3 py-2 border rounded text-[14px]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.stock}
                  onChange={(e) => setForm((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                  required
                  className="w-full px-3 py-2 border rounded text-[14px]"
                />
              </div>
            </div>

            {form.product_type === "material" ? (
              <>
                <p className="text-[12px] text-gray-400 -mb-2">
                  Shown on the homepage&apos;s Amazing Offer card
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                      Original Price (GH₵)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="For discount badge, optional"
                      value={form.original_price}
                      onChange={(e) => setForm((prev) => ({ ...prev, original_price: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border rounded text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                      Sold Count
                    </label>
                    <input
                      placeholder="e.g. 8.2K+"
                      value={form.sold_count}
                      onChange={(e) => setForm((prev) => ({ ...prev, sold_count: e.target.value }))}
                      className="w-full px-3 py-2 border rounded text-[14px]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                      Rating (0-5)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      placeholder="e.g. 4.4"
                      value={form.rating}
                      onChange={(e) => setForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border rounded text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                      Reviews Count
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 762"
                      value={form.reviews_count}
                      onChange={(e) => setForm((prev) => ({ ...prev, reviews_count: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border rounded text-[14px]"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <p className="text-[12px] text-gray-400 mb-1">
                  Shown on the homepage&apos;s Our Services &amp; Supplies tile
                </p>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Button Label
                </label>
                <input
                  placeholder="e.g. View Service"
                  value={form.cta_label}
                  onChange={(e) => setForm((prev) => ({ ...prev, cta_label: e.target.value }))}
                  className="w-full px-3 py-2 border rounded text-[14px]"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[var(--color-brand)] text-white py-2 rounded text-[13px] hover:bg-[var(--color-brand-dark)] transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : mode === "add" ? "Create" : "Update"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("view");
                  setForm(EMPTY_PRODUCT_FORM);
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded text-[13px] hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded h-48" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-gray-500 text-[14px] py-12 text-center">
          No products found. Add your first product above.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => (
            <div key={product.id} className="product-card relative bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image_url || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-3">
                <span className="text-[10px] uppercase font-bold text-[var(--color-brand)]">
                  {product.product_type}
                </span>
                <h3 className="font-[var(--font-heading)] text-[13px] font-semibold text-[#1a1a1a]">
                  {product.name}
                </h3>
                <p className="text-[12px] text-gray-400 capitalize mb-1">
                  {product.category}
                </p>
                <p className="font-[var(--font-heading)] text-[15px] font-bold text-[#1a1a1a]">
                  GH₵{product.price.toFixed(2)}
                </p>
                <p className="text-[11px] text-gray-400">Stock: {product.stock}</p>
              </div>
              <div className="absolute top-3 right-3 flex gap-2 bg-white/90 rounded px-2 py-1">
                <button
                  onClick={() => editProduct(product)}
                  className="text-[12px] text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="text-[12px] text-red-600 hover:text-red-800 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ Orders ═══════════════════════════ */

const ORDER_STATUSES = ["pending", "paid", "shipped", "delivered"] as const;

const ORDER_STATUS_STYLES: Record<(typeof ORDER_STATUSES)[number], string> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
};

type OrderWithItems = Order & {
  items: (OrderItem & { product: Product | null })[];
};

function OrdersTab({
  supabase,
}: {
  supabase: ReturnType<typeof createClient>;
}) {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | (typeof ORDER_STATUSES)[number]>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, items:order_items(*, product:products(*))")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setOrders((data as OrderWithItems[]) ?? []);
    setLoading(false);
  }

  async function updateStatus(orderId: string, status: (typeof ORDER_STATUSES)[number]) {
    setUpdatingId(orderId);
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) {
      console.error(error);
    } else {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    }
    setUpdatingId(null);
  }

  const filteredOrders =
    statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);

  const counts = ORDER_STATUSES.reduce(
    (acc, s) => ({ ...acc, [s]: orders.filter((o) => o.status === s).length }),
    {} as Record<(typeof ORDER_STATUSES)[number], number>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="font-[var(--font-heading)] text-[24px] text-[#1a1a1a]">
            Orders
          </h2>
          <p className="text-[13px] text-gray-500">
            Placed at checkout, with the customer&apos;s shipping details attached.
          </p>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6">
        <button
          onClick={() => setStatusFilter("all")}
          className={`font-[var(--font-heading)] text-[12px] sm:text-[13px] font-semibold px-3 sm:px-5 py-1.5 sm:py-2.5 whitespace-nowrap shrink-0 transition-colors ${
            statusFilter === "all"
              ? "bg-[var(--color-burgundy)] text-white"
              : "bg-[var(--color-burgundy-light)] text-[var(--color-burgundy)] hover:bg-[var(--color-burgundy)] hover:text-white"
          }`}
        >
          All ({orders.length})
        </button>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`font-[var(--font-heading)] text-[12px] sm:text-[13px] font-semibold px-3 sm:px-5 py-1.5 sm:py-2.5 whitespace-nowrap shrink-0 capitalize transition-colors ${
              statusFilter === s
                ? "bg-[var(--color-burgundy)] text-white"
                : "bg-[var(--color-burgundy-light)] text-[var(--color-burgundy)] hover:bg-[var(--color-burgundy)] hover:text-white"
            }`}
          >
            {s} ({counts[s]})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded h-24" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <p className="text-gray-500 text-[14px] py-12 text-center">
          {statusFilter === "all" ? "No orders yet." : `No ${statusFilter} orders.`}
        </p>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isExpanded = expandedId === order.id;
            return (
              <div key={order.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="w-full flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-[var(--font-heading)] text-[13px] font-bold text-[#1a1a1a]">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${ORDER_STATUS_STYLES[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-500 mt-0.5 truncate">
                      {order.shipping_name || "Unnamed customer"}
                      {order.shipping_phone ? ` · ${order.shipping_phone}` : ""}
                      {" · "}
                      {new Date(order.created_at).toLocaleDateString("en-GH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-[var(--font-heading)] text-[15px] font-bold text-[#1a1a1a]">
                      GH₵{order.total.toFixed(2)}
                    </span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 grid md:grid-cols-2 gap-6">
                    {/* Shipping details */}
                    <div>
                      <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.08em] mb-2">
                        Shipping Details
                      </h4>
                      <dl className="text-[13px] text-gray-700 space-y-1">
                        <div className="flex gap-2">
                          <dt className="text-gray-400 shrink-0 w-16">Name</dt>
                          <dd>{order.shipping_name || "—"}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="text-gray-400 shrink-0 w-16">Email</dt>
                          <dd className="break-all">{order.shipping_email || "—"}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="text-gray-400 shrink-0 w-16">Phone</dt>
                          <dd>{order.shipping_phone || "—"}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="text-gray-400 shrink-0 w-16">Address</dt>
                          <dd>
                            {order.shipping_address || "—"}
                            {order.shipping_city ? `, ${order.shipping_city}` : ""}
                            {order.shipping_region ? `, ${order.shipping_region}` : ""}
                          </dd>
                        </div>
                        {order.shipping_notes && (
                          <div className="flex gap-2">
                            <dt className="text-gray-400 shrink-0 w-16">Notes</dt>
                            <dd>{order.shipping_notes}</dd>
                          </div>
                        )}
                      </dl>

                      <div className="mt-4">
                        <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                          Update Status
                        </label>
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) =>
                            updateStatus(order.id, e.target.value as (typeof ORDER_STATUSES)[number])
                          }
                          className="w-full sm:w-48 px-3 py-2 border rounded text-[14px] disabled:opacity-50"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s} className="capitalize">
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Items */}
                    <div>
                      <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.08em] mb-2">
                        Items
                      </h4>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 text-[13px]">
                            <div className="w-10 h-10 bg-gray-50 overflow-hidden shrink-0">
                              {item.product?.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={item.product.image_url}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : null}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate">{item.product?.name ?? "Deleted product"}</p>
                              <p className="text-gray-400 text-[11px]">
                                Qty {item.quantity} × GH₵{item.price.toFixed(2)}
                              </p>
                            </div>
                            <p className="font-semibold shrink-0">
                              GH₵{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ Recent Work ═══════════════════════════ */

function RecentWorkTab({
  supabase,
  uploadImage,
}: {
  supabase: ReturnType<typeof createClient>;
  uploadImage: (file: File, folder: string) => Promise<string | null>;
}) {
  const [items, setItems] = useState<RecentWorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"view" | "add" | "edit">("view");
  const [form, setForm] = useState(EMPTY_RECENT_WORK_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchItems() {
    const { data, error } = await supabase
      .from("recent_work")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setItems(data ?? []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    let imageUrl = form.image_url;
    if (form.image_file) {
      const uploaded = await uploadImage(form.image_file, "recent-work");
      if (uploaded) imageUrl = uploaded;
    }
    const rowData = { title: form.title, tag: form.tag, image_url: imageUrl };

    const { error } =
      mode === "add"
        ? await supabase.from("recent_work").insert([rowData])
        : await supabase.from("recent_work").update(rowData).eq("id", form.id);

    if (error) console.error(error);
    setSaving(false);
    setMode("view");
    setForm(EMPTY_RECENT_WORK_FORM);
    fetchItems();
  }

  function editItem(item: RecentWorkItem) {
    setForm({ id: item.id, title: item.title, tag: item.tag, image_url: item.image_url, image_file: null });
    setMode("edit");
  }

  async function deleteItem(id: string) {
    const { error } = await supabase.from("recent_work").delete().eq("id", id);
    if (error) console.error(error);
    fetchItems();
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="font-[var(--font-heading)] text-[24px] text-[#1a1a1a]">
            Recent Work
          </h2>
          <p className="text-[13px] text-gray-500">
            Shows in the homepage&apos;s &quot;Recent Work&quot; portfolio grid.
          </p>
        </div>
        {mode === "view" && (
          <button
            onClick={() => setMode("add")}
            className="w-full sm:w-auto bg-[var(--color-brand)] text-white px-4 py-2 rounded text-[13px] hover:bg-[var(--color-brand-dark)] transition-colors shrink-0"
          >
            Add Project
          </button>
        )}
      </div>

      {mode !== "view" && (
        <div className="bg-white rounded-xl p-6 mb-8 shadow-md">
          <h3 className="font-[var(--font-heading)] text-[18px] mb-4">
            {mode === "add" ? "Add Project" : "Edit Project"}
          </h3>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                Title
              </label>
              <input
                placeholder="e.g. Automated Gate Installation"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                required
                className="w-full px-3 py-2 border rounded text-[14px]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                Tag
              </label>
              <input
                placeholder="e.g. Residential"
                value={form.tag}
                onChange={(e) => setForm((prev) => ({ ...prev, tag: e.target.value }))}
                required
                className="w-full px-3 py-2 border rounded text-[14px]"
              />
            </div>
            <div>
              <label className="text-[12px] text-gray-500 mb-1 block">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setForm((prev) => ({ ...prev, image_file: e.target.files?.[0] ?? null }))}
                className="w-full px-3 py-2 border rounded text-[14px] cursor-pointer"
              />
              {(form.image_file || form.image_url) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.image_file ? URL.createObjectURL(form.image_file) : form.image_url}
                  alt="Preview"
                  className="w-24 h-24 object-cover mt-2"
                />
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[var(--color-brand)] text-white py-2 rounded text-[13px] hover:bg-[var(--color-brand-dark)] transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : mode === "add" ? "Create" : "Update"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("view");
                  setForm(EMPTY_RECENT_WORK_FORM);
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded text-[13px] hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded h-48" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-gray-500 text-[14px] py-12 text-center">
          No projects yet. Add your first one above.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((item) => (
            <div key={item.id} className="product-card relative bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image_url || "/placeholder.svg"}
                alt={item.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-3">
                <p className="text-[10px] uppercase font-bold text-[var(--color-brand)]">{item.tag}</p>
                <h3 className="font-[var(--font-heading)] text-[13px] font-semibold text-[#1a1a1a]">
                  {item.title}
                </h3>
              </div>
              <div className="absolute top-3 right-3 flex gap-2 bg-white/90 rounded px-2 py-1">
                <button onClick={() => editItem(item)} className="text-[12px] text-blue-600 hover:text-blue-800">
                  Edit
                </button>
                <button onClick={() => deleteItem(item.id)} className="text-[12px] text-red-600 hover:text-red-800">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ Capabilities ═══════════════════════════ */

function CapabilitiesTab({
  supabase,
  uploadImage,
}: {
  supabase: ReturnType<typeof createClient>;
  uploadImage: (file: File, folder: string) => Promise<string | null>;
}) {
  const [items, setItems] = useState<Capability[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"view" | "add" | "edit">("view");
  const [form, setForm] = useState(EMPTY_CAPABILITY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchItems() {
    const { data, error } = await supabase
      .from("capabilities")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setItems(data ?? []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    let imageUrl = form.image_url;
    if (form.image_file) {
      const uploaded = await uploadImage(form.image_file, "capabilities");
      if (uploaded) imageUrl = uploaded;
    }
    const rowData = {
      name: form.name,
      image_url: imageUrl,
      rating: form.rating,
      rating_label: form.rating_label,
      description: form.description,
    };

    const { error } =
      mode === "add"
        ? await supabase.from("capabilities").insert([rowData])
        : await supabase.from("capabilities").update(rowData).eq("id", form.id);

    if (error) console.error(error);
    setSaving(false);
    setMode("view");
    setForm(EMPTY_CAPABILITY_FORM);
    fetchItems();
  }

  function editItem(item: Capability) {
    setForm({
      id: item.id,
      name: item.name,
      image_url: item.image_url,
      image_file: null,
      rating: item.rating,
      rating_label: item.rating_label,
      description: item.description,
    });
    setMode("edit");
  }

  async function deleteItem(id: string) {
    const { error } = await supabase.from("capabilities").delete().eq("id", id);
    if (error) console.error(error);
    fetchItems();
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="font-[var(--font-heading)] text-[24px] text-[#1a1a1a]">
            What We Do Best
          </h2>
          <p className="text-[13px] text-gray-500">
            The three capability cards on the homepage.
          </p>
        </div>
        {mode === "view" && (
          <button
            onClick={() => setMode("add")}
            className="w-full sm:w-auto bg-[var(--color-brand)] text-white px-4 py-2 rounded text-[13px] hover:bg-[var(--color-brand-dark)] transition-colors shrink-0"
          >
            Add Capability
          </button>
        )}
      </div>

      {mode !== "view" && (
        <div className="bg-white rounded-xl p-6 mb-8 shadow-md">
          <h3 className="font-[var(--font-heading)] text-[18px] mb-4">
            {mode === "add" ? "Add Capability" : "Edit Capability"}
          </h3>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                Name
              </label>
              <input
                placeholder="e.g. Building & Fabrication"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                className="w-full px-3 py-2 border rounded text-[14px]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                Description
              </label>
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border rounded text-[14px] h-20 resize-y"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Stat
                </label>
                <input
                  placeholder="e.g. 500+"
                  value={form.rating}
                  onChange={(e) => setForm((prev) => ({ ...prev, rating: e.target.value }))}
                  className="w-full px-3 py-2 border rounded text-[14px]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Stat Label
                </label>
                <input
                  placeholder="e.g. projects built"
                  value={form.rating_label}
                  onChange={(e) => setForm((prev) => ({ ...prev, rating_label: e.target.value }))}
                  className="w-full px-3 py-2 border rounded text-[14px]"
                />
              </div>
            </div>
            <div>
              <label className="text-[12px] text-gray-500 mb-1 block">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setForm((prev) => ({ ...prev, image_file: e.target.files?.[0] ?? null }))}
                className="w-full px-3 py-2 border rounded text-[14px] cursor-pointer"
              />
              {(form.image_file || form.image_url) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.image_file ? URL.createObjectURL(form.image_file) : form.image_url}
                  alt="Preview"
                  className="w-24 h-24 object-cover mt-2"
                />
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[var(--color-brand)] text-white py-2 rounded text-[13px] hover:bg-[var(--color-brand-dark)] transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : mode === "add" ? "Create" : "Update"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("view");
                  setForm(EMPTY_CAPABILITY_FORM);
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded text-[13px] hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded h-48" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-gray-500 text-[14px] py-12 text-center">
          No capabilities yet. Add your first one above.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="product-card relative bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image_url || "/placeholder.svg"}
                alt={item.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-3">
                <h3 className="font-[var(--font-heading)] text-[13px] font-semibold text-[#1a1a1a]">
                  {item.name}
                </h3>
                <p className="text-[12px] text-gray-400 line-clamp-2 mb-1">{item.description}</p>
                <p className="text-[13px] font-bold text-[var(--color-brand)]">
                  {item.rating} <span className="text-gray-400 font-normal">{item.rating_label}</span>
                </p>
              </div>
              <div className="absolute top-3 right-3 flex gap-2 bg-white/90 rounded px-2 py-1">
                <button onClick={() => editItem(item)} className="text-[12px] text-blue-600 hover:text-blue-800">
                  Edit
                </button>
                <button onClick={() => deleteItem(item.id)} className="text-[12px] text-red-600 hover:text-red-800">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ Hero ═══════════════════════════ */

function HeroTab({
  supabase,
  uploadImage,
}: {
  supabase: ReturnType<typeof createClient>;
  uploadImage: (file: File, folder: string) => Promise<string | null>;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    image_url: "",
    image_file: null as File | null,
    headline: "",
    subtext: "",
    cta_label: "",
    cta_href: "",
  });

  useEffect(() => {
    async function fetchHero() {
      const { data, error } = await supabase
        .from("hero_content")
        .select("*")
        .eq("id", 1)
        .maybeSingle<HeroContent>();
      if (error) console.error(error);
      if (data) {
        setForm({
          image_url: data.image_url,
          image_file: null,
          headline: data.headline,
          subtext: data.subtext,
          cta_label: data.cta_label,
          cta_href: data.cta_href,
        });
      }
      setLoading(false);
    }
    fetchHero();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    let imageUrl = form.image_url;
    if (form.image_file) {
      const uploaded = await uploadImage(form.image_file, "hero");
      if (uploaded) imageUrl = uploaded;
    }
    const { error } = await supabase
      .from("hero_content")
      .upsert({
        id: 1,
        image_url: imageUrl,
        headline: form.headline,
        subtext: form.subtext,
        cta_label: form.cta_label,
        cta_href: form.cta_href,
        updated_at: new Date().toISOString(),
      });
    if (error) console.error(error);
    else {
      setForm((prev) => ({ ...prev, image_url: imageUrl, image_file: null }));
      setSaved(true);
    }
    setSaving(false);
  }

  if (loading) {
    return <div className="animate-pulse bg-white rounded h-64" />;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-[var(--font-heading)] text-[24px] text-[#1a1a1a]">
          Homepage Hero
        </h2>
        <p className="text-[13px] text-gray-500">
          The full-bleed banner at the top of the homepage.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-md max-w-xl">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <label className="text-[12px] text-gray-500 mb-1 block">Background image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setForm((prev) => ({ ...prev, image_file: e.target.files?.[0] ?? null }))}
              className="w-full px-3 py-2 border rounded text-[14px] cursor-pointer"
            />
            {(form.image_file || form.image_url) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.image_file ? URL.createObjectURL(form.image_file) : form.image_url}
                alt="Preview"
                className="w-full h-32 object-cover mt-2"
              />
            )}
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
              Headline
            </label>
            <input
              placeholder="e.g. Building & Fabrication"
              value={form.headline}
              onChange={(e) => setForm((prev) => ({ ...prev, headline: e.target.value }))}
              required
              className="w-full px-3 py-2 border rounded text-[14px]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
              Subtext
            </label>
            <textarea
              placeholder="Subtext"
              value={form.subtext}
              onChange={(e) => setForm((prev) => ({ ...prev, subtext: e.target.value }))}
              className="w-full px-3 py-2 border rounded text-[14px] h-20 resize-y"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                Button Label
              </label>
              <input
                placeholder="e.g. Shop Now"
                value={form.cta_label}
                onChange={(e) => setForm((prev) => ({ ...prev, cta_label: e.target.value }))}
                className="w-full px-3 py-2 border rounded text-[14px]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                Button Link
              </label>
              <input
                placeholder="e.g. /products"
                value={form.cta_href}
                onChange={(e) => setForm((prev) => ({ ...prev, cta_href: e.target.value }))}
                className="w-full px-3 py-2 border rounded text-[14px]"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-[var(--color-brand)] text-white py-2 rounded text-[13px] hover:bg-[var(--color-brand-dark)] transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Hero"}
          </button>
          {saved && (
            <p className="text-[12px] text-green-600 text-center">Saved — live on the homepage now.</p>
          )}
        </form>
      </div>
    </div>
  );
}
