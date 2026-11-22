import "server-only";

import type { EventItem, EventMedia } from "@/lib/content-shared";
import { IMAGEKIT_URL_ENDPOINT } from "@/lib/imagekit";

/*
 * The event page's top slideshow: the cover plus every gallery item, kept
 * to one orientation so every slide fits the frame without cropping. The
 * shapes come from a tiny ImageKit render of each image (or a clip's poster)
 * — 64 px wide, cached for a day — read straight from the JPEG/PNG header.
 */

export type Orientation = "portrait" | "landscape";

export interface EventSlides {
  orientation: Orientation;
  items: EventMedia[];
}

/** Width ÷ height from a JPEG (SOF marker) or PNG (IHDR) header, else null. */
export function imageRatio(bytes: Uint8Array): number | null {
  // PNG: 8-byte signature, then IHDR with width/height as big-endian u32.
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes.length >= 24) {
    const view = new DataView(bytes.buffer, bytes.byteOffset);
    const w = view.getUint32(16);
    const h = view.getUint32(20);
    return w && h ? w / h : null;
  }
  // JPEG: walk the markers to the first start-of-frame.
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < bytes.length) {
    if (bytes[i] !== 0xff) return null;
    const marker = bytes[i + 1];
    const length = (bytes[i + 2] << 8) | bytes[i + 3];
    const isSof = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
    if (isSof) {
      const h = (bytes[i + 5] << 8) | bytes[i + 6];
      const w = (bytes[i + 7] << 8) | bytes[i + 8];
      return w && h ? w / h : null;
    }
    i += 2 + length;
  }
  return null;
}

async function probeRatio(path: string): Promise<number | null> {
  if (!IMAGEKIT_URL_ENDPOINT) return null;
  try {
    const res = await fetch(`${IMAGEKIT_URL_ENDPOINT}${path}?tr=w-64`, {
      headers: { accept: "image/jpeg,image/png" },
      next: { revalidate: 86_400 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    return imageRatio(new Uint8Array(await res.arrayBuffer()));
  } catch {
    return null;
  }
}

const orientationOf = (ratio: number | null): Orientation | "square" | null =>
  ratio === null ? null : ratio < 0.95 ? "portrait" : ratio > 1.05 ? "landscape" : "square";

/**
 * Picks the orientation most of the event's media shares (ties go to the
 * cover's) and keeps only media of that shape (squares fit either). Media
 * whose shape can't be read — e.g. a clip without a poster — is left out.
 */
export function pickSlides(
  media: EventMedia[],
  ratios: (number | null)[],
): EventSlides {
  const shapes = ratios.map(orientationOf);
  const portrait = shapes.filter((s) => s === "portrait").length;
  const landscape = shapes.filter((s) => s === "landscape").length;
  const orientation: Orientation =
    portrait === landscape
      ? shapes[0] === "landscape"
        ? "landscape"
        : "portrait"
      : portrait > landscape
        ? "portrait"
        : "landscape";
  return {
    orientation,
    items: media.filter((_, i) => shapes[i] === orientation || shapes[i] === "square"),
  };
}

export async function getEventSlides(event: Pick<EventItem, "cover" | "title" | "gallery">): Promise<EventSlides> {
  const seen = new Set<string>();
  const media: EventMedia[] = [];
  for (const item of [{ src: event.cover, type: "image" as const, alt: event.title }, ...(event.gallery ?? [])]) {
    if (!item.src || seen.has(item.src)) continue;
    seen.add(item.src);
    media.push(item);
  }
  const ratios = await Promise.all(
    media.map((item) => {
      const still = item.type === "image" ? item.src : item.poster;
      return still ? probeRatio(still) : Promise.resolve(null);
    }),
  );
  return pickSlides(media, ratios);
}
