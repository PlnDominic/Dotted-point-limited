#!/usr/bin/env node
/**
 * Weekly Supabase keep-alive script.
 *
 * Supabase's free tier auto-pauses a project after ~7 days with no
 * detected activity. This script performs a handful of lightweight,
 * read-only queries against the project so it registers as active
 * traffic, then exits. It never writes any data.
 *
 * Intended to run on a schedule (see .github/workflows/supabase-keepalive.yml,
 * which fires every Monday) but can also be run manually:
 *
 *   node scripts/keep-supabase-active.mjs
 *
 * Required environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL       - Supabase project URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY  - Supabase anon/public API key
 *
 * Both already exist as the app's normal client-side Supabase config
 * (see src/lib/supabase/client.ts), so no new secrets are strictly
 * required beyond what the app already needs to run.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl === "your-project-url") {
  console.error(
    "[keep-supabase-active] Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY — cannot ping Supabase."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// A small spread of public, read-only tables. Hitting more than one
// endpoint makes the "activity" look like normal app traffic rather than
// a single synthetic request, and gives us a fallback if any one table
// is empty, renamed, or RLS-restricted.
const CHECKS = [
  { table: "products", columns: "id" },
  { table: "hero_content", columns: "id" },
  { table: "capabilities", columns: "id" },
  { table: "recent_work", columns: "id" },
];

async function pingTable({ table, columns }) {
  const { data, error, count } = await supabase
    .from(table)
    .select(columns, { count: "exact", head: false })
    .limit(1);

  if (error) {
    return { table, ok: false, detail: error.message };
  }

  return { table, ok: true, detail: `rows≈${count ?? data?.length ?? 0}` };
}

async function main() {
  const startedAt = new Date().toISOString();
  console.log(`[keep-supabase-active] Starting keep-alive run at ${startedAt}`);
  console.log(`[keep-supabase-active] Target project: ${supabaseUrl}`);

  const results = await Promise.all(CHECKS.map(pingTable));

  let anySucceeded = false;
  for (const result of results) {
    if (result.ok) {
      anySucceeded = true;
      console.log(`[keep-supabase-active] OK   ${result.table} (${result.detail})`);
    } else {
      console.warn(`[keep-supabase-active] FAIL ${result.table} — ${result.detail}`);
    }
  }

  if (!anySucceeded) {
    console.error(
      "[keep-supabase-active] Every table query failed — Supabase may be unreachable, paused, or misconfigured."
    );
    process.exit(1);
  }

  console.log(
    `[keep-supabase-active] Done. ${results.filter((r) => r.ok).length}/${results.length} checks succeeded.`
  );
}

main().catch((err) => {
  console.error("[keep-supabase-active] Unexpected error:", err);
  process.exit(1);
});
