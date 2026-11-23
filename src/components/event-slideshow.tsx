"use client";

import { Pause, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Image, Video } from "@/components/imagekit";
import type { EventMedia } from "@/lib/content-shared";
import { lqip, ORIGINAL_VIDEO } from "@/lib/imagekit";
import { cn } from "@/lib/utils";

interface EventSlideshowProps {
  /** Photos and clips, in order. */
  items: EventMedia[];
  alt: string;
  /** Milliseconds per photo (clips play to their end). */
  interval?: number;
  sizes: string;
  /** The slides link here (hidden from assistive tech; the title links too). Controls sit outside the link. */
  href: string;
  className?: string;
}

/** A clip may never hang the show: hand over after this even without "ended". */
const CLIP_SAFETY_MS = 30_000;

/**
 * Crossfading slideshow of an event's photos and clips. Photos hold for
 * `interval`; clips autoplay muted, shown whole over a blurred copy of their
 * still (portrait phone clips in a 4:3 box), and hand over when they end.
 * Runs for everyone while on screen and the tab is visible; a pause toggle
 * and dots let anyone stop or pick a slide (WCAG 2.2.2). Each slide is only
 * mounted once it is the current or next one.
 */
export function EventSlideshow({ items, alt, interval = 3000, sizes, href, className }: EventSlideshowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const [index, setIndex] = useState(0);
  const [seen, setSeen] = useState(1); // slides mounted so far
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);
  const count = items.length;
  const current = items[index];
  const running = inView && !paused;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(Boolean(entry?.isIntersecting)), {
      threshold: 0.35,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const go = (i: number) => {
    setIndex(i);
    setSeen((s) => Math.max(s, Math.min(count, i + 2)));
  };
  const advance = () => {
    if (count > 1 && !document.hidden) go((index + 1) % count);
  };

  // Play the current clip from the start; pause the others.
  useEffect(() => {
    videos.current.forEach((video, i) => {
      if (!video) return;
      if (i === index && running) {
        video.muted = true;
        video.play().catch(() => {});
      } else {
        video.pause();
        if (i !== index) video.currentTime = 0;
      }
    });
  }, [index, running]);

  // Photos advance on a timer; clips on "ended" (with a safety timer).
  useEffect(() => {
    if (!running || count < 2) return;
    const warm = window.setTimeout(() => setSeen((s) => Math.max(s, Math.min(count, index + 2))), 0);
    const timer = window.setTimeout(
      () => {
        if (document.hidden) return;
        setIndex((i) => (i + 1) % count);
        setSeen((s) => Math.max(s, Math.min(count, index + 3)));
      },
      current?.type === "video" ? CLIP_SAFETY_MS : interval,
    );
    return () => {
      window.clearTimeout(warm);
      window.clearTimeout(timer);
    };
  }, [running, index, count, interval, current?.type]);

  const slides = items.map((item, i) => {
    if (!(i < seen || i === index)) return null;
    const visible = i === index;
    const fade = cn("transition-opacity duration-1000 ease-out", visible ? "opacity-100" : "opacity-0");
    if (item.type === "video") {
      const backdrop = item.poster ? lqip(item.poster) : "";
      return (
        <div key={item.src} className={cn("absolute inset-0 bg-neutral-950", fade)}>
          {backdrop && (
            <div
              aria-hidden="true"
              className="absolute inset-0 scale-110 bg-cover bg-center"
              style={{ backgroundImage: `url(${backdrop})` }}
            />
          )}
          {item.poster && (
            <Image src={item.poster} alt="" fill sizes={sizes} priority={i === 0} className="object-contain" />
          )}
          <Video
            ref={(el: HTMLVideoElement | null) => {
              videos.current[i] = el;
            }}
            src={item.src}
            queryParameters={ORIGINAL_VIDEO}
            muted
            playsInline
            loop={count === 1}
            preload={visible || i === (index + 1) % count ? "auto" : "none"}
            tabIndex={-1}
            aria-label={item.alt ?? alt}
            onEnded={visible ? advance : undefined}
            className="absolute inset-0 size-full object-contain"
          />
        </div>
      );
    }
    return (
      <Image
        key={item.src}
        src={item.src}
        alt={i === 0 ? alt : (item.alt ?? "")}
        fill
        sizes={sizes}
        loading={i === 0 ? undefined : "eager"}
        transformation={[{ aspectRatio: "4-3", crop: "maintain_ratio", focus: "auto" }]}
        className={cn("object-cover object-center group-hover:scale-105", fade, "transition-[opacity,scale]")}
      />
    );
  });

  return (
    <div ref={ref} className={cn("relative", className)}>
      <Link href={href} tabIndex={-1} aria-hidden="true" className="absolute inset-0 block">
        {slides}
      </Link>
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-linear-to-t from-black/55 to-transparent px-4 pt-10 pb-3.5">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Choose photo">
          {count > 1 &&
            items.map((item, i) => (
              <button
                key={item.src}
                type="button"
                onClick={() => go(i)}
                aria-label={`${item.type === "video" ? "Clip" : "Photo"} ${i + 1} of ${count}`}
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
        {(count > 1 || current?.type === "video") && (
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Play slideshow" : "Pause slideshow"}
            className="flex size-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
          >
            {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}
