/*
 * Site media slots — every image/video box on the public pages, with the
 * media it shows by default. Admins override a slot from /admin/media; the
 * override lives in the `site_media` table (0013) and wins over the default
 * here. Removing the override ("Reset") falls back to the default again.
 *
 * A slot's item count is fixed when its items sit next to fixed text (card
 * titles, persona tabs…); galleries and the hero reel can grow or shrink
 * between `min` and `max`.
 *
 * Shared by server pages (getSiteMedia) and the admin UI — no server-only
 * imports here.
 */

export interface SiteMediaItem {
  /** ImageKit path, e.g. /YRC/Home/photo.jpg (URL-encoded like covers). */
  src: string;
  alt: string;
  type?: "image" | "video";
  updatedAt?: string;
  /** Video: still shown before it plays (an ImageKit image path). */
  poster?: string;
  /** Video reel: seconds into the file where this clip's part starts/ends. */
  start?: number;
  end?: number;
  /** CSS object-position for the crop (galleries). */
  position?: string;
  /** Cap the source width for very large originals (ImageKit ELIMIT). */
  width?: number;
}

export interface SiteMediaSlot {
  key: string;
  page: SitePage;
  /** Where on the page, as an admin would describe it. */
  label: string;
  /** Box shape, so replacements match ("Landscape 21:9", "Portrait 4:5"…). */
  shape: string;
  kind: "image" | "video";
  /** What each item is next to, when the count is fixed (card titles…). */
  itemLabels?: string[];
  min: number;
  max: number;
  defaults: SiteMediaItem[];
}

export type SitePage = "Home" | "Events" | "Community" | "About" | "Journal";
export const SITE_PAGES: SitePage[] = ["Home", "Events", "Community", "About", "Journal"];

const IST = "/YRC/Events/Upcoming/Istanbul%20Marathon%202025";

const fixed = (
  slot: Omit<SiteMediaSlot, "min" | "max"> & { min?: number; max?: number },
): SiteMediaSlot => ({ min: slot.defaults.length, max: slot.defaults.length, ...slot });

