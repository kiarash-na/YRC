import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { safeNext } from "@/lib/safe-next";

interface StravaAthlete {
  id: number;
  firstname?: string | null;
  lastname?: string | null;
  profile?: string | null;
  profile_medium?: string | null;
  city?: string | null;
  country?: string | null;
}

interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  scope?: string;
  athlete: StravaAthlete;
}

/**
 * GET /auth/callback/strava?code=…&state=…
 * Exchanges the code for tokens, upserts the auth user + profile + token
 * vault, then hands off to /auth/confirm to establish the session.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookieStore = await cookies();
  const savedState = cookieStore.get("strava_oauth_state")?.value;
  const next = safeNext(cookieStore.get("strava_oauth_next")?.value);
  cookieStore.delete("strava_oauth_state");
  cookieStore.delete("strava_oauth_next");

  if (!code || !state || !savedState || state !== savedState) {
    redirect("/login?error=oauth_state");
  }

  // --- Exchange the code with Strava (no redirect() inside try/catch) ---
  let tokenData: StravaTokenResponse | null = null;
  try {
    const res = await fetch("https://www.strava.com/api/v3/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID!,
        client_secret: process.env.STRAVA_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
      }),
    });
    if (res.ok) tokenData = (await res.json()) as StravaTokenResponse;
  } catch {
    tokenData = null;
  }
  if (!tokenData?.athlete?.id) {
    redirect("/login?error=exchange");
  }

  const athlete = tokenData.athlete;
  const email = `strava-${athlete.id}@strava.yasrise.run`; // synthetic: Strava has no email
  const admin = createAdminClient();

  // --- Find or create the Supabase auth user ---------------------------
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("strava_athlete_id", athlete.id)
    .maybeSingle();

  let userId = existingProfile?.id as string | undefined;

  let createFailed = false;
  if (!userId) {
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { strava_athlete_id: athlete.id },
    });
    if (error || !created.user) {
      createFailed = true;
    } else {
      userId = created.user.id;
    }
  }
  if (createFailed || !userId) {
    redirect("/login?error=account");
  }

  // --- Upsert profile (fresh Strava data at every login) + token vault --
  const { error: profileError } = await admin.from("profiles").upsert({
    id: userId,
    strava_athlete_id: athlete.id,
    first_name: athlete.firstname ?? "",
    last_name: athlete.lastname ?? "",
    avatar_url: athlete.profile ?? athlete.profile_medium ?? null,
    city: athlete.city ?? null,
    country: athlete.country ?? null,
  });

  const { error: tokenError } = await admin.from("strava_tokens").upsert({
    profile_id: userId,
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_at: new Date(tokenData.expires_at * 1000).toISOString(),
    scope: tokenData.scope ?? "read",
  });

  if (profileError || tokenError) {
    redirect("/login?error=profile");
  }

  // --- Mint a one-time session link and hand off to /auth/confirm ------
  const { data: link, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (linkError || !link?.properties?.hashed_token) {
    redirect("/login?error=session");
  }

  redirect(
    `/auth/confirm?token_hash=${link.properties.hashed_token}&type=magiclink&next=${encodeURIComponent(next)}`,
  );
}
