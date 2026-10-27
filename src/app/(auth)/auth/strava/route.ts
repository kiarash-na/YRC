import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { safeNext } from "@/lib/safe-next";

/**
 * GET /auth/strava?next=/checkin/<token>
 * Starts the Strava OAuth flow: stores CSRF state + return path in cookies,
 * then redirects to Strava's authorize page. Scope `read` = identity only.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const isHttps = url.protocol === "https:";

  const state = randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  const cookieOptions = {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax" as const,
    maxAge: 600,
    path: "/",
  };
  cookieStore.set("strava_oauth_state", state, cookieOptions);
  cookieStore.set("strava_oauth_next", safeNext(url.searchParams.get("next")), cookieOptions);

  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    redirect_uri: `${url.origin}/auth/callback/strava`,
    response_type: "code",
    approval_prompt: "auto",
    scope: "read",
    state,
  });

  redirect(`https://www.strava.com/oauth/authorize?${params.toString()}`);
}
