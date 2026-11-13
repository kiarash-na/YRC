"use server";

import { awardOneTimeAction, findProfileIdByEmail } from "@/lib/points";
import { createAdminClient } from "@/lib/supabase/admin";

export type RsvpResult = { status: "ok" } | { status: "error"; message: string };

const ERROR_MESSAGE = "Couldn't save your spot. Try again in a minute.";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Save a per-event RSVP with contact capture (no account needed).
 * event_rsvps has RLS on with no policies, so writes go through the
 * service-role client here only. Re-submitting with the same email is an
 * idempotent replay: the first name refreshes only when a non-empty one is
 * given, and a newsletter opt-in once given is never revoked from this form.
 * When the opt-in matches a member profile, the one-time newsletter_subscribe
 * points are awarded (never blocks the result).
 */
export async function rsvpToEvent(
  eventId: string,
  eventSlug: string,
  formData: FormData,
): Promise<RsvpResult> {
  // Honeypot: the hidden "company" field is invisible to humans — any value
  // means a bot. Swallow silently (report success, write nothing).
  if (String(formData.get("company") ?? "") !== "") {
    return { status: "ok" };
  }

  if (!UUID_RE.test(eventId)) {
    console.error("rsvpToEvent called with a non-UUID event id:", eventSlug, eventId);
    return { status: "error", message: ERROR_MESSAGE };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase()
    .slice(0, 200);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  const firstName = String(formData.get("first_name") ?? "")
    .trim()
    .slice(0, 100);
  const newsletterOptIn = formData.get("newsletter") === "on";

  const admin = createAdminClient();
  const { error } = await admin.from("event_rsvps").insert({
    event_id: eventId,
    email,
    first_name: firstName,
    newsletter_opt_in: newsletterOptIn,
  });

  if (error) {
    if (error.code !== "23505") {
      console.error("rsvpToEvent insert failed:", eventSlug, error.code, error.message);
      return { status: "error", message: ERROR_MESSAGE };
    }
    // Unique violation — already RSVP'd. Merge instead of failing: refresh
    // the first name only when one was given; keep the opt-in once true.
    const { data: existing, error: readError } = await admin
      .from("event_rsvps")
      .select("newsletter_opt_in")
      .eq("event_id", eventId)
      .eq("email", email)
      .single();
    if (readError) {
      console.error("rsvpToEvent read failed:", eventSlug, readError.code, readError.message);
      return { status: "error", message: ERROR_MESSAGE };
    }
    const merged: { first_name?: string; newsletter_opt_in: boolean } = {
      newsletter_opt_in: Boolean(existing.newsletter_opt_in) || newsletterOptIn,
    };
    if (firstName) merged.first_name = firstName;
    const { error: updateError } = await admin
      .from("event_rsvps")
      .update(merged)
      .eq("event_id", eventId)
      .eq("email", email);
    if (updateError) {
      console.error("rsvpToEvent update failed:", eventSlug, updateError.code, updateError.message);
      return { status: "error", message: ERROR_MESSAGE };
    }
  }

  if (newsletterOptIn) {
    // Upsert equivalent (insert, on unique violation refresh a non-empty
    // first name) so a replay never blanks a stored name or resets the
    // original source. The RSVP row is already saved at this point, so
    // newsletter trouble is logged but must not report the spot as lost.
    const { error: subError } = await admin
      .from("newsletter_subscribers")
      .insert({ email, first_name: firstName, source: "rsvp" });
    if (subError) {
      if (subError.code === "23505") {
        if (firstName) {
          const { error: subUpdateError } = await admin
            .from("newsletter_subscribers")
            .update({ first_name: firstName })
            .eq("email", email);
          if (subUpdateError) {
            console.error(
              "rsvpToEvent newsletter update failed:",
              subUpdateError.code,
              subUpdateError.message,
            );
          }
        }
      } else {
        console.error("rsvpToEvent newsletter insert failed:", subError.code, subError.message);
      }
    }

    const profileId = await findProfileIdByEmail(email);
    if (profileId) await awardOneTimeAction(profileId, "newsletter_subscribe");
  }

  return { status: "ok" };
}
