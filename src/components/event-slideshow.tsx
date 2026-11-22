"use client";

import { Pause, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Image } from "@/components/imagekit";
import { cn } from "@/lib/utils";

interface EventSlideshowProps {
  /** ImageKit paths, first one shown first (the cover). */
  images: string[];
  alt: string;
  /** Milliseconds per slide. */
  interval?: number;
  sizes: string;
  /** The slides link here (hidden from assistive tech; the title links too). Controls sit outside the link. */
  href: string;
  className?: string;
}

/**
 * Crossfading photo slideshow: advances every `interval` ms only while it is
 * on screen and the tab is visible. Never auto-advances for reduced motion;
 * a pause toggle and dots let anyone stop or pick a slide (WCAG 2.2.2).
 * Each slide is only mounted once it is the current or next one, so the
 * page doesn't download the whole set up front.
 */
export function EventSlideshow({
  images,
  alt,
  interval = 3000,
  sizes,
  href,
  className,
}: EventSlideshowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [seen, setSeen] = useState(1); // slides mounted so far
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const count = images.length;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    const el = ref.current;
    if (!el) return () => media.removeEventListener("change", sync);
    const observer = new IntersectionObserver(([entry]) => setInView(!!entry?.isIntersecting), {
      threshold: 0.35,
    });
    observer.observe(el);
    return () => {
      media.removeEventListener("change", sync);
      observer.disconnect();
    };
  }, []);

  const running = count > 1 && inView && !paused && !reduced;

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      if (document.hidden) return;
      setIndex((i) => {
        const next = (i + 1) % count;
        setSeen((s) => Math.max(s, Math.min(count, next + 2)));
        return next;
      });
    };
    // Warm up the next slide while the first one is showing.
    const warm = window.setTimeout(() => setSeen((s) => Math.max(s, Math.min(count, 2))), 0);
    const timer = window.setInterval(tick, interval);
    return () => {
      window.clearTimeout(warm);
      window.clearInterval(timer);
    };
  }, [running, count, interval]);

  const go = (i: number) => {
    setIndex(i);
    setSeen((s) => Math.max(s, Math.min(count, i + 2)));
  };

  const slides = images.map((src, i) =>
    i < seen || i === index ? (
      <Image
        key={src}
        src={src}
        alt={i === 0 ? alt : ""}
        fill
        sizes={sizes}
        loading={i === 0 ? undefined : "eager"}
        transformation={[{ aspectRatio: "4-3", crop: "maintain_ratio", focus: "auto" }]}
        className={cn(
          "object-cover object-center transition-[opacity,scale] duration-1000 ease-out group-hover:scale-105",
          i === index ? "opacity-100" : "opacity-0",
        )}
      />
    ) : null,
  );

  return (
    <div ref={ref} className={cn("relative", className)}>
      <Link href={href} tabIndex={-1} aria-hidden="true" className="absolute inset-0 block">
        {slides}
      </Link>
      {count > 1 && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-linear-to-t from-black/55 to-transparent px-4 pt-10 pb-3.5">
          <div className="flex items-center gap-1.5" role="group" aria-label="Choose photo">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => go(i)}
                aria-label={`Photo ${i + 1} of ${count}`}
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
          {!reduced && (
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
      )}
    </div>
  );
}
