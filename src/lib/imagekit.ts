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

/**
 * Poster frame for ImageKit-hosted videos.
 *
 * ImageKit serves a video thumbnail at `<video-path>/ik-thumbnail.jpg`.
 * Without an offset it is the first frame and costs no video transformation;
 * `startOffsetSeconds` adds `tr=so-<seconds>`, which DOES count against the
 * account's video-transformation quota (when that quota is exhausted the
 * request 403s with "Video transformations limit exceeded"). Returns "" when
 * the endpoint is not configured, mirroring `lqip`.
 */
export const videoPoster = (src: string, startOffsetSeconds?: number) =>
  IMAGEKIT_URL_ENDPOINT
    ? buildSrc({
        src: `${src}/ik-thumbnail.jpg`,
        urlEndpoint: IMAGEKIT_URL_ENDPOINT,
        queryParameters:
          startOffsetSeconds === undefined
            ? undefined
            : { tr: `so-${startOffsetSeconds}` },
      })
    : "";

/**
 * Query parameters that make ImageKit serve a video file untouched.
 *
 * For browser requests ImageKit otherwise applies automatic video
 * optimisation (WebM/AV1 conversion), which is a video transformation — once
 * the account quota is spent every such request fails with 403. `orig-true`
 * bypasses it and serves the uploaded original.
 */
export const ORIGINAL_VIDEO = { tr: "orig-true" } as const;
