"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/types";

export type CartLine = {
  id: string; // cart_items.id for signed-in users, product_id for guests
  product_id: string;
  quantity: number;
  product: Product;
};

const GUEST_CART_KEY = "dpl_guest_cart";

type GuestEntry = { product_id: string; quantity: number };

function readGuestCart(): GuestEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_CART_KEY);
    return raw ? (JSON.parse(raw) as GuestEntry[]) : [];
  } catch {
    return [];
  }
}

function writeGuestCart(entries: GuestEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(entries));
  } catch {
    // storage unavailable - ignore
  }
}

interface CartContextValue {
  items: CartLine[];
  loading: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadGuestCart = useCallback(async (): Promise<CartLine[]> => {
    const entries = readGuestCart();
    if (entries.length === 0) return [];
    const { data } = await supabase
      .from("products")
      .select("*")
      .in(
        "id",
        entries.map((e) => e.product_id)
      );
    const products = (data as Product[]) ?? [];
    return entries
      .map((e) => {
        const product = products.find((p) => p.id === e.product_id);
        if (!product) return null;
        return {
          id: e.product_id,
          product_id: e.product_id,
          quantity: e.quantity,
          product,
        } satisfies CartLine;
      })
      .filter((l): l is CartLine => l !== null);
  }, [supabase]);

  const loadUserCart = useCallback(
    async (userId: string): Promise<CartLine[]> => {
      const { data } = await supabase
        .from("cart_items")
        .select("*, product:products(*)")
        .eq("user_id", userId);
      return ((data as (CartLine & { product: Product })[]) ?? []).map(
        (row) => ({
          id: row.id,
          product_id: row.product_id,
          quantity: row.quantity,
          product: row.product,
        })
      );
    },
    [supabase]
  );

  const mergeGuestCartIntoAccount = useCallback(
    async (userId: string) => {
      const entries = readGuestCart();
      if (entries.length === 0) return;

      const { data: existing } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", userId);

      for (const entry of entries) {
        const match = existing?.find((r) => r.product_id === entry.product_id);
        if (match) {
          await supabase
            .from("cart_items")
            .update({ quantity: match.quantity + entry.quantity })
            .eq("id", match.id);
        } else {
          await supabase.from("cart_items").insert({
            user_id: userId,
            product_id: entry.product_id,
            quantity: entry.quantity,
          });
        }
      }
      writeGuestCart([]);
    },
    [supabase]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await mergeGuestCartIntoAccount(user.id);
      setItems(await loadUserCart(user.id));
    } else {
      setItems(await loadGuestCart());
    }
    setLoading(false);
  }, [supabase, mergeGuestCartIntoAccount, loadUserCart, loadGuestCart]);

  useEffect(() => {
    refresh();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });
    return () => listener.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addItem = useCallback(
    async (product: Product, quantity = 1) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: existing } = await supabase
          .from("cart_items")
          .select("*")
          .eq("user_id", user.id)
          .eq("product_id", product.id)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("cart_items")
            .update({ quantity: existing.quantity + quantity })
            .eq("id", existing.id);
        } else {
          await supabase.from("cart_items").insert({
            user_id: user.id,
            product_id: product.id,
            quantity,
          });
        }
        setItems(await loadUserCart(user.id));
      } else {
        const entries = readGuestCart();
        const existing = entries.find((e) => e.product_id === product.id);
        if (existing) {
          existing.quantity += quantity;
        } else {
          entries.push({ product_id: product.id, quantity });
        }
        writeGuestCart(entries);
        setItems(await loadGuestCart());
      }
    },
    [supabase, loadUserCart, loadGuestCart]
  );

  const updateQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        if (quantity < 1) {
          await supabase.from("cart_items").delete().eq("id", lineId);
        } else {
          await supabase
            .from("cart_items")
            .update({ quantity })
            .eq("id", lineId);
        }
        setItems(await loadUserCart(user.id));
      } else {
        let entries = readGuestCart();
        if (quantity < 1) {
          entries = entries.filter((e) => e.product_id !== lineId);
        } else {
          const existing = entries.find((e) => e.product_id === lineId);
          if (existing) existing.quantity = quantity;
        }
        writeGuestCart(entries);
        setItems(await loadGuestCart());
      }
    },
    [supabase, loadUserCart, loadGuestCart]
  );

  const removeItem = useCallback(
    (lineId: string) => updateQuantity(lineId, 0),
    [updateQuantity]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, l) => sum + l.quantity, 0),
    [items]
  );
  const subtotal = useMemo(
    () => items.reduce((sum, l) => sum + (l.product?.price ?? 0) * l.quantity, 0),
    [items]
  );

  const value: CartContextValue = {
    items,
    loading,
    itemCount,
    subtotal,
    addItem,
    updateQuantity,
    removeItem,
    refresh,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
