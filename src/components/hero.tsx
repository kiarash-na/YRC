"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "cn";

import { Image, Video } from "@/components/imagekit";
import { Button } from "@/components/ui/button";
import { lqip, ORIGINAL_VIDEO } from "@/lib/imagekit";
import { TALLY_POPUP_HASH } from "@/lib/tally";

/*
 * Home hero — adapted from shadcnblocks hero185 (split hero + bento photo
 * grid), extended with a full-bleed background video. This is the ONE
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
  /** Full-bleed background video (ImageKit path). */
  video: { src: string };
  /**
   * Still shown until the video plays, and instead of it when motion is
   * reduced, autoplay is refused or the video fails. A real ImageKit image:
   * the video's own ik-thumbnail is a video transformation and 403s while
   * the account's video quota is exhausted.
   */
  fallback: HeroMedia;
  /** Bento tiles: [tall, supporting]. */
  images: [HeroMedia, HeroMedia];
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
      url: TALLY_POPUP_HASH,
    },
    secondary: {
      text: "SEE UPCOMING RUNS",
      url: "/events",
    },
  },
  video: {
    src: "/YRC/13372516_1080_1920_30fps.mp4",
  },
  fallback: {
    src: "/YRC/Home/pexels-runffwpu-18409430.jpg",
    alt: "",
    updatedAt: "1789992716323",
  },
  images: [
    {
      src: "/YRC/Home/pexels-runffwpu-18408962.jpg",
      alt: "YRC runners racing shoulder to shoulder in a road race",
      updatedAt: "1789681295806",
    },
    {
      src: "/YRC/Community/photo_5877443723178741686_w.jpg",
      alt: "YRC community group run — runners of every pace moving together as one pack",
    },
  ],
};

const Hero = (props: Props) => {
  const {
    badge,
    heading,
    subheading,
    description,
    buttons,
    video,
    fallback,
    images,
    className,
  } = {
    ...defaultProps,
    ...props,
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  // Mirrors the element's own play/pause events (drives the toggle icon).
  const [playing, setPlaying] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  // The video fades in over the fallback once its first frame is playing.
  const [videoShown, setVideoShown] = useState(false);
  const [fallbackLoaded, setFallbackLoaded] = useState(false);

  // Respect reduced motion: never autoplay, the fallback image stays. Users can still start it with the toggle.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.pause();
      return;
    }
    // Autoplay can be refused (e.g. low-power mode); the fallback stays.
    el.play().catch(() => {});
  }, []);

  const togglePlayback = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  const [tall, supporting] = images;

  return (
    <section
      className={cn(
        // `dark` scopes the dark token set to the hero so shadcn primitives
        // (outline button, borders, muted text) adapt automatically.
        "dark relative isolate flex overflow-hidden bg-background text-foreground lg:min-h-[calc(100svh-5.25rem)]",
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
        {!videoFailed && (
          <Video
            ref={videoRef}
            src={video.src}
            queryParameters={ORIGINAL_VIDEO}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            controls={false}
            tabIndex={-1}
            onPlaying={() => setVideoShown(true)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onError={() => setVideoFailed(true)}
            className={cn(
              "absolute inset-0 size-full object-cover object-[50%_35%] transition-opacity duration-1000",
              videoShown ? "opacity-100" : "opacity-0",
            )}
          />
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

      <div className="container flex items-center py-24 md:py-32">
        <div className="grid w-full items-center gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="flex flex-col gap-7 lg:col-span-7">
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
                    render={<a href={buttons.primary.url} />}
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

          {/* hero185 bento: tall primary tile + offset supporting tile */}
          <div
            className="yrc-hero-in grid grid-cols-5 items-end gap-3 sm:gap-4 lg:col-span-5"
            style={{ animationDelay: "320ms" }}
          >
            <div className="relative col-span-3 aspect-3/4 overflow-hidden rounded-xl border bg-muted">
              <Image
                src={tall.src}
                alt={tall.alt}
                fill
                loading="eager"
                sizes="(min-width: 1024px) 25vw, 60vw"
                queryParameters={
                  tall.updatedAt ? { updatedAt: tall.updatedAt } : undefined
                }
                transformation={[
                  { aspectRatio: "3-4", crop: "force", focus: "auto" },
                ]}
                className="object-cover object-center"
              />
            </div>
            <div className="relative col-span-2 mb-10 aspect-3/4 overflow-hidden rounded-xl border bg-muted sm:mb-16">
              <Image
                src={supporting.src}
                alt={supporting.alt}
                fill
                loading="eager"
                sizes="(min-width: 1024px) 17vw, 40vw"
                queryParameters={
                  supporting.updatedAt
                    ? { updatedAt: supporting.updatedAt }
                    : undefined
                }
                transformation={[
                  { aspectRatio: "3-4", crop: "force", focus: "auto" },
                ]}
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>
      </div>

      {!videoFailed && (
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={
            playing ? "Pause background video" : "Play background video"
          }
          className="absolute right-4 bottom-4 flex size-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/80 backdrop-blur-sm transition-colors hover:text-white focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:right-6 sm:bottom-6"
        >
          {playing ? (
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
