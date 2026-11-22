import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/components/imagekit", () => ({ buildSrc: () => "" }));

const { imageRatio, pickSlides } = await import("@/lib/event-media");

const img = (src: string) => ({ src, type: "image" as const });

describe("pickSlides", () => {
  it("keeps the majority orientation, squares fit either, unknown shapes drop", () => {
    const media = [img("/cover.jpg"), img("/a.jpg"), img("/wide.jpg"), img("/sq.jpg"), img("/x.jpg")];
    const { orientation, items } = pickSlides(media, [0.75, 0.5625, 1.5, 1, null]);
    expect(orientation).toBe("portrait");
    expect(items.map((m) => m.src)).toEqual(["/cover.jpg", "/a.jpg", "/sq.jpg"]);
  });

  it("breaks a tie with the cover's orientation", () => {
    expect(pickSlides([img("/c"), img("/p")], [1.5, 0.75]).orientation).toBe("landscape");
    expect(pickSlides([img("/c"), img("/l")], [0.75, 1.5]).orientation).toBe("portrait");
  });
});

describe("imageRatio", () => {
  it("reads PNG and JPEG headers", () => {
    const png = new Uint8Array(24);
    png.set([0x89, 0x50, 0x4e, 0x47]);
    new DataView(png.buffer).setUint32(16, 300);
    new DataView(png.buffer).setUint32(20, 400);
    expect(imageRatio(png)).toBe(0.75);

    // SOI, an APP0 segment (length 4), then SOF0 with height 400, width 300.
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 4, 0, 0, 0xff, 0xc0, 0, 11, 8, 0x01, 0x90, 0x01, 0x2c, 3, 0, 0]);
    expect(imageRatio(jpeg)).toBe(0.75);
    expect(imageRatio(new Uint8Array([1, 2, 3]))).toBeNull();
  });
});
