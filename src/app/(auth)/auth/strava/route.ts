import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { safeNext } from "@/lib/safe-next";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /auth/strava?next=/checkin/<token>
 * Starts the Strava OAuth flow: stores CSRF state + return path in cookies,
 * then redirects to Strava's authorize page. Scope `read` = identity only.
 *
 * With ?mode=link (from the profile page) the caller must be logged in; the
 * callback then links the Strava athlete to the existing account instead of
 * creating/logging-in a synthetic-email user.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const isHttps = url.protocol === "https:";
  const linkMode = url.searchParams.get("mode") === "link";

  const cookieStore = await cookies();
  const cookieOptions = {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax" as const,
    maxAge: 600,
    path: "/",
  };

  if (linkMode) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login?next=/profile");
    cookieStore.set("strava_link_user", user.id, cookieOptions);
  }

  const state = randomBytes(16).toString("hex");
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
