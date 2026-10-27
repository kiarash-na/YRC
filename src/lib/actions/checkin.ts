"use server";

import { createClient } from "@/lib/supabase/server";

export type CheckInResult = {
  status:
    | "checked_in"
    | "already_checked_in"
    | "invalid_token"
    | "not_authenticated"
    | "no_profile"
    | "error";
  points?: number;
  eventTitle?: string;
};

/**
 * Check the signed-in member into an event via its QR token.
 * All validation happens inside the `check_in_with_token` database function —
 * the token secret is never exposed to the client.
 */
export async function checkIn(token: string): Promise<CheckInResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("check_in_with_token", {
    qr_token: token,
  });

  if (error || !data) return { status: "error" };

  const result = data as {
    status: CheckInResult["status"];
    points?: number;
    event?: { title?: string };
  };

  return {
    status: result.status ?? "error",
    points: result.points,
    eventTitle: result.event?.title,
  };
}
