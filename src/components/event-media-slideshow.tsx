"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Image, Video } from "@/components/imagekit";
import type { EventMedia } from "@/lib/content-shared";
import type { Orientation } from "@/lib/event-media";
import { lqip, ORIGINAL_VIDEO } from "@/lib/imagekit";
import { cn } from "@/lib/utils";

interface EventMediaSlideshowProps {
  items: EventMedia[];
  orientation: Orientation;
  title: string;
  /** Milliseconds per photo (clips play to their end). */
  interval?: number;
}

const SIZES = "(min-width: 1280px) 720px, (min-width: 1024px) 60vw, 100vw";

function Slide({
  item,
  index,
  title,
  current,
  playing,
  onEnded,
}: {
  item: EventMedia;
  index: number;
  title: string;
  current: boolean;
  playing: boolean;
  onEnded: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const still = item.type === "image" ? item.src : item.poster;
  const backdrop = still ? lqip(still) : "";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (current && playing) {
      el.muted = true;
      el.play().catch(() => {});
    } else {
      el.pause();
      if (!current) el.currentTime = 0;
    }
  }, [current, playing]);

  return (
    <div
      aria-hidden={!current}
      className={cn(
        "absolute inset-0 transition-opacity duration-1000 ease-out",
        current ? "opacity-100" : "opacity-0",
      )}
    >
      {/* The same shot, blurred, fills any space left around it: nothing is cropped. */}
      {backdrop && (
        <div
          aria-hidden="true"
          className="absolute inset-0 scale-110 bg-cover bg-center"
          style={{ backgroundImage: `url(${backdrop})` }}
        />
      )}
      <div aria-hidden="true" className="absolute inset-0 bg-black/25" />
      {item.type === "image" ? (
        <Image
          src={item.src}
          alt={item.alt ?? title}
          fill
          priority={index === 0}
          sizes={SIZES}
          className="object-contain"
        />
      ) : (
        <>
          {item.poster && (
            <Image src={item.poster} alt="" fill priority={index === 0} sizes={SIZES} className="object-contain" />
          )}
          <Video
            ref={ref}
            src={item.src}
            queryParameters={ORIGINAL_VIDEO}
            muted
            playsInline
            preload="none"
            aria-label={item.alt ?? `${title} — video`}
            tabIndex={-1}
            onEnded={onEnded}
            className="absolute inset-0 size-full object-contain"
          />
        </>
      )}
    </div>
  );
}

/**
 * The event page's top slideshow (replaces the single cover). Photos hold
 * for `interval`, clips autoplay muted to their end; it runs for everyone
 * while on screen and the tab is visible. Pause toggle and dots for
 * everyone (WCAG 2.2.2). Slides mount one ahead of being shown.
 */
export function EventMediaSlideshow({ items, orientation, title, interval = 3000 }: EventMediaSlideshowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [seen, setSeen] = useState(1);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);
  const count = items.length;
  const running = count > 1 && inView && !paused;
  const item = items[index];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(!!entry?.isIntersecting), {
      threshold: 0.35,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const go = (i: number) => {
    setIndex(i);
    setSeen((s) => Math.max(s, Math.min(count, i + 2)));
  };
  const next = () => {
    if (!document.hidden) go((index + 1) % count);
  };

  // Photos advance on a timer; clips advance when they end (with a long
  // safety timer in case "ended" never fires).
  useEffect(() => {
    if (!running) return;
    const warm = window.setTimeout(() => setSeen((s) => Math.max(s, Math.min(count, index + 2))), 0);
    const timer = window.setTimeout(
      () => {
        if (document.hidden) return;
        setIndex((i) => (i + 1) % count);
        setSeen((s) => Math.max(s, Math.min(count, index + 3)));
      },
      item?.type === "video" ? 30_000 : interval,
    );
    return () => {
      window.clearTimeout(warm);
      window.clearTimeout(timer);
    };
  }, [running, index, count, interval, item?.type]);

  return (
    <div
      ref={ref}
      role="region"
      aria-roledescription="carousel"
      aria-label={`${title} — photos and clips`}
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-border bg-neutral-950",
        orientation === "portrait" ? "aspect-4/5 sm:aspect-4/3" : "aspect-video",
      )}
    >
      {items.map((media, i) =>
        i < seen || i === index ? (
          <Slide
            key={media.src}
            item={media}
            index={i}
            title={title}
            current={i === index}
            playing={running}
            onEnded={next}
          />
        ) : null,
      )}

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-linear-to-t from-black/55 to-transparent px-4 pt-10 pb-3.5">
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Choose slide">
            {items.map((media, i) => (
              <button
                key={media.src}
                type="button"
                onClick={() => go(i)}
                aria-label={`${media.type === "video" ? "Clip" : "Photo"} ${i + 1} of ${count}`}
                aria-current={i === index}
                className="flex h-6 items-center"
              >
                <span
                  className={cn(
                    "block h-1.5 rounded-full transition-all duration-500",
                    i === index ? "w-6 bg-yrc-accent" : "w-1.5 bg-white/60 hover:bg-white",
                  )}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Play slideshow" : "Pause slideshow"}
            className="flex size-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
          >
            {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
}
