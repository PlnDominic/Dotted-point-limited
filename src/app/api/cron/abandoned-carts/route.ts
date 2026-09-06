import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
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

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  if (request.headers.get("x-cron-secret") !== cronSecret) {
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
