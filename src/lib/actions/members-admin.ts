"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin";

/**
 * Admin member management. Every action re-checks requireAdmin() before
 * touching the service-role client.
 */

function str(formData: FormData, key: string, max: number): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function revalidateMemberPaths(profileId: string) {
  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${profileId}`);
  // Names and points show on the public leaderboards.
  revalidatePath("/");
  revalidatePath("/community");
}

/** Edit the member's public profile fields (name and location). */
export async function updateMember(profileId: string, formData: FormData): Promise<void> {
  const { admin } = await requireAdmin();
  const { error } = await admin
    .from("profiles")
    .update({
      first_name: str(formData, "first_name", 100),
      last_name: str(formData, "last_name", 100),
      city: str(formData, "city", 100) || null,
      country: str(formData, "country", 100) || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId);
  if (error) console.error("updateMember failed:", error.code, error.message);
  revalidateMemberPaths(profileId);
}

/** Show or hide the member on the public leaderboards. */
export async function setMemberLeaderboardHidden(profileId: string, hidden: boolean): Promise<void> {
  const { admin } = await requireAdmin();
  const { error } = await admin
    .from("profiles")
    .update({ leaderboard_opt_out: hidden, updated_at: new Date().toISOString() })
    .eq("id", profileId);
  if (error) console.error("setMemberLeaderboardHidden failed:", error.code, error.message);
  revalidateMemberPaths(profileId);
}

export type DeleteMemberResult = { status: "error"; message: string };

/**
 * Permanently delete a member: removes their auth account, which cascades to
 * the profile, Strava tokens, points ledger, registrations and check-ins.
 * Refused for the caller's own account and for anyone holding an admin seat
 * (remove the seat first). `confirmation` must equal the member's display
 * name, or "DELETE" when they have no name.
 */
export async function deleteMember(
  profileId: string,
  confirmation: string,
): Promise<DeleteMemberResult> {
  const { admin, user } = await requireAdmin();

  if (profileId === user.id) {
    return { status: "error", message: "You can't delete your own account here." };
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("id, first_name, last_name, strava_athlete_id")
    .eq("id", profileId)
    .maybeSingle();
  if (!profile) return { status: "error", message: "Member not found." };

  const expected = `${profile.first_name} ${profile.last_name}`.trim() || "DELETE";
  if (confirmation.trim() !== expected) {
    return { status: "error", message: `Type "${expected}" exactly to confirm.` };
  }

  // Same seat-matching rule as requireAdmin(): linked athlete or seat email.
  const { data: authUser } = await admin.auth.admin.getUserById(profileId);
  const email = authUser.user?.email?.toLowerCase();
  const { data: seats } = await admin.from("admins").select("email, strava_athlete_id");
  const holdsSeat = (seats ?? []).some(
    (s) =>
      (profile.strava_athlete_id != null && s.strava_athlete_id === profile.strava_athlete_id) ||
      (email !== undefined && s.email.toLowerCase() === email),
  );
  if (holdsSeat) {
    return {
      status: "error",
      message: "This member holds an admin seat. Remove the seat under Admins first.",
    };
  }

  const { error } = await admin.auth.admin.deleteUser(profileId);
  if (error) {
    console.error("deleteMember failed:", error.code, error.message);
    return { status: "error", message: "Couldn't delete this member. Try again." };
  }

  revalidateMemberPaths(profileId);
  redirect("/admin/members");
}
