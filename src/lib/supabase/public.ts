import { createClient } from "@supabase/supabase-js";

/**
 * Anon-key data client with no cookie/session coupling — for public content
 * (events) rendered by Server Components. RLS still applies (public read).
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
