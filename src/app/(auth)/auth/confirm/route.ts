import { redirect } from "next/navigation";

import { safeNext } from "@/lib/safe-next";
import { createClient } from "@/lib/supabase/server";

type EmailOtpType = "magiclink" | "signup" | "invite" | "recovery" | "email_change" | "email";

/**
 * GET /auth/confirm — establishes the session for both login paths:
 *   ?code=…                         → PKCE exchange (magic-link emails)
 *   ?token_hash=…&type=magiclink    → OTP verify (Strava callback handoff)
 * Cookie writes are allowed here because this is a Route Handler.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = (url.searchParams.get("type") ?? "magiclink") as EmailOtpType;
  const next = safeNext(url.searchParams.get("next"));

  let verified = false;
  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    verified = !error;
  } else if (tokenHash) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    verified = !error;
  }

  redirect(verified ? next : "/login?error=confirm");
}
