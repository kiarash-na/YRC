import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { EventDetailsBody, EventOverviewText } from "@/components/event-body";
import { mediaTypeOf, normalizeEventGallery } from "@/lib/content-shared";

/**
 * The event page template: the Markdown patterns admins write in
 * "Explore the details" (src/lib/mdx-event.ts) and the gallery list
 * normalizer shared by the DB loader, admin form and Agent.
 */

// The shared MDX map renders images through ImageKit (next/image) — not
// needed for these bodies and not loadable outside Next.
vi.mock("@/components/imagekit", () => ({ Image: () => null, Video: () => null, buildSrc: () => "" }));

const render = async (source: string) => renderToStaticMarkup(await EventDetailsBody({ source }));

const BODY = `### YRC Community Trail Session · Farchant · 5 December 2026

Join us for **14 km**.

## Meet & move

- **06:30** · **Pasing station:** meet the crew.
- **07:50** · **Farchant station:** meet everyone joining by car.

## Pack your kit

- Trail-running shoes
- Water

## Notes

- Not a checklist

> Come for the trails. Stay for the coffee.
`;

describe("event details body", () => {
  it("splits the kicker into a title and a meta line", async () => {
    const html = await render(BODY);
    expect(html).toContain(">YRC Community Trail Session</p>");
    expect(html).toContain(">Farchant · 5 December 2026</p>");
  });

  it("renders a list of bold times as a timeline and drops the separator", async () => {
    const html = await render(BODY);
    expect(html).toMatch(/<ol class="mt-8 flex flex-col">/);
    expect(html).toContain(">06:30</time>");
    expect(html).toContain(">07:50</time>");
    expect(html).not.toContain("· <strong");
    expect(html).toContain("Pasing station:</strong> meet the crew.");
  });

  it("renders the list under a packing heading as a checklist, and only that one", async () => {
    const html = await render(BODY);
    expect(html.match(/rounded-full bg-foreground text-background/g)).toHaveLength(2);
    expect(html).toContain("list-disc"); // "Not a checklist" stays a plain list
  });

  it("turns a closing quote into the sign-off and section headings into h3", async () => {
    const html = await render(BODY);
    expect(html).toMatch(/<blockquote class="mt-14[^"]*">/);
    expect(html).toContain("Come for the trails. Stay for the coffee.");
    expect(html).toMatch(/<h3[^>]*>Meet &amp; move<\/h3>/);
  });

  it("needs every item timed for a timeline", async () => {
    const html = await render("## Meet & move\n\n- **06:45** · **Meet:** café\n- **Route:** on Strava\n");
    expect(html).not.toContain("<time");
    expect(html).toContain("list-disc");
  });

  it("leaves a quote that is not last as a normal quote", async () => {
    const html = await render("> A quote\n\nThen more text.\n");
    expect(html).toContain('<blockquote class="mt-6 border-l-2');
  });

  it("renders the overview lead", async () => {
    const html = renderToStaticMarkup(await EventOverviewText({ source: "On **5 December**.\n\nSecond line." }));
    expect(html.match(/<p /g)).toHaveLength(2);
    expect(html).toContain("<strong");
  });
});

describe("normalizeEventGallery", () => {
  it("infers types, encodes spaces and keeps poster/alt", () => {
    expect(
      normalizeEventGallery([
        { src: "/YRC/Events/A B/IMG_1.mov", poster: "/YRC/Events/A B/p.jpg", alt: "  Clip  " },
        "/YRC/Events/x/IMG_2.HEIC",
      ]),
    ).toEqual([
      { src: "/YRC/Events/A%20B/IMG_1.mov", type: "video", poster: "/YRC/Events/A%20B/p.jpg", alt: "Clip" },
      { src: "/YRC/Events/x/IMG_2.HEIC", type: "image" },
    ]);
  });

  it("does not double-encode stored paths", () => {
    const [item] = normalizeEventGallery([{ src: "/YRC/Events/A%20B/IMG_2795%20(2).mov" }]);
    expect(item.src).toBe("/YRC/Events/A%20B/IMG_2795%20(2).mov");
  });

  it("drops junk and caps the list", () => {
    expect(normalizeEventGallery(null)).toEqual([]);
    expect(normalizeEventGallery([{ src: "https://evil.example/x.jpg" }, { nope: 1 }, 42])).toEqual([]);
    expect(normalizeEventGallery(Array.from({ length: 50 }, (_, i) => `/YRC/${i}.jpg`))).toHaveLength(40);
  });

  it("detects video extensions", () => {
    expect(mediaTypeOf("/a/b.MOV")).toBe("video");
    expect(mediaTypeOf("/a/b.mp4?x=1")).toBe("video");
    expect(mediaTypeOf("/a/b.jpg")).toBe("image");
  });
});
