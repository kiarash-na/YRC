"use server";

import { revalidatePath } from "next/cache";

import { awardOneTimeAction } from "@/lib/points";
import { createClient } from "@/lib/supabase/server";

export type UpdateProfileResult = { status: "ok" } | { status: "error"; message: string };

function clean(value: FormDataEntryValue | null, max = 100): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Update the signed-in member's own profile (RLS enforces ownership). */
export async function updateProfile(formData: FormData): Promise<UpdateProfileResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Not signed in." };

  const firstName = clean(formData.get("first_name"));
  const lastName = clean(formData.get("last_name"));
  const city = clean(formData.get("city"));
  const country = clean(formData.get("country"));

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
      city: city || null,
      country: country || null,
      // The checkbox only submits when checked; absence means opted out.
      leaderboard_opt_out: formData.get("leaderboard_visible") !== "on",
    })
    .eq("id", user.id);

  if (error) return { status: "error", message: "Could not save. Please try again." };

  // One-time strides for a fully filled-in profile (insert is idempotent).
  if (firstName && lastName && city && country) {
    await awardOneTimeAction(user.id, "profile_complete");
  }

  revalidatePath("/profile");
  revalidatePath("/profile/settings");
  return { status: "ok" };
}
