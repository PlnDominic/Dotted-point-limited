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

export type WishlistLine = {
  id: string; // wishlist_items.id for signed-in users, product_id for guests
  product_id: string;
  product: Product;
};

const GUEST_WISHLIST_KEY = "dpl_guest_wishlist";

function readGuestWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_WISHLIST_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeGuestWishlist(productIds: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(productIds));
  } catch {
    // storage unavailable - ignore
  }
}

interface WishlistContextValue {
  items: WishlistLine[];
  loading: boolean;
  count: number;
  has: (productId: string) => boolean;
  toggle: (product: Product) => Promise<void>;
  remove: (lineId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistLine[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadGuestWishlist = useCallback(async (): Promise<WishlistLine[]> => {
    const ids = readGuestWishlist();
    if (ids.length === 0) return [];
    const { data } = await supabase.from("products").select("*").in("id", ids);
    const products = (data as Product[]) ?? [];
    return ids
      .map((id) => {
        const product = products.find((p) => p.id === id);
        if (!product) return null;
        return { id, product_id: id, product } satisfies WishlistLine;
      })
      .filter((l): l is WishlistLine => l !== null);
  }, [supabase]);

  const loadUserWishlist = useCallback(
    async (userId: string): Promise<WishlistLine[]> => {
      const { data } = await supabase
        .from("wishlist_items")
        .select("*, product:products(*)")
        .eq("user_id", userId);
      return ((data as (WishlistLine & { product: Product })[]) ?? []).map(
        (row) => ({ id: row.id, product_id: row.product_id, product: row.product })
      );
    },
    [supabase]
  );

  const mergeGuestWishlistIntoAccount = useCallback(
    async (userId: string) => {
      const ids = readGuestWishlist();
      if (ids.length === 0) return;

      const { data: existing } = await supabase
        .from("wishlist_items")
        .select("product_id")
        .eq("user_id", userId);
      const existingIds = new Set((existing ?? []).map((r) => r.product_id));

      const toInsert = ids.filter((id) => !existingIds.has(id));
      if (toInsert.length > 0) {
        await supabase
          .from("wishlist_items")
          .insert(toInsert.map((product_id) => ({ user_id: userId, product_id })));
      }
      writeGuestWishlist([]);
    },
    [supabase]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await mergeGuestWishlistIntoAccount(user.id);
      setItems(await loadUserWishlist(user.id));
    } else {
      setItems(await loadGuestWishlist());
    }
    setLoading(false);
  }, [supabase, mergeGuestWishlistIntoAccount, loadUserWishlist, loadGuestWishlist]);

  useEffect(() => {
    refresh();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });
    return () => listener.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = useCallback(
    async (product: Product) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: existing } = await supabase
          .from("wishlist_items")
          .select("id")
          .eq("user_id", user.id)
          .eq("product_id", product.id)
          .maybeSingle();

        if (existing) {
          await supabase.from("wishlist_items").delete().eq("id", existing.id);
        } else {
          await supabase
            .from("wishlist_items")
            .insert({ user_id: user.id, product_id: product.id });
        }
        setItems(await loadUserWishlist(user.id));
      } else {
        const ids = readGuestWishlist();
        const next = ids.includes(product.id)
          ? ids.filter((id) => id !== product.id)
          : [...ids, product.id];
        writeGuestWishlist(next);
        setItems(await loadGuestWishlist());
      }
    },
    [supabase, loadUserWishlist, loadGuestWishlist]
  );

  const remove = useCallback(
    async (lineId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("wishlist_items").delete().eq("id", lineId);
        setItems(await loadUserWishlist(user.id));
      } else {
        const next = readGuestWishlist().filter((id) => id !== lineId);
        writeGuestWishlist(next);
        setItems(await loadGuestWishlist());
      }
    },
    [supabase, loadUserWishlist, loadGuestWishlist]
  );

  const has = useCallback(
    (productId: string) => items.some((l) => l.product_id === productId),
    [items]
  );

  const count = useMemo(() => items.length, [items]);

  const value: WishlistContextValue = { items, loading, count, has, toggle, remove };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
