import { redirect } from "next/navigation";

import { safeNext } from "@/lib/safe-next";
import { createClient } from "@/lib/supabase/server";

type EmailOtpType = "magiclink" | "signup" | "invite" | "recovery" | "email_change" | "email";

/**
 * GET /auth/confirm?token_hash=…&type=magiclink&next=…
 * Verifies the one-time token minted by the Strava callback and establishes
 * the session cookie (allowed here because this is a Route Handler).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = (url.searchParams.get("type") ?? "magiclink") as EmailOtpType;
  const next = safeNext(url.searchParams.get("next"));

  let verified = false;
  if (tokenHash) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    verified = !error;
  }

  redirect(verified ? next : "/login?error=confirm");
}
