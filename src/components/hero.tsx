"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

import { Image, Video } from "@/components/imagekit";
import { Button } from "@/components/ui/button";
import { lqip, ORIGINAL_VIDEO } from "@/lib/imagekit";
import { useHeroReel, type ReelClip } from "@/lib/use-hero-reel";

/*
 * Home hero — adapted from shadcnblocks hero185, now a text-only stack over
 * a full-bleed background reel of four crew clips. This is the ONE
 * intentional overlay/full-bleed hero in the YRC layout language (see the
 * "Hero anatomy" note in globals.css); every other page keeps the
 * text-stack + bordered-media hero.
 */

interface HeroMedia {
  src: string;
  alt: string;
  updatedAt?: string;
}
interface HeroButton {
  text: string;
  url: string;
}
interface Buttons {
  primary?: HeroButton;
  secondary?: HeroButton;
}
interface Badge {
  text: string;
  url?: string;
}

interface HeroProps {
  badge?: Badge;
  heading: string;
  subheading?: string;
  description: string;
  buttons?: Buttons;
  /**
   * Full-bleed background reel: each clip plays from `start` to `end`
   * (seconds), then crossfades into the next; loops.
   */
  clips: ReelClip[];
  /**
   * Still shown until the video plays, and instead of it when motion is
   * reduced, autoplay is refused or the video fails. A real ImageKit image:
   * the video's own ik-thumbnail is a video transformation and 403s while
   * the account's video quota is exhausted.
   */
  fallback: HeroMedia;
  className?: string;
}
type Props = Partial<HeroProps>;

const defaultProps: HeroProps = {
  badge: {
    text: "Yas Rise Community",
    url: "/community",
  },
  heading: "RUN TOGETHER.",
  subheading: "GROW TOGETHER.",
  description:
    "Weekly runs · training · outdoor adventures · good people. YRC is a running community for every pace — show up, run together, grow together.",
  buttons: {
    primary: {
      text: "JOIN THE COMMUNITY",
      url: "/login",
    },
    secondary: {
      text: "SEE UPCOMING RUNS",
      url: "/events",
    },
  },
  // All four are 1168×768, 5.4 s originals; 4 s of each, in this order.
  clips: [
    // The crew talking at golden hour, mountains behind (the original clip).
    { src: "/YRC/Home/hf_20261122_111745_bc09fc36-b5d4-4bb9-bd12-f5d1a2d06393.mp4", start: 0, end: 4 },
    // Wide: the crew on a ridge road above the hills, pine overhead.
    { src: "/YRC/Home/hf_20261123_144438_3e8a9609-c839-4c0d-89d4-e7155ea83a60.mp4", start: 0, end: 4, updatedAt: "1795446288277" },
    // Warm-up drills on the road, backlit.
    { src: "/YRC/Home/hf_20261123_145015_802d71d1-d4c4-4bf0-b3f3-097f5698618c.mp4", start: 0, end: 4, updatedAt: "1795446280237" },
    // The group under a blue sky (its last second has someone leaving frame).
    { src: "/YRC/Home/hf_20261123_144337_e8cf8a88-27aa-444d-b98c-45133304256f.mp4", start: 0, end: 4, updatedAt: "1795446279260" },
  ],
  fallback: {
    src: "/YRC/Community/SRK09740%20(1).jpg",
    alt: "",
    updatedAt: "1790005645712",
  },
};

