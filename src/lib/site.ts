/** Canonical public origin — production unless an environment overrides it. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://yasrise.run").replace(/\/$/, "");

/**
 * Only the production site should be indexed; the Dokploy preview and local
 * dev opt out. Vercel production always counts, whatever SITE_URL says, so a
 * www/apex mismatch can never de-index the live site.
 */
export const IS_PRODUCTION_SITE =
  process.env.VERCEL_ENV === "production" ||
  /^https:\/\/(www\.)?yasrise\.run$/.test(SITE_URL);
