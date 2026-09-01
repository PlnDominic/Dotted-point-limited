import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createFakeSupabase } from "@/test/fakeSupabase";
import type { Product } from "@/types";

const fakeSupabase = { current: createFakeSupabase() };
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => fakeSupabase.current,
}));

const { WishlistProvider, useWishlist } = await import("./WishlistContext");

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "p1",
    name: "Roofing Sheet",
    description: "",
    price: 100,
    image_url: "",
    category: "roofing-sheets",
    stock: 10,
    product_type: "material",
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

describe("WishlistContext — guest wishlist (localStorage-backed)", () => {
  beforeEach(() => {
    fakeSupabase.current = createFakeSupabase({
      tables: { products: [makeProduct()] },
    });
  });

  it("starts empty", async () => {
    const { result } = renderHook(() => useWishlist(), { wrapper: WishlistProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.items).toEqual([]);
    expect(result.current.count).toBe(0);
    expect(result.current.has("p1")).toBe(false);
  });

  it("toggle adds a product that isn't saved yet", async () => {
    const { result } = renderHook(() => useWishlist(), { wrapper: WishlistProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggle(makeProduct());
    });

    expect(result.current.count).toBe(1);
    expect(result.current.has("p1")).toBe(true);
    expect(JSON.parse(window.localStorage.getItem("dpl_guest_wishlist")!)).toEqual(["p1"]);
  });

  it("toggle on an already-saved product removes it (it's a toggle, not just add)", async () => {
    const { result } = renderHook(() => useWishlist(), { wrapper: WishlistProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggle(makeProduct());
    });
    expect(result.current.has("p1")).toBe(true);

    await act(async () => {
      await result.current.toggle(makeProduct());
    });

    expect(result.current.has("p1")).toBe(false);
    expect(result.current.count).toBe(0);
    expect(JSON.parse(window.localStorage.getItem("dpl_guest_wishlist")!)).toEqual([]);
  });

  it("remove drops a single saved product by id", async () => {
    fakeSupabase.current = createFakeSupabase({
      tables: {
        products: [makeProduct(), makeProduct({ id: "p2", name: "Nails" })],
      },
    });
    const { result } = renderHook(() => useWishlist(), { wrapper: WishlistProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggle(makeProduct());
      await result.current.toggle(makeProduct({ id: "p2", name: "Nails" }));
    });
    expect(result.current.count).toBe(2);

    await act(async () => {
      await result.current.remove("p1");
    });

    expect(result.current.count).toBe(1);
    expect(result.current.has("p1")).toBe(false);
    expect(result.current.has("p2")).toBe(true);
  });
});

describe("WishlistContext — merging a guest wishlist into an account on sign-in", () => {
  it("adds guest-saved products the account doesn't already have, without duplicating ones it does", async () => {
    window.localStorage.setItem("dpl_guest_wishlist", JSON.stringify(["p1", "p2"]));
    fakeSupabase.current = createFakeSupabase({
      tables: {
        products: [makeProduct(), makeProduct({ id: "p2", name: "Nails" })],
        wishlist_items: [{ id: "existing1", user_id: "u1", product_id: "p1" }],
      },
    });

    const { result } = renderHook(() => useWishlist(), { wrapper: WishlistProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      fakeSupabase.current.__signIn({ id: "u1", email: "kwame@example.com" });
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.count).toBe(2);
    expect(result.current.has("p1")).toBe(true);
    expect(result.current.has("p2")).toBe(true);
    // p1 must not have been inserted a second time.
    expect(
      fakeSupabase.current.__tables.wishlist_items.filter(
        (r) => r.product_id === "p1"
      )
    ).toHaveLength(1);
    expect(window.localStorage.getItem("dpl_guest_wishlist")).toBe("[]");
  });
});
