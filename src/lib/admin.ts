import { notFound, redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Guard for every admin page and server action: requires a logged-in member
 * whose Strava athlete ID is linked to a seat in the `admins` table.
 * Returns a service-role client for the actual work (RLS-bypassing).
 */
export async function requireAdmin() {
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

  const athleteId = profile?.strava_athlete_id;
  if (!athleteId) notFound();

  const { data: seat } = await admin
    .from("admins")
    .select("id")
    .eq("strava_athlete_id", athleteId)
    .maybeSingle();

  if (!seat) notFound();

  return { user, admin, athleteId };
}
