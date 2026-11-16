import type { User } from "@supabase/supabase-js";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";

import { E2E_ADMIN, isE2ERequest } from "@/lib/e2e";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export interface AdminSeat {
  id: string;
  email: string;
  strava_athlete_id: number | null;
}

/**
 * Guard for every admin page and server action: requires a logged-in member
 * holding a seat in the `admins` table. A seat matches by its linked Strava
 * athlete ID, or by the seat email matching the member's auth email (so a
 * magic-link login with the seat's email is instantly admin) — same rule as
 * the is_admin() database function.
 * Returns a service-role client for the actual work (RLS-bypassing).
 * Memoized per request: the admin layout and its page share one lookup.
 */
export const requireAdmin = cache(async () => {
  // Token-free e2e mode only (gated in src/lib/e2e.ts; never on production).
  if (await isE2ERequest()) {
    return {
      user: { id: E2E_ADMIN.userId, email: E2E_ADMIN.email } as User,
      admin: createAdminClient(),
      seat: { id: E2E_ADMIN.seatId, email: E2E_ADMIN.email, strava_athlete_id: null } satisfies AdminSeat,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("strava_athlete_id")
    .eq("id", user.id)
    .single();

  const athleteId: number | null = profile?.strava_athlete_id ?? null;

  // At most 3 rows by design — fetch all seats and match locally instead of
  // building an .or() filter string around user email text.
  const { data: seats } = await admin
    .from("admins")
    .select("id, email, strava_athlete_id");

  const email = user.email?.toLowerCase();
  const seat = ((seats ?? []) as AdminSeat[]).find(
    (s) =>
      (athleteId !== null && s.strava_athlete_id === athleteId) ||
      (email !== undefined && s.email.toLowerCase() === email),
  );

  if (!seat) notFound();

  return { user, admin, seat };
});
