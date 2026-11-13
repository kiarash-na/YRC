"use server";

import { awardOneTimeAction, findProfileIdByEmail } from "@/lib/points";
import { createAdminClient } from "@/lib/supabase/admin";

export type SubscribeResult =
  | { status: "subscribed" }
  | { status: "error"; message: string };

const ERROR_MESSAGE = "Couldn't subscribe you right now. Try again in a minute.";

/**
 * Subscribe an email to the newsletter (website form).
 * newsletter_subscribers has RLS on with no policies, so writes go through the
 * service-role client here only. A returning email keeps its row; a non-empty
 * first name refreshes it. When the email matches a member profile, the
 * one-time newsletter_subscribe points are awarded (never blocks the result).
 */
export async function subscribeToNewsletter(
  formData: FormData,
): Promise<SubscribeResult> {
  // Honeypot: the hidden "company" field is invisible to humans — any value
  // means a bot. Swallow silently (report success, write nothing).
  if (String(formData.get("company") ?? "") !== "") {
    return { status: "subscribed" };
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

  const admin = createAdminClient();
  const { error } = await admin
    .from("newsletter_subscribers")
    .insert({ email, first_name: firstName, source: "website" });

  if (error) {
    if (error.code === "23505") {
      // Unique violation — already subscribed. Refresh the first name only
      // when one was given, so an empty submission never wipes a stored name.
      if (firstName) {
        const { error: updateError } = await admin
          .from("newsletter_subscribers")
          .update({ first_name: firstName })
          .eq("email", email);
        if (updateError) {
          console.error(
            "subscribeToNewsletter update failed:",
            updateError.code,
            updateError.message,
          );
          return { status: "error", message: ERROR_MESSAGE };
        }
      }
    } else {
      console.error("subscribeToNewsletter insert failed:", error.code, error.message);
      return { status: "error", message: ERROR_MESSAGE };
    }
  }

  const profileId = await findProfileIdByEmail(email);
  if (profileId) await awardOneTimeAction(profileId, "newsletter_subscribe");

  return { status: "subscribed" };
}