export const SITE_MEDIA_SLOTS: SiteMediaSlot[] = [
  // ----- Home -----
  {
    key: "home.hero.reel",
    page: "Home",
    label: "Hero — background video reel",
    shape: "Landscape video, full screen (1168×768 or wider)",
    kind: "video",
    min: 1,
    max: 8,
    defaults: [
      { type: "video", src: "/YRC/Home/hf_20261122_111745_bc09fc36-b5d4-4bb9-bd12-f5d1a2d06393.mp4", alt: "The crew talking at golden hour, mountains behind", start: 0, end: 4 },
      { type: "video", src: "/YRC/Home/hf_20261123_144438_3e8a9609-c839-4c0d-89d4-e7155ea83a60.mp4", alt: "The crew on a ridge road above the hills", start: 0, end: 4, updatedAt: "1795446288277" },
      { type: "video", src: "/YRC/Home/hf_20261123_145015_802d71d1-d4c4-4bf0-b3f3-097f5698618c.mp4", alt: "Warm-up drills on the road, backlit", start: 0, end: 4, updatedAt: "1795446280237" },
      { type: "video", src: "/YRC/Home/hf_20261123_144337_e8cf8a88-27aa-444d-b98c-45133304256f.mp4", alt: "The group under a blue sky", start: 0, end: 4, updatedAt: "1795446279260" },
    ],
  },
  fixed({
    key: "home.hero.still",
    page: "Home",
    label: "Hero — still image (before the video plays / reduced motion)",
    shape: "Landscape, full screen",
    kind: "image",
    defaults: [{ src: "/YRC/Community/SRK09740%20(1).jpg", alt: "", updatedAt: "1790005645712" }],
  }),
  fixed({
    key: "home.about",
    page: "Home",
    label: "About YRC — two photos",
    shape: "Portrait 4:5 and landscape",
    kind: "image",
    itemLabels: ["Photo 1", "Photo 2"],
    defaults: [
      { src: "/YRC/Community/IMG_2469.JPG", alt: "YRC community members connecting after a run" },
      { src: "/YRC/Home/SRK09793.jpg", alt: "YRC runner pushing through a training session", updatedAt: "1789992741992", width: 1600 },
    ],
  }),
  fixed({
    key: "home.experiences",
    page: "Home",
    label: "Three ways to move with us",
    shape: "Portrait 4:5",
    kind: "image",
    itemLabels: ["International Events", "Sports Trips & Camps", "Yas Rise Community"],
    defaults: [
      { src: `${IST}/M05.jpg`, alt: "YRC runners racing through Istanbul at the Istanbul Marathon", updatedAt: "1789992716323" },
      { src: "/YRC/Community/photo_2026-11-16_18-56-58.jpg", alt: "A YRC runner climbing a forest trail with poles on a trail trip", updatedAt: "1789993034690", width: 1600 },
      { src: "/YRC/Community/IMG_2475.JPG", alt: "YRC runners sharing an easy run on a park path" },
    ],
  }),
  fixed({
    key: "home.story",
    page: "Home",
    label: "Our story — portrait + landscape",
    shape: "Portrait artwork, then landscape photo",
    kind: "image",
    itemLabels: ["Portrait", "Landscape"],
    defaults: [
      { src: "/YRC/Events/TRAILS.%20SKILLS.%20COFFEE.%20Event/IMG_2795-poster.jpg", alt: "A YRC runner climbing a mountain trail with poles" },
      { src: `${IST}/03.jpg`, alt: "YRC community sharing a moment together outdoors", updatedAt: "1789681140856" },
    ],
  }),
  {
    key: "home.gallery",
    page: "Home",
    label: "Gallery — Run. Explore. Rise.",
    shape: "Portrait 4:5 cards",
    kind: "image",
    min: 3,
    max: 16,
    defaults: [
      { src: `${IST}/M06.jpg`, alt: "YRC runners on the course at Istanbul Marathon 2025", updatedAt: "1789681147875" },
      { src: "/YRC/Home/photo_2026-11-22_14-57-00.jpg", alt: "The YRC pack running through an autumn park" },
      { src: `${IST}/09.jpg`, alt: "A YRC runner mid-race at Istanbul Marathon", updatedAt: "1789681141241" },
      { src: "/YRC/Home/SRK09793.jpg", alt: "The YRC pack together on a group run", updatedAt: "1789992741992", width: 1600 },
      { src: "/YRC/Community/IMG_2713.HEIC", alt: "A YRC runner smiling mid-run with the group behind her", updatedAt: "1794843451896" },
      { src: "/YRC/Home/photo_2026-11-22_14-57-11.jpg", alt: "A mountain lake under clouds on a YRC trip" },
      { src: "/YRC/Home/photo_2026-11-22_14-57-07.jpg", alt: "Sunrise over the path on an early-morning YRC run" },
      { src: "/YRC/Community/photo_5877443723178741687_w.jpg", alt: "The YRC community gathered after a run", updatedAt: "1790017039009" },
    ],
  },

  // ----- Events -----
  fixed({
    key: "events.hero",
    page: "Events",
    label: "Hero",
    shape: "Landscape 21:9 (3:2 on phones)",
    kind: "image",
    defaults: [{ src: "/YRC/Community/photo_5877443723178741687_w.jpg", alt: "The YRC crew together on a mountain road after a run", updatedAt: "1789681295806" }],
  }),
  fixed({
    key: "events.international",
    page: "Events",
    label: "International Events — collage",
    shape: "Tall portrait, wide landscape, two square stickers",
    kind: "image",
    itemLabels: ["Tall (left)", "Wide (top right)", "Square 1", "Square 2"],
    defaults: [
      { src: "/YRC/Community/photo_2026-11-16_18-56-58.jpg", alt: "A YRC runner climbing a mountain trail with poles", updatedAt: "1789681338492", width: 1600 },
      { src: `${IST}/M06.jpg`, alt: "YRC runners crossing the Bosphorus at Istanbul Marathon 2025", updatedAt: "1789681140651" },
      { src: "/YRC/Stickers/12.png", alt: "YRC sticker artwork", updatedAt: "1789773268698" },
      { src: "/YRC/Stickers/20.png", alt: "YRC sticker artwork", updatedAt: "1789773268422" },
    ],
  }),
  fixed({
    key: "events.camps",
    page: "Events",
    label: "Training camps — four cards",
    shape: "Landscape (wide card)",
    kind: "image",
    itemLabels: ["Endurance & Altitude Camps", "Race Preparation", "Trail & Outdoor Training", "Community Sports Trips"],
    defaults: [
      { src: `${IST}/4.jpg`, alt: "YRC runners in motion on a group run", updatedAt: "1789681284418" },
      { src: `${IST}/M05.jpg`, alt: "YRC runner during a marathon race day", updatedAt: "1789681320000" },
      { src: `${IST}/03.jpg`, alt: "Runner outdoors during a YRC trip", updatedAt: "1789681310000" },
      { src: "/YRC/Community/SRK09740%20(1).jpg", alt: "The YRC crew on a ridge road at golden hour during a sports trip", updatedAt: "1789681140651" },
    ],
  }),
  fixed({
    key: "events.training",
    page: "Events",
    label: "Training process — clip (with its still)",
    shape: "Portrait video 9:16 / 4:5",
    kind: "video",
    defaults: [
      { type: "video", src: "/YRC/Community/IMG_2484.MP4", alt: "Balance-board drills at a YRC Munich session", poster: "/YRC/24.png", updatedAt: "1789773516640" },
    ],
  }),
  fixed({
    key: "events.strength",
    page: "Events",
    label: "Strength & mobility — four stickers",
    shape: "Square artwork",
    kind: "image",
    itemLabels: ["Card 1", "Card 2", "Card 3", "Card 4"],
    defaults: [
      { src: "/YRC/Stickers/6.png", alt: "YRC runners in motion on a group run", updatedAt: "1789773268258" },
      { src: "/YRC/Stickers/8.png", alt: "YRC runners training together", updatedAt: "1789773267962" },
      { src: "/YRC/Stickers/12.png", alt: "YRC group sharing a moment after training", updatedAt: "1789773268698" },
      { src: "/YRC/Stickers/7.png", alt: "YRC runner during a marathon race day", updatedAt: "1789773268672" },
    ],
  }),

  // ----- Community -----
  fixed({
    key: "community.hero",
    page: "Community",
    label: "Hero",
    shape: "Landscape 21:9 (3:2 on phones)",
    kind: "image",
    defaults: [{ src: "/YRC/Community/photo_5877443723178741686_w.jpg", alt: "YRC community group run — runners of every pace moving together as one pack" }],
  }),
  fixed({
    key: "community.who",
    page: "Community",
    label: "Who is YRC for — four personas",
    shape: "Landscape 4:3 / 16:9",
    kind: "image",
    itemLabels: ["The first-timer", "The returner", "The regular", "The chaser"],
    defaults: [
      { src: "/YRC/Community/IMG_2469.JPG", alt: "The YRC crew welcoming new runners after a Tuesday morning run", width: 1600 },
      { src: "/YRC/Community/SRK09740%20(1).jpg", alt: "Runners back on the road together, returning to training and racing", updatedAt: "1790005645712" },
      { src: "/YRC/Community/photo_5877443723178741687_w.jpg", alt: "Regular runner sharing the miles with the YRC pack" },
      { src: `${IST}/03.jpg`, alt: "Runner chasing a race-day goal at a marathon", updatedAt: "1789681346908" },
    ],
  }),
  fixed({
    key: "community.challenges",
    page: "Community",
    label: "Challenges — four wide bands (shown in black & white)",
    shape: "Wide landscape",
    kind: "image",
    itemLabels: ["Challenge 1", "Challenge 2", "Challenge 3", "Challenge 4"],
    defaults: [
      { src: "/YRC/Community/SRK09740%20(1).jpg", alt: "Runners covering distance together on a long run" },
      { src: `${IST}/M06.jpg`, alt: "YRC runners keeping a training streak alive" },
      { src: "/YRC/Community/photo_5877443723178741687_w.jpg", alt: "The YRC community gathered before a group run" },
      { src: `${IST}/M05.jpg`, alt: "YRC runners on course at the Istanbul Marathon", updatedAt: "1789992716323" },
    ],
  }),
  {
    key: "community.gallery",
    page: "Community",
    label: "Gallery — belonging",
    shape: "Portrait 4:5 cards",
    kind: "image",
    min: 3,
    max: 16,
    defaults: [
      { src: `${IST}/M06.jpg`, alt: "YRC runners on the course at Istanbul Marathon 2025", updatedAt: "1789681147875" },
      { src: "/YRC/Community/IMG_2466.JPG", alt: "YRC runners celebrating together after a run", position: "50% 60%" },
      { src: `${IST}/09.jpg`, alt: "A YRC runner mid-race at Istanbul Marathon", updatedAt: "1789681141241" },
      { src: "/YRC/Home/SRK09793.jpg", alt: "The YRC pack together on a group run", updatedAt: "1789992741992", width: 1600 },
      { src: `${IST}/M05.jpg`, alt: "YRC runners pushing through Istanbul Marathon 2025", updatedAt: "1789681152474" },
      { src: "/YRC/Home/photo_2026-11-22_14-57-09.jpg", alt: "A still lake at dawn before a YRC run" },
      { src: "/YRC/Community/IMG_2477.JPG", alt: "The YRC crew sharing coffee at Café Tante Chylla after a run", updatedAt: "1790070385515" },
      { src: "/YRC/Community/photo_5877443723178741687_w.jpg", alt: "The YRC community gathered after a run", updatedAt: "1790017039009" },
    ],
  },

  // ----- About -----
  fixed({
    key: "about.hero",
    page: "About",
    label: "Hero",
    shape: "Landscape 21:9 (3:2 on phones)",
    kind: "image",
    defaults: [{ src: "/YRC/Community/IMG_2477.JPG", alt: "YRC community sharing coffee together after a group run" }],
  }),
  fixed({
    key: "about.story",
    page: "About",
    label: "Our story — portrait",
    shape: "Portrait",
    kind: "image",
    defaults: [{ src: "/YRC/Events/RUN.%20TECHNIQUE.%20COFFEE.%20Event/IMG_2955.HEIC", alt: "A YRC runner on the balance board at a Munich training session" }],
  }),
  fixed({
    key: "about.journey",
    page: "About",
    label: "Lived journey — two photos",
    shape: "Landscape",
    kind: "image",
    itemLabels: ["Photo 1", "Photo 2"],
    defaults: [
      { src: `${IST}/03.jpg`, alt: "YRC runners gathering before a community run", updatedAt: "1789681291699" },
      { src: `${IST}/4.jpg`, alt: "Runners on the course during a YRC event", updatedAt: "1789681290358" },
    ],
  }),
  fixed({
    key: "about.borders",
    page: "About",
    label: "Without borders — landscape",
    shape: "Landscape",
    kind: "image",
    defaults: [{ src: "/YRC/Community/IMG_2475.JPG", alt: "YRC community running together on a group run" }],
  }),
  fixed({
    key: "about.coaches",
    page: "About",
    label: "Coaches — portraits",
    shape: "Square portrait",
    kind: "image",
    itemLabels: ["Reza", "Kambiz"],
    defaults: [
      { src: "/YRC/About/Team/Reza-couch.jpg", alt: "Reza, YRC running coach" },
      { src: "/YRC/About/Team/Kambiz-coach.jpg", alt: "Kambiz, YRC online hybrid endurance and strength coach" },
    ],
  }),

  // ----- Journal -----
  fixed({
    key: "journal.hero",
    page: "Journal",
    label: "Hero",
    shape: "Landscape 21:9 (3:2 on phones)",
    kind: "image",
    defaults: [{ src: "/YRC/Community/SRK09740%20(1).jpg", alt: "The YRC crew running together along a ridge road at golden hour", updatedAt: "1790005645712" }],
  }),
];

