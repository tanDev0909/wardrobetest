// Browser Supabase client. Returns null when env vars are missing (or
// NEXT_PUBLIC_DISABLE_BACKEND=1, used by the e2e suite) so the app keeps
// working in its original in-memory mode.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const disabled = process.env.NEXT_PUBLIC_DISABLE_BACKEND === "1";

export const STORAGE_BUCKET = "wardrobe";

export const supabase: SupabaseClient | null =
  url && anonKey && !disabled ? createClient(url, anonKey) : null;

export const isBackendEnabled = supabase !== null;

/**
 * Make sure this browser has a user. Uses Supabase anonymous sign-in, so there
 * is no login screen; the account can be upgraded to email later without
 * losing data. Returns the user id, or null when the backend is disabled.
 */
export async function ensureUser(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session.user.id;
  const { data: signedIn, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return signedIn.user?.id ?? null;
}

/** Public URL for an object in the wardrobe bucket. */
export function publicImageUrl(path: string): string | undefined {
  return supabase?.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}
