"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/types";
import type { User } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";

export default function AdminPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"view" | "add" | "edit">("view");
  const [form, setForm] = useState({
    id: "",
    name: "",
    description: "",
    price: 0,
    image_url: "",
    image_file: null as File | null,
    category: "",
    stock: 0,
  });
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (user) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setProducts(data ?? []);
    setLoading(false);
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    let imagePath = form.image_url;
    
    if (form.image_file) {
      const { data, error } = await supabase.storage
        .from("products")
        .upload(`${form.id || Date.now()}-${form.name.replace(/\s+/g, "-")}.jpg`, form.image_file);
      if (error) console.error("Upload error:", error);
      else {
        const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(data.path);
        imagePath = publicUrl;
      }
    }
    
    const productData = {
      ...form,
      image_url: imagePath,
    };
    
    if (mode === "add") {
      const { error } = await supabase.from("products").insert([productData]);
      if (error) console.error(error);
    } else if (mode === "edit" && form.id) {
      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", form.id);
      if (error) console.error(error);
    }
    setMode("view");
    setForm({
      id: "",
      name: "",
      description: "",
      price: 0,
      image_url: "",
      image_file: null as File | null,
      category: "",
      stock: 0,
    });
    fetchProducts();
  };

  const editProduct = (product: Product) => {
    setForm({ ...product, image_file: null });
    setMode("edit");
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) console.error(error);
    fetchProducts();
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-[1300px] mx-auto">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="animate-pulse bg-white rounded h-48" />
              ))}
            </div>
          ) : user ? (
            <></>
          ) : (
            <div className="text-center my-12">
              <Link href="/auth/login" className="btn-dark">
                Sign in to access admin
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1300px] mx-auto px-6 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.jpg"
                alt="Dotted Point Limited"
                width={32}
                height={32}
                className="h-8 w-auto object-contain"
              />
              <span className="text-[16px] font-bold text-[#171717]">Admin</span>
            </Link>
            <span className="text-gray-500 text-[12px]">
              Logged in as: {user.email ?? "unknown"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMode("add")}
              className="bg-[var(--color-brand)] text-white px-4 py-2 rounded text-[13px] hover:bg-[var(--color-brand-dark)] transition-colors"
              aria-label="Add product"
            >
              Add Product
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-gray-500 hover:text-black px-4 py-2 rounded text-[13px] hover:bg-gray-100 transition-colors"
              aria-label="Sign out"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1300px] mx-auto px-6 py-8">
        {/* Products Form */}
        {mode !== "view" && (
          <div className="bg-white rounded-xl p-6 mb-8 shadow-md">
            <h2 className="font-[var(--font-heading)] text-[24px] mb-4">
              {mode === "add" ? "Add New Product" : "Edit Product"}
            </h2>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <input
                type="hidden"
                value={form.id}
                onChange={(e) => setForm((prev) => ({ ...prev, id: e.target.value }))}
                disabled={mode === "add"}
              />
              <input
                placeholder="Product name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                className="w-full px-3 py-2 border rounded text-[14px]"
              />
              <textarea
                placeholder="Product description"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border rounded text-[14px] h-20 resize-y"
              />
              <input
                type="number"
                placeholder="Price (GH₵)"
                value={form.price}
                onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                required
                className="w-full px-3 py-2 border rounded text-[14px]"
              />
              <div>
                <label className="text-[12px] text-gray-500 mb-1 block">
                  Product Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm((prev) => ({ ...prev, image_file: e.target.files?.[0] ?? null }))}
                  className="w-full px-3 py-2 border rounded text-[14px] cursor-pointer hidden sm:block"
                />
                <span
                  className="text-[12px] text-gray-400"
                >
                  {form.image_url ? (form.image_file ? "Preview available" : "Add image from URL") : "Add image from URL"}
                </span>
                {form.image_file && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(form.image_file)}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded mb-2"
                    />
                    <button
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          image_file: null,
                          image_url: "",
                        }))
                      }
                      className="text-[10px] text-red-500 hover:text-black"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
              <select
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border rounded text-[14px]"
              >
                <option value="power-tools">Power Tools</option>
                <option value="building-materials">Building Materials</option>
                <option value="safety">Safety</option>
                <option value="plumbing-electrical">Plumbing & Electrical</option>
                <option value="hardware">Hardware</option>
                <option value="shower-cubicle">Shower Cubicle</option>
              </select>
              <input
                type="number"
                placeholder="Stock quantity"
                value={form.stock}
                onChange={(e) => setForm((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                required
                className="w-full px-3 py-2 border rounded text-[14px]"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-[var(--color-brand)] text-white py-2 rounded text-[13px] hover:bg-[var(--color-brand-dark)] transition-colors"
                >
                  {mode === "add" ? "Create" : "Update"}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("view")}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded text-[13px] hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products Grid */}
        <div>
          <h2 className="font-[var(--font-heading)] text-[24px] mb-6 text-[#1a1a1a]">
            Products Management
          </h2>
          {products.length === 0 ? (
            <p className="text-gray-500 text-[14px] py-12 text-center">
              No products found. Add your first product above.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`product-card relative group animate-slide-up`}
                >
                  <img
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-t"
                  />
                  <div className="p-3">
                    <h3 className="font-[var(--font-heading)] text-[13px] font-semibold text-[#1a1a1a]">
                      {product.name}
                    </h3>
                    <p className="text-[12px] text-gray-400 capitalize mb-1">
                      {product.category}
                    </p>
                    <p className="font-[var(--font-heading)] text-[15px] font-bold text-[#1a1a1a]">
                      GH₵{product.price.toFixed(2)}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Stock: {product.stock}
                    </p>
                  </div>
                  <div className="absolute top-3 right-3 flex gap-1">
                    <button
                      onClick={() => editProduct(product)}
                      className="text-[12px] text-blue-600 hover:text-blue-800 transition-colors"
                      aria-label="Edit product"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="text-[12px] text-red-600 hover:text-red-800 transition-colors"
                      aria-label="Delete product"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

