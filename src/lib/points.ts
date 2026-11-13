import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Gamification points helpers (server-only — service role client).
 *
 * Points are priced live from the admin-editable score_actions table, so
 * admins can re-price without code changes. One-time actions
 * (newsletter_subscribe, strava_connect, profile_complete) are guarded by the
 * score_entries_onetime_uidx partial unique index (profile_id, action_key
 * where event_id is null) — replays are silently ignored via
 * ignoreDuplicates. Event attendance is awarded inside check_in_with_token
 * (RPC) instead, since it is repeatable per event.
 */

/** Award a one-time action's points to a profile. Never throws. */
export async function awardOneTimeAction(profileId: string, actionKey: string): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data: action } = await admin
      .from("score_actions")
      .select("points")
      .eq("key", actionKey)
      .eq("is_active", true)
      .maybeSingle();
    if (!action) return;

    const { error } = await admin
      .from("score_entries")
      .upsert(
        { profile_id: profileId, action_key: actionKey, points: action.points },
        { ignoreDuplicates: true },
      );
    if (error) console.error("awardOneTimeAction insert failed:", error.code, error.message);
  } catch (err) {
    console.error("awardOneTimeAction failed:", err);
  }
}

/** Resolve an auth user's profile id from their email, or null. Never throws. */
export async function findProfileIdByEmail(email: string): Promise<string | null> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("get_profile_id_by_email", { p_email: email });
    if (error) {
      console.error("findProfileIdByEmail failed:", error.code, error.message);
      return null;
    }
    return (data as string | null) ?? null;
  } catch (err) {
    console.error("findProfileIdByEmail failed:", err);
    return null;
  }
}
