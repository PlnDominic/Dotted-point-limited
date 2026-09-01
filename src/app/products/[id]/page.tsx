"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Product, Review } from "@/types";
import type { User } from "@supabase/supabase-js";
import { formatGHS } from "@/lib/currency";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i + 1 <= Math.round(value);
        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={filled ? "#f59e0b" : "none"}
            stroke="#f59e0b"
            strokeWidth="1.5"
          >
            <path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2Z" />
          </svg>
        );
      })}
    </div>
  );
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const star = i + 1;
        const filled = star <= value;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            className="p-0.5"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={filled ? "#f59e0b" : "none"}
              stroke="#f59e0b"
              strokeWidth="1.5"
            >
              <path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2Z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState("");
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [addedRelatedIds, setAddedRelatedIds] = useState<Set<string>>(new Set());
  const supabase = createClient();
  const wishlist = useWishlist();
  const { addItem } = useCart();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      setProduct(data);
      setActiveImage(0);
      setLoading(false);
    }
    load();
  }, [id, supabase]);

  useEffect(() => {
    if (!product) return;
    let cancelled = false;
    setRelatedLoading(true);
    supabase
      .from("products")
      .select("*")
      .eq("category", product.category)
      .neq("id", product.id)
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => {
        if (!cancelled) {
          setRelatedProducts((data as Product[]) ?? []);
          setRelatedLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [product, supabase]);

  function handleAddRelatedToCart(p: Product) {
    addItem(p);
    setAddedRelatedIds((prev) => new Set(prev).add(p.id));
    window.setTimeout(() => {
      setAddedRelatedIds((prev) => {
        const next = new Set(prev);
        next.delete(p.id);
        return next;
      });
    }, 1500);
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [supabase]);

  async function loadReviews() {
    setReviewsLoading(true);
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", id)
      .order("created_at", { ascending: false });
    setReviews((data as Review[]) ?? []);
    setReviewsLoading(false);
  }

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const myReview = user ? reviews.find((r) => r.user_id === user.id) : undefined;

  useEffect(() => {
    if (myReview) {
      setReviewRating(myReview.rating);
      setReviewComment(myReview.comment);
    }
  }, [myReview]);

  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : product?.rating ?? 0;
  const displayReviewCount = reviewCount > 0 ? reviewCount : product?.reviews_count ?? 0;

  const images =
    product?.image_urls && product.image_urls.length > 0
      ? product.image_urls
      : product?.image_url
      ? [product.image_url]
      : [];

  async function addToCart() {
    setAdding(true);
    setMsg("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    const { data: existing } = await supabase
      .from("cart_items").select("*")
      .eq("user_id", user.id).eq("product_id", id).single();

    if (existing) {
      await supabase.from("cart_items").update({ quantity: existing.quantity + quantity }).eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({ user_id: user.id, product_id: id, quantity });
    }
    setAdding(false);
    setMsg("Added to cart");
    setTimeout(() => setMsg(""), 3000);
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (reviewRating < 1) {
      setReviewMsg("Pick a star rating first.");
      return;
    }
    setSubmittingReview(true);
    setReviewMsg("");

    const reviewerName =
      (user.user_metadata?.full_name as string | undefined) ||
      user.email?.split("@")[0] ||
      "Customer";

    const { error } = await supabase.from("reviews").upsert(
      {
        product_id: id,
        user_id: user.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
        reviewer_name: reviewerName,
      },
      { onConflict: "product_id,user_id" }
    );

    if (error) {
      console.error(error);
      setReviewMsg("Couldn't save your review. Try again.");
    } else {
      setReviewMsg("Thanks for your review!");
      await loadReviews();
    }
    setSubmittingReview(false);
  }

  async function deleteMyReview() {
    if (!myReview) return;
    await supabase.from("reviews").delete().eq("id", myReview.id);
    setReviewRating(0);
    setReviewComment("");
    await loadReviews();
  }

  if (loading) {
    return (
      <div className="max-w-[1300px] mx-auto px-6 py-10">
        <div className="animate-pulse grid md:grid-cols-2 gap-12">
          <div className="bg-gray-100 aspect-square" />
          <div className="space-y-4 pt-4">
            <div className="bg-gray-100 h-3 rounded w-1/4" />
            <div className="bg-gray-100 h-8 rounded w-3/4" />
            <div className="bg-gray-100 h-6 rounded w-1/6 mt-4" />
            <div className="bg-gray-100 h-20 rounded mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1300px] mx-auto px-6 py-24 text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-30">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <h1 className="font-[var(--font-heading)] text-[22px] font-bold mb-2">
          Product Not Found
        </h1>
        <p className="text-gray-400 text-[14px] mb-6">
          This item may have been removed or the link is incorrect.
        </p>
        <button onClick={() => router.push("/products")} className="btn-dark text-[13px]">
          Back to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1300px] mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <nav className="mb-8 text-[13px] text-gray-400">
        <a href="/products" className="hover:text-[#1a1a1a] transition-colors">Shop</a>
        <span className="mx-2">/</span>
        <span className="text-gray-600">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Image */}
        <div className="animate-scale-in">
          <div className="relative aspect-square bg-[#f8f8f8] overflow-hidden">
            {images.length > 0 ? (
              <img
                src={images[activeImage] ?? images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-15">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </div>
            )}
            <button
              onClick={() => wishlist.toggle(product)}
              className="heart-btn"
              aria-label={wishlist.has(product.id) ? "Remove from wishlist" : "Add to wishlist"}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={wishlist.has(product.id) ? "#ef4444" : "none"}
                stroke={wishlist.has(product.id) ? "#ef4444" : "#999"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </button>
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {images.map((url, i) => (
                <button
                  key={url + i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 shrink-0 overflow-hidden border-2 transition-colors ${
                    activeImage === i ? "border-[var(--color-brand)]" : "border-transparent"
                  }`}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="animate-slide-up delay-2">
          <p className="font-[var(--font-heading)] text-[12px] font-bold tracking-[0.12em] text-gray-400 uppercase mb-3">
            {product.category.replace(/-/g, " ")}
          </p>
          <h1 className="font-[var(--font-heading)] text-[28px] md:text-[34px] font-[800] tracking-[-0.02em] text-[#1a1a1a] mb-3 leading-tight">
            {product.name}
          </h1>

          {displayReviewCount > 0 && (
            <a href="#reviews" className="flex items-center gap-2 mb-4">
              <Stars value={averageRating} />
              <span className="text-[13px] text-gray-500">
                {averageRating.toFixed(1)} ({displayReviewCount} review{displayReviewCount === 1 ? "" : "s"})
              </span>
            </a>
          )}

          <p className="font-[var(--font-heading)] text-[28px] font-[800] text-[var(--color-brand)] mb-6">
            {formatGHS(product.price)}
          </p>

          <p className="text-gray-500 text-[15px] leading-relaxed mb-8 max-w-lg">
            {product.description}
          </p>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-gray-50 p-4">
              <p className="font-[var(--font-heading)] text-[11px] font-bold tracking-[0.1em] text-gray-400 uppercase mb-1">
                Availability
              </p>
              <p className={`font-[var(--font-heading)] text-[13px] font-semibold ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
              </p>
            </div>
            <div className="bg-gray-50 p-4">
              <p className="font-[var(--font-heading)] text-[11px] font-bold tracking-[0.1em] text-gray-400 uppercase mb-1">
                SKU
              </p>
              <p className="font-[var(--font-heading)] text-[13px] font-semibold text-[#1a1a1a]">
                DP-{product.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-3 mb-5">
            <span className="font-[var(--font-heading)] text-[12px] font-bold tracking-[0.1em] text-gray-400 uppercase">
              Qty
            </span>
            <div className="flex items-center border border-gray-200">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-12 text-center font-[var(--font-heading)] text-[14px] font-semibold">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to cart */}
          <button
            onClick={addToCart}
            disabled={adding || product.stock === 0}
            className="btn-dark w-full py-4 text-[14px] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {adding ? "Adding..." : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>

          {msg && (
            <p className="mt-3 text-[13px] text-green-600 font-medium text-center animate-fade-in">
              ✓ {msg}
            </p>
          )}
        </div>
      </div>

      {/* Related Products */}
      {(relatedLoading || relatedProducts.length > 0) && (
        <div className="mt-16 pt-10 border-t border-gray-100">
          <h2 className="font-[var(--font-heading)] text-[22px] font-[800] text-[#1a1a1a] mb-6">
            You May Also Like
          </h2>
          {relatedLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-100 aspect-square mb-3" />
                  <div className="bg-gray-100 h-3 rounded w-2/3 mb-2" />
                  <div className="bg-gray-100 h-3 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {relatedProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="product-card relative group"
                >
                  <div className="aspect-square bg-[#f8f8f8] overflow-hidden">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-20">
                          <rect width="18" height="18" x="3" y="3" rx="2" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-3 md:p-4">
                    <h3 className="font-[var(--font-heading)] text-[13px] font-semibold text-[#1a1a1a] mb-0.5 truncate">
                      {p.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="font-[var(--font-heading)] text-[14px] font-bold text-[#1a1a1a]">
                        {formatGHS(p.price)}
                      </span>
                      {p.stock > 0 ? (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddRelatedToCart(p);
                          }}
                          className="text-[11px] font-bold text-white bg-[var(--color-brand)] rounded px-2 py-1 hover:bg-[var(--color-brand-dark)] transition-colors"
                          aria-label={`Add ${p.name} to cart`}
                        >
                          {addedRelatedIds.has(p.id) ? "Added ✓" : "Add to Cart"}
                        </button>
                      ) : (
                        <span className="text-[10px] text-red-500 font-medium">Sold Out</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reviews */}
      <div id="reviews" className="mt-16 pt-10 border-t border-gray-100 grid md:grid-cols-2 gap-10 lg:gap-16">
        <div>
          <h2 className="font-[var(--font-heading)] text-[22px] font-[800] text-[#1a1a1a] mb-1">
            Customer Reviews
          </h2>
          {displayReviewCount > 0 ? (
            <div className="flex items-center gap-2 mb-6">
              <Stars value={averageRating} size={16} />
              <span className="text-[14px] text-gray-500">
                {averageRating.toFixed(1)} out of 5 · {displayReviewCount} review
                {displayReviewCount === 1 ? "" : "s"}
              </span>
            </div>
          ) : (
            <p className="text-gray-400 text-[14px] mb-6">
              No reviews yet — be the first to share your experience.
            </p>
          )}

          {reviewsLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="bg-gray-100 h-3 rounded w-1/4" />
                  <div className="bg-gray-100 h-3 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-5 max-h-[480px] overflow-y-auto pr-2">
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-gray-100 pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-[var(--font-heading)] text-[13px] font-semibold text-[#1a1a1a]">
                      {r.reviewer_name}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {new Date(r.created_at).toLocaleDateString("en-GH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <Stars value={r.rating} />
                  {r.comment && (
                    <p className="text-gray-600 text-[14px] mt-2 leading-relaxed">{r.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <h3 className="font-[var(--font-heading)] text-[16px] font-bold text-[#1a1a1a] mb-4">
            {myReview ? "Update Your Review" : "Write a Review"}
          </h3>

          {!user ? (
            <p className="text-gray-500 text-[14px]">
              <a href="/auth/login" className="text-[var(--color-brand)] font-semibold hover:underline">
                Sign in
              </a>{" "}
              to leave a review.
            </p>
          ) : (
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-2">
                  Your Rating
                </label>
                <StarPicker value={reviewRating} onChange={setReviewRating} />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Your Review (optional)
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="What did you think of this product or service?"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--color-brand)] resize-y"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-dark py-2.5 px-6 text-[13px] disabled:opacity-40"
                >
                  {submittingReview ? "Saving..." : myReview ? "Update Review" : "Submit Review"}
                </button>
                {myReview && (
                  <button
                    type="button"
                    onClick={deleteMyReview}
                    className="text-[12px] text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Delete my review
                  </button>
                )}
              </div>
              {reviewMsg && (
                <p className="text-[13px] text-gray-500">{reviewMsg}</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
