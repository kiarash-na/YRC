"use client";

import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Expand, Film, Play, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type SyntheticEvent } from "react";

import { buildSrc, Image, Video } from "@/components/imagekit";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { EventMedia } from "@/lib/content-shared";
import { IMAGEKIT_URL_ENDPOINT, ORIGINAL_VIDEO } from "@/lib/imagekit";
import { cn } from "@/lib/utils";

/*
 * Event gallery — adapted from shadcnblocks gallery4 (full-bleed carousel of
 * tall cards with gradient overlays, arrows and dot pagination). Changes for
 * YRC: ImageKit images and portrait clips instead of article cards; the
 * first card lines up with the page column and the row bleeds to the right
 * edge; every clip on screen autoplays muted; tapping a card
 * opens a full-screen viewer with sound, arrows/keys and a counter.
 */

interface EventGalleryProps {
  items: EventMedia[];
  /** Event title, for alt text fallbacks. */
  eventTitle: string;
  className?: string;
}

/** Space between cards (each card's left padding, Tailwind pl-4). */
const GAP = 16;

const posterUrl = (path: string, width = 900) =>
  IMAGEKIT_URL_ENDPOINT
    ? buildSrc({ src: path, urlEndpoint: IMAGEKIT_URL_ENDPOINT, transformation: [{ width }] })
    : undefined;

function label(item: EventMedia, index: number, total: number, eventTitle: string) {
  const kind = item.type === "video" ? "Video" : "Photo";
  return `${kind} ${index + 1} of ${total}: ${item.alt ?? eventTitle}`;
}

/**
 * A muted card clip that autoplays whenever at least half of it is on
 * screen (every visible card plays). Shows the poster image until it plays;
 * with no poster (or one that fails to load) the clip's own first frame
 * stands in — metadata loads once the card is near the viewport.
 */
function CardClip({ item }: { item: EventMedia }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const usePoster = Boolean(item.poster) && !posterFailed;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const nearObserver = new IntersectionObserver(
      ([entry]) => entry?.isIntersecting && setNear(true),
      { rootMargin: "200px" },
    );
    const visibleObserver = new IntersectionObserver(
      ([entry]) => setVisible(Boolean(entry?.isIntersecting)),
      { threshold: 0.5 },
    );
    nearObserver.observe(el);
    visibleObserver.observe(el);
    return () => {
      nearObserver.disconnect();
      visibleObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (visible) {
      el.muted = true;
      el.play().catch(() => {});
    } else if (!el.paused) {
      el.pause();
    }
  }, [visible]);

  const showFrame = !usePoster && near;

  return (
    <>
      <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 text-white/40">
        <Film className="size-8" aria-hidden="true" />
      </div>
      {usePoster && (
        <Image
          src={item.poster!}
          alt=""
          fill
          sizes="(min-width: 1024px) 340px, (min-width: 640px) 300px, 72vw"
          onError={() => setPosterFailed(true)}
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
      )}
      <Video
        ref={ref}
        src={item.src}
        queryParameters={ORIGINAL_VIDEO}
        muted
        loop
        playsInline
        preload={showFrame ? "metadata" : "none"}
        aria-hidden="true"
        tabIndex={-1}
        onLoadedMetadata={(event: SyntheticEvent<HTMLVideoElement>) => {
          // Seek a hair in so browsers (iOS too) paint a first frame.
          if (event.currentTarget.paused && event.currentTarget.currentTime === 0) {
            event.currentTarget.currentTime = 0.1;
          }
        }}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className={cn(
          "absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700",
          playing || showFrame ? "opacity-100" : "opacity-0",
        )}
      />
    </>
  );
}

