// Keep-alive: Vercel Cron hits this daily (see vercel.json) so the free
// Supabase project never reaches 7 days of inactivity and pauses.

import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return Response.json({ ok: true, backend: "disabled" });
  }

  // RLS returns zero rows for an unauthenticated caller, but the query still
  // reaches Postgres, which is what counts as activity.
  const { error } = await createClient(url, anonKey).from("items").select("id").limit(1);
  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 503 });
  }
  return Response.json({ ok: true, backend: "supabase" });
}
