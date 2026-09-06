import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "crypto";
import { sendAbandonedCartEmail } from "@/lib/email";

// Triggered on a schedule by .github/workflows/abandoned-cart-reminders.yml.
// Not user-facing, so it's authenticated by a shared secret header rather
// than a Supabase session — CRON_SECRET must be set on both this app
// (Vercel project env vars) and as a GitHub Actions secret with the same
// value.
//
// Needs the service-role key (not the anon key everything else in this
// app uses) because get_abandoned_carts() reads auth.users, which isn't
// exposed to anon/authenticated at all — see supabase/schema.sql.
type AbandonedCart = {
  user_id: string;
  email: string;
  item_count: number;
  subtotal: number;
};

// Plain !== leaks timing information proportional to how many leading
// characters match, which — over enough requests — can help an attacker
// guess the secret faster than brute force alone would allow. Comparing
// byte-for-byte in constant time closes that side channel.
function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // timingSafeEqual throws on length mismatch, and the length mismatch
  // itself would leak — hash both to a fixed length first isn't needed
  // here since padding to the longer length keeps the comparison
  // constant-time while still returning false for a length mismatch.
  const maxLen = Math.max(bufA.length, bufB.length);
  const paddedA = Buffer.alloc(maxLen);
  const paddedB = Buffer.alloc(maxLen);
  bufA.copy(paddedA);
  bufB.copy(paddedB);
  return bufA.length === bufB.length && timingSafeEqual(paddedA, paddedB);
}

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const provided = request.headers.get("x-cron-secret") ?? "";
  if (!timingSafeStringEqual(provided, cronSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured" },
      { status: 500 }
    );
  }
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Defense in depth beyond the secret check above: this job is only ever
  // meant to run about once a day, so refuse a repeat within the hour —
  // caps the damage of the secret being guessed/leaked or the endpoint
  // simply being hammered, without needing anything beyond this table.
  const { data: lastRun } = await supabase
    .from("cron_run_log")
    .select("last_run_at")
    .eq("job_name", "abandoned-carts")
    .maybeSingle();

  if (lastRun && new Date(lastRun.last_run_at).getTime() > Date.now() - 55 * 60 * 1000) {
    return NextResponse.json({ error: "Ran too recently" }, { status: 429 });
  }

  await supabase
    .from("cron_run_log")
    .upsert({ job_name: "abandoned-carts", last_run_at: new Date().toISOString() });

  const { data: carts, error } = await supabase.rpc("get_abandoned_carts");
  if (error) {
    console.error("get_abandoned_carts error:", error);
    return NextResponse.json({ error: "Failed to fetch abandoned carts" }, { status: 500 });
  }

  let sent = 0;
  for (const cart of (carts ?? []) as AbandonedCart[]) {
    const result = await sendAbandonedCartEmail({
      customerEmail: cart.email,
      itemCount: cart.item_count,
      subtotal: cart.subtotal,
    });

    // Only record the reminder as sent if the email actually went out —
    // if SMTP isn't configured yet, leave the user unmarked so a future
    // run (once it is) still reminds them.
    if (result.sent) {
      sent++;
      await supabase
        .from("abandoned_cart_emails")
        .upsert({ user_id: cart.user_id, sent_at: new Date().toISOString() });
    }
  }

  return NextResponse.json({ checked: carts?.length ?? 0, sent });
}
