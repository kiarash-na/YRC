"use server";

import { createClient } from "@/lib/supabase/server";

export type RegistrationResult = {
  status: "registered" | "not_authenticated" | "closed" | "error";
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Register the signed-in member for an upcoming event.
 *
 * Runs with the member's OWN session (never the service role): the
 * event_registrations RLS policy is the authority — it only accepts a row
 * for auth.uid() on an event that is not past. Idempotent: registering
 * twice reports "registered".
 */
export async function registerForEvent(
  eventId: string,
): Promise<RegistrationResult> {
  if (!UUID_RE.test(eventId)) return { status: "error" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "not_authenticated" };

  const { error } = await supabase
    .from("event_registrations")
    .insert({ event_id: eventId, profile_id: user.id });

  if (!error || error.code === "23505") return { status: "registered" };
  // 42501 = RLS check failed → the event has passed (or doesn't exist).
  if (error.code === "42501") return { status: "closed" };
  console.error("registerForEvent failed:", error.code, error.message);
  return { status: "error" };
}