export function EventGallery({ items, eventTitle, className }: EventGalleryProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [snapCount, setSnapCount] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const [inset, setInset] = useState(16);
  // Read by Embla's align callback (Embla compares option functions by
  // source text, so a fresh closure would never be picked up).
  const insetRef = useRef(16);
  const anchorRef = useRef<HTMLDivElement>(null);

  // Line the first card up with the page column; the row bleeds right.
  useEffect(() => {
    const measure = () => {
      if (!anchorRef.current) return;
      const value = Math.max(16, Math.round(anchorRef.current.getBoundingClientRect().left));
      insetRef.current = value;
      setInset(value);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    api?.reInit();
  }, [api, inset]);

  useEffect(() => {
    if (!api) return;
    const update = () => {
      setSelected(api.selectedScrollSnap());
      setSnapCount(api.scrollSnapList().length);
    };
    update();
    api.on("select", update);
    api.on("reInit", update);
    return () => {
      api.off("select", update);
      api.off("reInit", update);
    };
  }, [api]);

  const total = items.length;
  const step = useCallback(
    (by: 1 | -1) => setOpen((index) => (index === null ? index : (index + by + total) % total)),
    [total],
  );
  const current = open === null ? null : items[open];

  if (total === 0) return null;

  return (
    <section aria-labelledby="event-gallery-heading" className={cn("overflow-hidden pt-24 pb-12 md:pt-32 md:pb-16", className)}>
      <div className="container">
        <div className="mx-auto max-w-6xl">
          <div ref={anchorRef} aria-hidden="true" />
          <div className="mb-10 flex items-end justify-between gap-6 md:mb-14">
            <div className="flex flex-col gap-5">
              <p className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">Gallery</p>
              <h2 id="event-gallery-heading" className="text-h2 md:text-h1">
                Moments from the crew
              </h2>
              <p className="max-w-xl text-body-small text-muted-foreground md:text-body">
                Clips and photos from YRC sessions like this one. Tap any of them to open it full
                screen, with sound on the videos.
              </p>
            </div>
            <div className="hidden shrink-0 gap-2 md:flex">
              <Button
                size="icon-lg"
                variant="outline"
                aria-label="Previous"
                onClick={() => (api?.canScrollPrev() ? api.scrollPrev() : api?.scrollTo(snapCount - 1))}
              >
                <ArrowLeft />
              </Button>
              <Button
                size="icon-lg"
                variant="outline"
                aria-label="Next"
                onClick={() => (api?.canScrollNext() ? api.scrollNext() : api?.scrollTo(0))}
              >
                <ArrowRight />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Carousel
        setApi={setApi}
        opts={{
          // Snapped cards start at the column edge (minus the 16px gap that
          // each card carries as left padding); the first card already does.
          align: (_viewSize, _snapSize, index) => (index === 0 ? 0 : insetRef.current - GAP),
          containScroll: "trimSnaps",
          breakpoints: { "(max-width: 768px)": { dragFree: true } },
        }}
        aria-label={`${eventTitle} gallery`}
      >
        <CarouselContent className="-ml-0">
          {items.map((item, index) => (
            <CarouselItem
              key={`${item.src}-${index}`}
              className="w-[72vw] max-w-[320px] basis-auto pl-4 sm:w-[300px] lg:w-[340px] lg:max-w-[340px]"
              style={{
                paddingLeft: index === 0 ? inset : undefined,
                paddingRight: index === total - 1 ? inset : undefined,
                boxSizing: "content-box",
              }}
            >
              <button
                type="button"
                onClick={() => setOpen(index)}
                aria-label={label(item, index, total, eventTitle)}
                className="group relative block aspect-3/4 w-full cursor-zoom-in overflow-hidden rounded-xl bg-muted text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {item.type === "video" ? (
                  <CardClip item={item} />
                ) : (
                  <Image
                    src={item.src}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 340px, (min-width: 640px) 300px, 72vw"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <span className="absolute inset-0 bg-[linear-gradient(transparent_55%,rgb(0_0_0/0.65)_100%)]" />
                <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-caption font-semibold text-white backdrop-blur-sm">
                  {item.type === "video" ? (
                    <Play className="size-3 fill-current" aria-hidden="true" />
                  ) : null}
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-white">
                  <span className="line-clamp-2 text-body-small font-medium">{item.alt}</span>
                  <Expand
                    className="size-4 shrink-0 opacity-70 transition-opacity group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </span>
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {snapCount > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: snapCount }, (_, index) => (
            <button
              key={index}
              type="button"
              className={cn(
                "h-2 rounded-full transition-all",
                selected === index ? "w-6 bg-foreground" : "w-2 bg-foreground/20 hover:bg-foreground/40",
              )}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={selected === index ? "true" : undefined}
            />
          ))}
        </div>
      )}

      <Dialog open={open !== null} onOpenChange={(next) => !next && setOpen(null)}>
        <DialogContent
          showCloseButton={false}
          className="flex h-dvh w-screen max-w-none flex-col items-center justify-center gap-4 rounded-none bg-neutral-950/95 p-4 text-white ring-0 sm:max-w-none md:p-8"
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") step(1);
            if (event.key === "ArrowLeft") step(-1);
          }}
        >
          {current && open !== null && (
            <>
              <DialogTitle className="sr-only">{label(current, open, total, eventTitle)}</DialogTitle>
              <div className="flex w-full items-center justify-between text-body-small text-white/70">
                <span className="tabular-nums">
                  {open + 1} / {total}
                </span>
                <DialogClose
                  render={
                    <Button
                      size="icon-lg"
                      variant="ghost"
                      className="text-white hover:bg-white/10 hover:text-white"
                      aria-label="Close"
                    />
                  }
                >
                  <X />
                </DialogClose>
              </div>

              <div className="relative flex min-h-0 w-full flex-1 items-center justify-center">
                {current.type === "video" ? (
                  <Video
                    key={current.src}
                    src={current.src}
                    queryParameters={ORIGINAL_VIDEO}
                    poster={current.poster ? posterUrl(current.poster, 1280) : undefined}
                    controls
                    autoPlay
                    playsInline
                    className="max-h-full max-w-full rounded-lg"
                  />
                ) : (
                  <Image
                    key={current.src}
                    src={current.src}
                    alt={current.alt ?? eventTitle}
                    fill
                    sizes="100vw"
                    className="object-contain"
                  />
                )}
              </div>

              <div className="flex w-full items-center justify-between gap-4">
                <Button
                  size="icon-lg"
                  variant="ghost"
                  className="text-white hover:bg-white/10 hover:text-white"
                  onClick={() => step(-1)}
                  aria-label="Previous"
                >
                  <ChevronLeft />
                </Button>
                <p className="line-clamp-2 text-center text-body-small text-white/80">{current.alt}</p>
                <Button
                  size="icon-lg"
                  variant="ghost"
                  className="text-white hover:bg-white/10 hover:text-white"
                  onClick={() => step(1)}
                  aria-label="Next"
                >
                  <ChevronRight />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
