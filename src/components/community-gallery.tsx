"use client";

import { GalleryHorizontalEnd, LayoutGrid } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { Image } from "@/components/imagekit";
import { cn } from "@/lib/utils";

/*
 * Community gallery: a 3D cover flow that morphs into a grid and back
 * (adapted from shadcnblocks coverflow57). The block's motion/react
 * dependency is replaced by the tiny rAF spring/tween below — motion was
 * removed from the project on purpose (bundle size).
 */

export interface GalleryPhoto {
  src: string;
  alt: string;
  updatedAt?: string;
  /** object-position inside the 4:5 card. */
  position?: string;
  /** Cap source resolution for >25MP originals (ImageKit ELIMIT). */
  width?: number;
}

type View = "flow" | "grid";

const communityPhotos: GalleryPhoto[] = [
  {
    src: "/YRC/Events/Upcoming/Istanbul%20Marathon%202025/M06.jpg",
    alt: "YRC runners on the course at Istanbul Marathon 2025",
    updatedAt: "1789681147875",
  },
  {
    src: "/YRC/Community/IMG_2466.JPG",
    alt: "YRC runners celebrating together after a run",
    position: "50% 60%",
  },
  {
    src: "/YRC/Events/Upcoming/Istanbul%20Marathon%202025/09.jpg",
    alt: "A YRC runner mid-race at Istanbul Marathon",
    updatedAt: "1789681141241",
  },
  {
    src: "/YRC/Home/SRK09793.jpg",
    alt: "The YRC pack together on a group run",
    updatedAt: "1789992741992",
    width: 1600,
  },
  {
    src: "/YRC/Events/Upcoming/Istanbul%20Marathon%202025/M05.jpg",
    alt: "YRC runners pushing through Istanbul Marathon 2025",
    updatedAt: "1789681152474",
  },
  {
    src: "/YRC/Home/photo_2026-11-22_14-57-09.jpg",
    alt: "A still lake at dawn before a YRC run",
  },
  {
    src: "/YRC/Community/IMG_2477.JPG",
    alt: "The YRC crew sharing coffee at Café Tante Chylla after a run",
    updatedAt: "1790070385515",
  },
  {
    src: "/YRC/Community/photo_5877443723178741687_w.jpg",
    alt: "The YRC community gathered after a run",
    updatedAt: "1790017039009",
  },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
const mod = (value: number, length: number) =>
  ((value % length) + length) % length;
const wrap = (value: number, length: number) =>
  mod(value + length / 2, length) - length / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

interface Metrics {
  width: number;
  size: number;
  flowH: number;
  cols: number;
  cell: number;
  gap: number;
  gridH: number;
}

const measure = (width: number, total: number): Metrics => {
  const size = clamp(width * 0.24, 170, 300);
  const cols = width >= 1024 ? 4 : width >= 480 ? 3 : 2;
  const gap = width >= 768 ? 16 : 10;
  const cell = (width - gap * (cols - 1)) / cols;
  const rows = Math.ceil(total / cols);
  return {
    width,
    size,
    flowH: size * 1.25 + 64,
    cols,
    cell,
    gap,
    gridH: rows * cell * 1.25 + (rows - 1) * gap,
  };
};


// Blend each card between its spot in the flow (m = 0) and its grid cell (m = 1).
const place = (i: number, o: number, m: number, k: Metrics, total: number) => {
  const { size, flowH, cols, cell, gap, width } = k;
  const a = clamp(o, -1, 1);
  const far = Math.max(Math.abs(o) - 1, 0);
  const flow = {
    x: Math.sign(o) * (size * 0.72 * Math.abs(a) + far * size * 0.3),
    y: flowH / 2,
    z: -Math.abs(a) * size * 0.6,
    ry: -a * 52,
    s: 1,
    opacity: clamp((total / 2 - Math.abs(o)) / 2.5, 0, 1),
  };
  const col = i % cols;
  const row = Math.floor(i / cols);
  const grid = {
    x: col * (cell + gap) + cell / 2 - width / 2,
    y: row * (cell * 1.25 + gap) + (cell * 1.25) / 2,
    z: 0,
    ry: 0,
    s: cell / size,
    opacity: 1,
  };
  const stagger = 0.35;
  const t = ease(clamp(m * (1 + stagger) - (stagger * i) / (total - 1), 0, 1));
  const h = size * 1.25;
  return {
    transform: `translate3d(${lerp(flow.x, grid.x, t) - size / 2}px, ${lerp(flow.y, grid.y, t) - h / 2}px, ${lerp(flow.z, grid.z, t)}px) rotateY(${lerp(flow.ry, grid.ry, t)}deg) scale(${lerp(flow.s, grid.s, t)})`,
    opacity: lerp(flow.opacity, grid.opacity, t),
    z: t > 0.5 ? 1 : 100 - Math.round(Math.abs(o) * 10),
  };
};

/** A number animated on rAF: spring (positions) or linear tween (morph). */
function useAnimatedValue(onChange: (value: number) => void) {
  const value = useRef(0);
  const frame = useRef(0);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const stop = useCallback(() => cancelAnimationFrame(frame.current), []);
  const set = useCallback((next: number) => {
    value.current = next;
    onChangeRef.current(next);
  }, []);

  const spring = useCallback(
    (to: number, velocity = 0, stiffness = 190, damping = 28) => {
      stop();
      let v = velocity;
      let last = performance.now();
      const step = (now: number) => {
        // Fixed sub-steps keep the integration stable on slow frames.
        let dt = Math.min(0.064, (now - last) / 1000);
        last = now;
        while (dt > 0) {
          const h = Math.min(dt, 1 / 240);
          v += (stiffness * (to - value.current) - damping * v) * h;
          value.current += v * h;
          dt -= h;
        }
        if (Math.abs(to - value.current) < 0.0005 && Math.abs(v) < 0.005) {
          set(to);
          return;
        }
        onChangeRef.current(value.current);
        frame.current = requestAnimationFrame(step);
      };
      frame.current = requestAnimationFrame(step);
    },
    [set, stop],
  );

  const tween = useCallback(
    (to: number, duration: number) => {
      stop();
      const from = value.current;
      const start = performance.now();
      const step = (now: number) => {
        const t = clamp((now - start) / duration, 0, 1);
        set(lerp(from, to, t));
        if (t < 1) frame.current = requestAnimationFrame(step);
      };
      frame.current = requestAnimationFrame(step);
    },
    [set, stop],
  );

  useEffect(() => stop, [stop]);
  return useMemo(
    () => ({ value, set, spring, tween, stop }),
    [set, spring, tween, stop],
  );
}

interface CommunityGalleryProps {
  eyebrow?: string;
  heading?: ReactNode;
  description?: string;
  photos?: GalleryPhoto[];
  className?: string;
}

const CommunityGallery = ({
  eyebrow = "Community Gallery",
  heading = (
    <>
      This is what <span className="text-yrc-accent">belonging</span> looks
      like.
    </>
  ),
  description = "Cold mornings, shared miles, finish-line noise. The community, as it actually is.",
  photos = communityPhotos,
  className,
}: CommunityGalleryProps) => {
  const total = photos.length;
  // Server/first-paint layout, before the stage is measured.
  const initialMetrics = measure(1200, total);
  const stageRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const metrics = useRef<Metrics>(measure(1200, photos.length));
  const target = useRef(0);
  const dragged = useRef(false);
  const drag = useRef({ id: -1, x: 0, start: 0, last: 0, time: 0, v: 0 });
  const reduce = useRef(false);
  const [view, setView] = useState<View>("flow");
  const viewRef = useRef<View>("flow");
  const [active, setActive] = useState(0);

  // Both animated values just re-run layout; declared via refs so the
  // layout function can read the other one's current value.
  const layoutRef = useRef<() => void>(() => {});
  const settleRef = useRef<(next: number, velocity?: number) => void>(() => {});
  const pos = useAnimatedValue((value) => {
    layoutRef.current();
    setActive(mod(Math.round(value), total));
  });
  const morph = useAnimatedValue(() => layoutRef.current());

  const layout = () => {
    const k = metrics.current;
    const p = pos.value.current;
    const m = morph.value.current;
    const stage = stageRef.current;
    if (stage) stage.style.height = `${lerp(k.flowH, k.gridH, ease(m))}px`;
    for (let i = 0; i < total; i++) {
      const el = itemRefs.current[i];
      if (!el) continue;
      const placed = place(i, wrap(i - p, total), m, k, total);
      el.style.width = `${k.size}px`;
      el.style.height = `${k.size * 1.25}px`;
      el.style.transform = placed.transform;
      el.style.opacity = String(placed.opacity);
      el.style.zIndex = String(placed.z);
      el.style.pointerEvents = placed.opacity > 0.4 ? "auto" : "none";
    }
  };


  useEffect(() => {
    reduce.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const update = () => {
      metrics.current = measure(stage.clientWidth, total);
      layoutRef.current();
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [total]);

  const settle = (next: number, velocity = 0) => {
    target.current = next;
    if (reduce.current) {
      pos.stop();
      pos.set(next);
    } else {
      pos.spring(next, velocity);
    }
  };

  // Latest-function refs: effects and the animators call these, so they
  // subscribe once instead of on every render.
  useLayoutEffect(() => {
    layoutRef.current = layout;
    settleRef.current = settle;
  });

  const switchTo = (next: View, focus?: number) => {
    if (focus !== undefined) {
      pos.stop();
      const value = target.current + wrap(focus - target.current, total);
      target.current = value;
      pos.set(value);
    }
    viewRef.current = next;
    setView(next);
    const to = next === "grid" ? 1 : 0;
    if (reduce.current) {
      morph.stop();
      morph.set(to);
    } else {
      morph.tween(to, 1100);
    }
  };

  // Horizontal wheel / trackpad swipes step the flow. Vertical scrolling is
  // left alone so the page never gets stuck on the gallery.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let acc = 0;
    let stepped = false;
    let idle: ReturnType<typeof setTimeout> | undefined;
    const onWheel = (event: WheelEvent) => {
      if (viewRef.current !== "flow") return;
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      clearTimeout(idle);
      idle = setTimeout(() => {
        acc = 0;
        stepped = false;
      }, 180);
      if (stepped) return;
      acc += event.deltaX;
      if (Math.abs(acc) > 24) {
        stepped = true;
        settleRef.current(target.current + Math.sign(acc));
      }
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      stage.removeEventListener("wheel", onWheel);
      clearTimeout(idle);
    };
  }, []);

  const unit = () => metrics.current.size * 0.4;

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragged.current = false;
    if (event.button !== 0 || viewRef.current !== "flow") return;
    drag.current = {
      id: event.pointerId,
      x: event.clientX,
      start: pos.value.current,
      last: 0,
      time: performance.now(),
      v: 0,
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (state.id !== event.pointerId) return;
    const d = event.clientX - state.x;
    if (!dragged.current) {
      if (Math.abs(d) < 6) return;
      dragged.current = true;
      pos.stop();
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    const now = performance.now();
    const dt = Math.max(1, now - state.time);
    state.v = (-(d - state.last) / unit() / dt) * 1000;
    state.last = d;
    state.time = now;
    pos.set(state.start - d / unit());
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (state.id !== event.pointerId) return;
    state.id = -1;
    if (dragged.current) {
      settle(Math.round(pos.value.current + state.v * 0.18), state.v);
    }
  };

  const options: { id: View; label: string; icon: typeof LayoutGrid }[] = [
    { id: "flow", label: "Flow view", icon: GalleryHorizontalEnd },
    { id: "grid", label: "Grid view", icon: LayoutGrid },
  ];

  return (
    <section className={cn("overflow-hidden py-32", className)}>
      <div className="container">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-7 text-center">
          <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
            {eyebrow}
          </p>
          <h2 className="text-h2 text-balance md:text-h1">
            {heading}
          </h2>
          <p className="text-body-small text-muted-foreground md:text-body">
            {description}
          </p>
          <div className="flex gap-1 rounded-full border border-border p-1">
            {options.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-label={label}
                aria-pressed={view === id}
                onClick={() => view !== id && switchTo(id)}
                className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-pressed:bg-foreground aria-pressed:text-background"
              >
                <Icon className="size-4" />
              </button>
            ))}
          </div>
        </div>

        <div
          ref={stageRef}
          tabIndex={view === "flow" ? 0 : -1}
          role="region"
          aria-roledescription="carousel"
          aria-label="Community gallery"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={(event) => {
            if (view !== "flow" || event.target !== event.currentTarget) return;
            const keys: Record<string, number> = {
              ArrowRight: target.current + 1,
              ArrowLeft: target.current - 1,
              Home: target.current + wrap(0 - target.current, total),
              End: target.current + wrap(total - 1 - target.current, total),
            };
            if (event.key in keys) {
              event.preventDefault();
              settle(keys[event.key]);
            }
          }}
          style={{ height: initialMetrics.flowH }}
          className={cn(
            "relative mx-auto mt-14 max-w-6xl touch-pan-y rounded-2xl outline-none select-none [perspective:1400px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background md:mt-20",
            view === "flow" && "cursor-grab active:cursor-grabbing",
          )}
        >
          {photos.map((photo, i) => {
            const initial = place(i, wrap(i, total), 0, initialMetrics, total);
            const focused = view === "flow" && i === active;
            return (
              <button
                key={photo.src}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                type="button"
                tabIndex={view === "grid" ? 0 : -1}
                aria-label={
                  view === "grid"
                    ? `Open "${photo.alt}" in the flow`
                    : `Show "${photo.alt}"`
                }
                onClick={() => {
                  if (dragged.current) return;
                  if (viewRef.current === "grid") switchTo("flow", i);
                  else settle(target.current + wrap(i - target.current, total));
                }}
                style={{
                  width: initialMetrics.size,
                  height: initialMetrics.size * 1.25,
                  transform: initial.transform,
                  opacity: initial.opacity,
                  zIndex: initial.z,
                }}
                className="group absolute top-0 left-1/2 origin-center overflow-hidden rounded-2xl bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Image
                  src={photo.src}
                  alt=""
                  fill
                  draggable={false}
                  sizes="(min-width: 1024px) 300px, 50vw"
                  queryParameters={
                    photo.updatedAt ? { updatedAt: photo.updatedAt } : undefined
                  }
                  transformation={photo.width ? [{ width: photo.width }] : undefined}
                  style={{ objectPosition: photo.position ?? "50% 50%" }}
                  className={cn(
                    "pointer-events-none object-cover transition-[filter] duration-700",
                    focused ? "grayscale-0" : "grayscale group-hover:grayscale-0",
                  )}
                />
              </button>
            );
          })}
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute -inset-x-px inset-y-0 z-[200] bg-[linear-gradient(90deg,var(--color-background),transparent_22%,transparent_78%,var(--color-background))] transition-opacity duration-500",
              view === "grid" && "opacity-0",
            )}
          />
        </div>

        <p className="sr-only" aria-live="polite">
          {view === "flow" ? photos[active].alt : "Grid view"}
        </p>
      </div>
    </section>
  );
};

export { CommunityGallery };
