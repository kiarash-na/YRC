import { buildSrc } from "@/components/imagekit";

/**
 * Shared ImageKit endpoint — configured per environment (Dokploy/Vercel),
 * never committed. Empty string means "not configured" and callers should
 * degrade gracefully (no LQIP background).
 */
export const IMAGEKIT_URL_ENDPOINT =
  process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? "";

/**
 * Low-quality image placeholder (LQIP) for ImageKit-hosted assets.
 *
 * Official ImageKit pattern: a heavily blurred, low-quality derivative used
 * as a CSS background-image placeholder, cleared once the full image loads.
 * `updatedAt` is passed as a query parameter so placeholders bust the CDN
 * cache in step with the full-size image whenever an asset is re-uploaded.
 */
export const lqip = (src: string, updatedAt?: string) =>
  IMAGEKIT_URL_ENDPOINT
    ? buildSrc({
        src,
        urlEndpoint: IMAGEKIT_URL_ENDPOINT,
        transformation: [{ quality: 10, blur: 90 }],
        queryParameters: updatedAt ? { updatedAt } : undefined,
      })
    : "";
