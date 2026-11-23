import { describe, expect, it } from "vitest";

import { SITE_MEDIA_BY_KEY, SITE_MEDIA_SLOTS, normalizeSlotItems, withMedia } from "@/lib/site-media";

const slot = (key: string) => SITE_MEDIA_BY_KEY.get(key)!;

describe("site media slots", () => {
  it("every default fits its own slot", () => {
    for (const s of SITE_MEDIA_SLOTS) {
      expect(normalizeSlotItems(s, s.defaults), s.key).not.toBeNull();
      expect(new Set(SITE_MEDIA_SLOTS.map((x) => x.key)).size).toBe(SITE_MEDIA_SLOTS.length);
    }
  });

  it("enforces fixed counts and gallery bounds", () => {
    const hero = slot("events.hero");
    expect(normalizeSlotItems(hero, [])).toBeNull();
    expect(normalizeSlotItems(hero, [{ src: "/a.jpg", alt: "A" }, { src: "/b.jpg", alt: "B" }])).toHaveLength(1);
    const gallery = slot("home.gallery");
    expect(normalizeSlotItems(gallery, [{ src: "/a.jpg", alt: "" }])).toBeNull(); // below min 3
  });

  it("rejects non-ImageKit paths and cleans fields", () => {
    const hero = slot("events.hero");
    expect(normalizeSlotItems(hero, [{ src: "https://evil.example/x.jpg", alt: "x" }])).toBeNull();
    expect(normalizeSlotItems(hero, [{ src: "/YRC/A B/x.jpg", alt: "  Hi  ", onerror: "x", width: 99999 }])).toEqual([
      { src: "/YRC/A%20B/x.jpg", alt: "Hi" },
    ]);
  });

  it("keeps reel marks and drops an end before the start", () => {
    const reel = slot("home.hero.reel");
    expect(normalizeSlotItems(reel, [{ src: "/v.mp4", alt: "", start: 1, end: 5 }])).toEqual([
      { src: "/v.mp4", alt: "", type: "video", start: 1, end: 5 },
    ]);
    expect(normalizeSlotItems(reel, [{ src: "/v.mp4", alt: "", start: 3, end: 2 }])?.[0].end).toBeUndefined();
  });

  it("pairs cards with media by position", () => {
    const cards = withMedia([{ t: "a" }, { t: "b" }], [{ src: "/1.jpg", alt: "" }, { src: "/2.jpg", alt: "" }]);
    expect(cards.map((c) => c.image.src)).toEqual(["/1.jpg", "/2.jpg"]);
  });
});