export type SiteMediaKey = (typeof SITE_MEDIA_SLOTS)[number]["key"];

export const SITE_MEDIA_BY_KEY = new Map(SITE_MEDIA_SLOTS.map((slot) => [slot.key, slot]));

const MEDIA_PATH_RE = /^\/[^\s?#]{1,499}$/;

/** URL-encode spaces like the rest of the stored ImageKit paths. */
const encodePath = (path: string) => (/\s/.test(path.trim()) ? encodeURI(path.trim()) : path.trim());

/**
 * Validates an override for a slot (admin form JSON / DB jsonb): keeps the
 * fields we know, checks paths, enforces the slot's count. Returns null if
 * it can't be used (callers then fall back to the defaults).
 */
export function normalizeSlotItems(slot: SiteMediaSlot, raw: unknown): SiteMediaItem[] | null {
  if (!Array.isArray(raw)) return null;
  const items: SiteMediaItem[] = [];
  for (const entry of raw.slice(0, slot.max)) {
    if (!entry || typeof entry !== "object") return null;
    const r = entry as Record<string, unknown>;
    const src = typeof r.src === "string" ? encodePath(r.src) : "";
    if (!MEDIA_PATH_RE.test(src)) return null;
    const item: SiteMediaItem = {
      src,
      alt: typeof r.alt === "string" ? r.alt.trim().slice(0, 200) : "",
    };
    const type = r.type === "video" || r.type === "image" ? r.type : slot.kind;
    if (type === "video") item.type = "video";
    if (typeof r.updatedAt === "string" && /^\d{1,20}$/.test(r.updatedAt)) item.updatedAt = r.updatedAt;
    if (typeof r.poster === "string" && MEDIA_PATH_RE.test(encodePath(r.poster))) item.poster = encodePath(r.poster);
    for (const key of ["start", "end"] as const) {
      const n = Number(r[key]);
      if (r[key] !== undefined && r[key] !== "" && Number.isFinite(n) && n >= 0 && n <= 600) item[key] = n;
    }
    if (item.start !== undefined && item.end !== undefined && item.end <= item.start) delete item.end;
    if (typeof r.position === "string" && /^[\w\s%.-]{1,30}$/.test(r.position)) item.position = r.position;
    const width = Number(r.width);
    if (Number.isInteger(width) && width >= 200 && width <= 4000) item.width = width;
    items.push(item);
  }
  if (items.length < slot.min) return null;
  return items;
}

/** A slot's built-in media (components fall back to it without a prop). */
export function slotDefaults(key: SiteMediaKey): SiteMediaItem[] {
  const slot = SITE_MEDIA_BY_KEY.get(key);
  if (!slot) throw new Error(`Unknown media slot: ${key}`);
  return slot.defaults;
}

/**
 * Pairs a section's fixed cards (titles, copy…) with the slot's media by
 * position: card i gets media item i.
 */
export function withMedia<T extends object>(cards: T[], media: SiteMediaItem[]): (T & { image: SiteMediaItem })[] {
  return cards.map((card, i) => ({ ...card, image: media[i] ?? media[media.length - 1] }));
}