const Hero = (props: Props) => {
  const {
    badge,
    heading,
    subheading,
    description,
    buttons,
    clips,
    fallback,
    className,
  } = {
    ...defaultProps,
    ...props,
  };

  const sectionRef = useRef<HTMLElement>(null);
  // Plays while on screen; never autoplays for reduced motion / Save-Data.
  const reel = useHeroReel(sectionRef, clips);
  const [fallbackLoaded, setFallbackLoaded] = useState(false);

  return (
    <section
      ref={sectionRef}
      className={cn(
        // `dark` scopes the dark token set to the hero so shadcn primitives
        // (outline button, borders, muted text) adapt automatically.
        "dark relative isolate flex overflow-hidden bg-background text-foreground lg:min-h-svh",
        className,
      )}
    >
      {/* Background: fallback image (LQIP → full) with the video fading in on top */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={
          fallbackLoaded
            ? undefined
            : {
                backgroundImage: `url(${lqip(fallback.src, fallback.updatedAt)})`,
              }
        }
      >
        <Image
          src={fallback.src}
          alt=""
          fill
          priority
          sizes="100vw"
          queryParameters={
            fallback.updatedAt ? { updatedAt: fallback.updatedAt } : undefined
          }
          onLoad={() => setFallbackLoaded(true)}
          className="object-cover object-center"
        />
        {!reel.allFailed &&
          clips.map((clip, i) =>
            reel.failed.has(i) ? null : (
              <Video
                key={clip.src}
                ref={(el: HTMLVideoElement | null) => {
                  reel.videos.current[i] = el;
                }}
                src={clip.src}
                queryParameters={
                  clip.updatedAt ? { ...ORIGINAL_VIDEO, updatedAt: clip.updatedAt } : ORIGINAL_VIDEO
                }
                muted
                playsInline
                preload={reel.preloadFor(i)}
                controls={false}
                tabIndex={-1}
                onPlaying={reel.onPlaying}
                onTimeUpdate={() => reel.onTimeUpdate(i)}
                onError={() => reel.onError(i)}
                className={cn(
                  "absolute inset-0 size-full object-cover object-center transition-opacity duration-1000",
                  reel.started && i === reel.index ? "opacity-100" : "opacity-0",
                )}
              />
            ),
          )}
      </div>

      {/* Scrims: left-weighted for text contrast + bottom fade into the next band */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-r from-black/85 via-black/60 to-black/25"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-t from-background to-transparent"
      />
      {/* Top fade so the transparent site header stays legible on bright frames */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-36 bg-linear-to-b from-black/60 to-transparent"
      />

      <div className="container flex items-center pt-32 pb-24 md:pt-40 md:pb-32">
        <div className="w-full">
          <div className="flex max-w-3xl flex-col gap-7">
            {badge && (
              <a
                href={badge.url ?? "#"}
                className="yrc-hero-in w-fit text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase hover:underline"
              >
                {badge.text}
              </a>
            )}

            <h1
              className="yrc-hero-in text-h1 font-bold md:text-display xl:text-hero"
              style={{ animationDelay: "80ms" }}
            >
              {heading}
              {subheading && (
                <>
                  <br />
                  <span className="text-muted-foreground">{subheading}</span>
                </>
              )}
            </h1>

            <p
              className="yrc-hero-in max-w-xl text-body text-foreground/80 md:text-h4 md:font-normal"
              style={{ animationDelay: "160ms" }}
            >
              {description}
            </p>

            {(buttons?.primary || buttons?.secondary) && (
              <div
                className="yrc-hero-in mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
                style={{ animationDelay: "240ms" }}
              >
                {buttons?.primary && (
                  <Button
                    size="lg"
                    className="h-12 w-full bg-yrc-accent px-7 tracking-wider text-yrc-accent-foreground hover:bg-yrc-accent/85 sm:w-auto"
                    render={
                      buttons.primary.url.startsWith("/") ? (
                        <Link href={buttons.primary.url} />
                      ) : (
                        <a href={buttons.primary.url} />
                      )
                    }
                    nativeButton={false}
                  >
                    {buttons.primary.text}
                  </Button>
                )}
                {buttons?.secondary && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 w-full px-7 tracking-wider backdrop-blur-sm sm:w-auto"
                    render={
                      buttons.secondary.url.startsWith("/") ? (
                        <Link href={buttons.secondary.url} />
                      ) : (
                        <a href={buttons.secondary.url} />
                      )
                    }
                    nativeButton={false}
                  >
                    {buttons.secondary.text}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {!reel.allFailed && (
        <button
          type="button"
          onClick={reel.toggle}
          aria-label={
            reel.playing ? "Pause background video" : "Play background video"
          }
          className="absolute right-4 bottom-4 flex size-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/80 backdrop-blur-sm transition-colors hover:text-white focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:right-6 sm:bottom-6"
        >
          {reel.playing ? (
            <Pause className="size-3.5" />
          ) : (
            <Play className="size-3.5" />
          )}
        </button>
      )}
    </section>
  );
};

export { Hero };
