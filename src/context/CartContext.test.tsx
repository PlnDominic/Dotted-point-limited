import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createFakeSupabase } from "@/test/fakeSupabase";
import type { Product } from "@/types";

// `createClient()` is called fresh on every render inside CartProvider, so
// the mock always reads whatever `fakeSupabase.current` currently points
// at — reassigning it in beforeEach/tests swaps the backing "database"
// without needing vi.resetModules() between tests.
const fakeSupabase = { current: createFakeSupabase() };
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => fakeSupabase.current,
}));

const { CartProvider, useCart } = await import("./CartContext");

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

describe("CartContext — guest cart (localStorage-backed)", () => {
  beforeEach(() => {
    fakeSupabase.current = createFakeSupabase({
      tables: {
        products: [makeProduct(), makeProduct({ id: "p2", name: "Nails", price: 20 })],
      },
    });
  });

  it("starts empty for a first-time visitor", async () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.items).toEqual([]);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.subtotal).toBe(0);
  });

  it("adds a product and persists it to localStorage", async () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addItem(makeProduct(), 2);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.itemCount).toBe(2);
    expect(result.current.subtotal).toBe(200);
    expect(JSON.parse(window.localStorage.getItem("dpl_guest_cart")!)).toEqual([
      { product_id: "p1", quantity: 2 },
    ]);
  });

  it("adding the same product again increases its quantity instead of duplicating the line", async () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addItem(makeProduct());
      await result.current.addItem(makeProduct());
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
  });

  it("computes subtotal as the sum of price × quantity across lines", async () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addItem(makeProduct(), 2); // 100 x 2
      await result.current.addItem(makeProduct({ id: "p2", name: "Nails", price: 20 }), 3); // 20 x 3
    });

    expect(result.current.subtotal).toBe(260);
    expect(result.current.itemCount).toBe(5);
  });

  it("dropping quantity to 0 removes the line entirely", async () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addItem(makeProduct(), 3);
    });
    await act(async () => {
      await result.current.updateQuantity("p1", 0);
    });

    expect(result.current.items).toEqual([]);
  });

  it("removeItem is equivalent to setting quantity to 0", async () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addItem(makeProduct());
    });
    await act(async () => {
      await result.current.removeItem("p1");
    });

    expect(result.current.items).toEqual([]);
  });

  it("clear empties both the in-memory cart and localStorage", async () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addItem(makeProduct());
    });
    await act(async () => {
      await result.current.clear();
    });

    expect(result.current.items).toEqual([]);
    expect(window.localStorage.getItem("dpl_guest_cart")).toBe("[]");
  });
});

describe("CartContext — merging a guest cart into an account on sign-in", () => {
  it("adds guest quantity onto an existing line and inserts a new one where there wasn't a match, then clears the guest cart", async () => {
    window.localStorage.setItem(
      "dpl_guest_cart",
      JSON.stringify([
        { product_id: "p1", quantity: 2 },
        { product_id: "p2", quantity: 1 },
      ])
    );
    fakeSupabase.current = createFakeSupabase({
      tables: {
        products: [makeProduct(), makeProduct({ id: "p2", name: "Nails", price: 20 })],
        cart_items: [{ id: "existing1", user_id: "u1", product_id: "p1", quantity: 5 }],
      },
    });

    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      fakeSupabase.current.__signIn({ id: "u1", email: "kwame@example.com" });
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const line1 = result.current.items.find((l) => l.product_id === "p1");
    const line2 = result.current.items.find((l) => l.product_id === "p2");
    // 5 already in their account + 2 from the guest cart, merged not overwritten.
    expect(line1?.quantity).toBe(7);
    // No existing row for p2, so the guest quantity became a new line.
    expect(line2?.quantity).toBe(1);
    expect(window.localStorage.getItem("dpl_guest_cart")).toBe("[]");
  });
});
