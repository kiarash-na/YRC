import "server-only";

import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { IS_PRODUCTION_SITE } from "@/lib/site";

/**
 * Token-free end-to-end test mode (see e2e/README.md).
 *
 * Active only when ALL of these hold:
 *  - YRC_E2E=1 and YRC_E2E_SECRET (≥ 24 chars) are set on the server,
 *  - this is not the production site (Vercel production / yasrise.run),
 *  - the request carries the cookie `yrc-e2e=<YRC_E2E_SECRET>`.
 *
 * Then the admin guard admits a fixed test admin, and the Agent runs on a
 * scripted mock model with in-memory fixture tools — no database writes,
 * no model tokens. Never set these variables on a deployed environment.
 */
export const E2E_COOKIE = "yrc-e2e";

export function e2eConfigured(): boolean {
  return (
    process.env.YRC_E2E === "1" &&
    (process.env.YRC_E2E_SECRET?.length ?? 0) >= 24 &&
    !IS_PRODUCTION_SITE &&
    process.env.VERCEL_ENV !== "production"
  );
}

/** Whether a `yrc-e2e` cookie value admits a request (constant-time). */
export function e2eCookieValid(value: string | undefined): boolean {
  if (!e2eConfigured() || !value) return false;
  const secret = process.env.YRC_E2E_SECRET!;
  if (value.length !== secret.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(secret));
}

export async function isE2ERequest(): Promise<boolean> {
  if (!e2eConfigured()) return false;
  return e2eCookieValid((await cookies()).get(E2E_COOKIE)?.value);
}

/** The fixed identity the admin guard returns in test mode. */
export const E2E_ADMIN = {
  userId: "00000000-0000-4000-8000-0000000e2e00",
  email: "e2e-admin@example.test",
  seatId: "00000000-0000-4000-8000-0000000e2e01",
};
