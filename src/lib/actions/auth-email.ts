"use server";

import { headers } from "next/headers";

import { safeNext } from "@/lib/safe-next";
import { createClient } from "@/lib/supabase/server";

export type SendLoginEmailResult =
  | { status: "sent" }
  | { status: "error"; message: string };

/** Last-resort origin when neither env nor a recognized host header exists. */
const PROD_ORIGIN = "https://yasrise.run";

/** Hosts the header-derived origin fallback may trust (must match the Supabase Auth redirect allow-list). */
const ALLOWED_FALLBACK_HOSTS = new Set([
  "yasrise.run",
  "www.yasrise.run",
  "yrc-dev.kiarash.online",
  "localhost:3000",
  "localhost:3001",
  "127.0.0.1:3000",
  "127.0.0.1:3001",
]);

/**
 * Send a magic-link login email (PKCE flow). The link lands on
 * /auth/confirm?code=… which exchanges it for a session.
 * Creates the account on first use (shouldCreateUser).
 */
export async function sendLoginEmail(
  email: string,
  next?: string,
): Promise<SendLoginEmailResult> {
  const cleanEmail = email.trim().toLowerCase().slice(0, 200);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  // NEXT_PUBLIC_SITE_URL is the source of truth. The header-derived fallback
  // exists only for local tooling and is allow-listed: raw Host /
  // X-Forwarded-Host are attacker-controllable per request, and a poisoned
  // origin here would put an attacker's domain into the login email's
  // /auth/confirm link (capturing the PKCE code on click).
  const headerStore = await headers();
  const host = (headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "")
    .toLowerCase();
  const proto = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  const headerOrigin = ALLOWED_FALLBACK_HOSTS.has(host) ? `${proto}://${host}` : null;
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? headerOrigin ?? PROD_ORIGIN;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: cleanEmail,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(safeNext(next))}`,
    },
  });

  if (error) {
    console.error("sendLoginEmail failed:", error.status, error.code, error.message);
    if (error.code === "over_email_send_rate_limit") {
      // Same code for two limits: the per-address cooldown ("…only request this
      // after N seconds") and the project-wide hourly cap (Auth → Rate Limits).
      const wait = error.message.match(/after (\d+) seconds/)?.[1];
      return {
        status: "error",
        message: wait
          ? `A login link was just sent. Check your inbox, or request another in ${wait}s.`
          : "Too many login emails were sent recently. Try again later, or continue with Strava.",
      };
    }
    if (error.code === "over_request_rate_limit") {
      // Per-IP request limit.
      return { status: "error", message: "Too many attempts. Wait a minute and try again." };
    }
    return { status: "error", message: "Couldn't send the login email. Try again in a minute." };
  }
  return { status: "sent" };
}
