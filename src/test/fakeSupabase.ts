import { vi } from "vitest";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

/**
 * A minimal, in-memory stand-in for the Supabase JS client, covering just
 * the query shapes CartContext/WishlistContext actually use:
 *   .from(table).select(...).eq(...).in(...)   -> awaited for { data: Row[] }
 *   .from(table)...maybeSingle()                -> { data: Row | null }
 *   .from(table).insert(rowOrRows)
 *   .from(table).update(values).eq(...)
 *   .from(table).delete().eq(...)
 * Not a general Postgrest mock — just enough surface area to exercise the
 * real add/merge/remove/clear logic without hitting a real database.
 */
export function createFakeSupabase(options?: {
  user?: { id: string; email?: string } | null;
  tables?: Record<string, Row[]>;
}) {
  let currentUser = options?.user ?? null;
  const tables: Record<string, Row[]> = options?.tables ?? {};
  let idSeq = 1;
  let authChangeCallback: (() => void) | null = null;

  function from(table: string) {
    const rows = tables[table] ?? (tables[table] = []);
    const filters: ((r: Row) => boolean)[] = [];
    let op: "select" | "insert" | "update" | "delete" = "select";
    let opValues: Row | Row[] | null = null;

    function matched() {
      return rows.filter((r) => filters.every((f) => f(r)));
    }

    function execute() {
      if (op === "insert") {
        const toInsert = Array.isArray(opValues) ? opValues : [opValues as Row];
        const inserted = toInsert.map((v) => ({ id: `row_${idSeq++}`, ...v }));
        rows.push(...inserted);
        return { data: inserted, error: null };
      }
      if (op === "update") {
        matched().forEach((r) => Object.assign(r, opValues as Row));
        return { data: null, error: null };
      }
      if (op === "delete") {
        const keep = rows.filter((r) => !filters.every((f) => f(r)));
        tables[table] = keep;
        return { data: null, error: null };
      }
      // cart_items/wishlist_items selects always join the product in the
      // real code (`select("*, product:products(*)")`) — this fake doesn't
      // parse select strings, so it just always embeds it for these two
      // tables rather than trying to detect which selects asked for it.
      if (table === "cart_items" || table === "wishlist_items") {
        const products = tables.products ?? [];
        return {
          data: matched().map((r) => ({
            ...r,
            product: products.find((p) => p.id === r.product_id) ?? null,
          })),
          error: null,
        };
      }
      return { data: matched(), error: null };
    }

    const builder = {
      select() {
        return builder;
      },
      eq(col: string, val: unknown) {
        filters.push((r) => r[col] === val);
        return builder;
      },
      in(col: string, vals: unknown[]) {
        filters.push((r) => vals.includes(r[col]));
        return builder;
      },
      insert(values: Row | Row[]) {
        op = "insert";
        opValues = values;
        return Promise.resolve(execute());
      },
      update(values: Row) {
        op = "update";
        opValues = values;
        return builder;
      },
      delete() {
        op = "delete";
        return builder;
      },
      maybeSingle() {
        const [first] = matched();
        return Promise.resolve({ data: first ?? null, error: null });
      },
      single() {
        const [first] = matched();
        return Promise.resolve({ data: first ?? null, error: null });
      },
      then(
        onFulfilled: (value: { data: unknown; error: null }) => unknown,
        onRejected?: (reason: unknown) => unknown
      ) {
        return Promise.resolve(execute()).then(onFulfilled, onRejected);
      },
    };
    return builder;
  }

  return {
    from,
    auth: {
      getUser: async () => ({ data: { user: currentUser } }),
      onAuthStateChange: (cb: () => void) => {
        authChangeCallback = cb;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      },
    },
    // Test-only helpers, not part of the real Supabase client surface.
    __signIn(user: { id: string; email?: string }) {
      currentUser = user;
      authChangeCallback?.();
    },
    __tables: tables,
  };
}

export type FakeSupabase = ReturnType<typeof createFakeSupabase>;
