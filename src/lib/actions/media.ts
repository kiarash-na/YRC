"use server";

import { getUploadAuthParams } from "@imagekit/next/server";

import { requireAdmin } from "@/lib/admin";

export type UploadAuthResult =
  | { ok: true; token: string; expire: number; signature: string; publicKey: string }
  | { ok: false; error: string };

/**
 * Short-lived ImageKit upload credentials for an admin. The browser uploads
 * the file straight to ImageKit with these (no file bytes pass through our
 * server, so Vercel's request-size limit doesn't apply). The private key only
 * signs here; it never leaves the server. Tokens expire after 10 minutes and
 * ImageKit accepts each token once.
 */
export async function getImageKitUploadAuth(): Promise<UploadAuthResult> {
  await requireAdmin();

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  if (!privateKey || !publicKey) {
    return {
      ok: false,
      error: "Uploads aren't configured here: set IMAGEKIT_PUBLIC_KEY and IMAGEKIT_PRIVATE_KEY.",
    };
  }

  const auth = getUploadAuthParams({
    privateKey,
    publicKey,
    expire: Math.floor(Date.now() / 1000) + 10 * 60,
  });
  return { ok: true, ...auth, publicKey };
}
