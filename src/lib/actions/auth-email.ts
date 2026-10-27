"use server";

import { headers } from "next/headers";

import { safeNext } from "@/lib/safe-next";
import { createClient } from "@/lib/supabase/server";

export type SendLoginEmailResult =
  | { status: "sent" }
  | { status: "error"; message: string };

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

  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "http";
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? `${proto}://${host}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: cleanEmail,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(safeNext(next))}`,
    },
  });

  if (error) {
    console.error("sendLoginEmail failed:", error.message);
    return { status: "error", message: "Couldn't send the login email. Try again in a minute." };
  }
  return { status: "sent" };
}
