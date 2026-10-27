import { createClient } from "@supabase/supabase-js";

/**
 * SERVER ONLY — service-role client that bypasses RLS.
 * Never import from client components; never expose the key via NEXT_PUBLIC_.
 * Only use after verifying the caller is an admin (see src/lib/admin.ts),
 * or in the login flow where no session exists yet.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
