"use server";

import { revalidatePath } from "next/cache";

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

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: clean(formData.get("first_name")),
      last_name: clean(formData.get("last_name")),
      city: clean(formData.get("city")) || null,
      country: clean(formData.get("country")) || null,
    })
    .eq("id", user.id);

  if (error) return { status: "error", message: "Could not save. Please try again." };

  revalidatePath("/profile");
  revalidatePath("/profile/settings");
  return { status: "ok" };
}
