"use client";

import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

import { buildSrc, Image, Video } from "@/components/imagekit";
import { IMAGEKIT_URL_ENDPOINT, ORIGINAL_VIDEO } from "@/lib/imagekit";
import { useAmbientPlayback } from "@/lib/use-ambient-playback";
import { cn } from "@/lib/utils";

interface AmbientVideoProps {
  /** ImageKit path of the clip (muted, looping, decorative). */
  src: string;
  /** Still shown until the clip plays, and instead of it when it can't. */
  poster: { src: string; alt: string; updatedAt?: string };
  sizes: string;
  /** Short name for the toggle, e.g. "drills video". */
  label: string;
  /** object-position etc. for both the poster and the clip. */
  mediaClassName?: string;
  /**
   * Extra classes for the clip + its toggle only, e.g. "hidden md:block" to
   * keep a still on phones where the slot's crop doesn't suit the clip. A
   * hidden clip never intersects, so it never downloads.
   */
  clipClassName?: string;
  /**
   * Native controls (unmute, fullscreen) for clips that are content rather
   * than decoration, e.g. journal highlights. The clip is then visible from
   * the start (poster frame) and focusable; no custom toggle.
   */
  controls?: boolean;
  className?: string;
}

/**
 * A static image that comes alive: the poster renders first (normal lazy
 * ImageKit image, no layout shift), the clip fades in over it once it is
 * actually playing. Fills its parent — the parent sets size/aspect and must
 * be `relative overflow-hidden`. Playback rules live in useAmbientPlayback.
 *
 * Clips are served as originals (ORIGINAL_VIDEO): the account's video
 * transformation quota is exhausted, which also rules out ik-thumbnail
 * posters — hence a real image as the poster.
 */
const AmbientVideo = ({
  src,
  poster,
  sizes,
  label,
  mediaClassName,
  clipClassName,
  controls = false,
  className,
}: AmbientVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { playing, toggle } = useAmbientPlayback(videoRef);
  const [shown, setShown] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn("absolute inset-0", className)}>
      <Image
        src={poster.src}
        alt={poster.alt}
        fill
        sizes={sizes}
        queryParameters={
          poster.updatedAt ? { updatedAt: poster.updatedAt } : undefined
        }
        className={cn("object-cover object-center", mediaClassName)}
      />
      {!failed && (
        <>
          <Video
            ref={videoRef}
            src={src}
            queryParameters={ORIGINAL_VIDEO}
            muted
            loop
            playsInline
            preload="none"
            controls={controls}
            {...(controls
              ? {
                  poster: buildSrc({
                    src: poster.src,
                    urlEndpoint: IMAGEKIT_URL_ENDPOINT,
                    transformation: [{ width: 800 }],
                  }),
                  "aria-label": poster.alt,
                }
              : { tabIndex: -1, "aria-hidden": true })}
            onPlaying={() => setShown(true)}
            onError={() => setFailed(true)}
            className={cn(
              "absolute inset-0 size-full object-cover object-center transition-opacity duration-1000 ease-out",
              shown || controls ? "opacity-100" : "opacity-0",
              mediaClassName,
              clipClassName,
            )}
          />
          {!controls && (
            <button
              type="button"
              onClick={toggle}
              aria-label={`${playing ? "Pause" : "Play"} ${label}`}
              className={cn(
                "absolute right-3 bottom-3 flex size-9 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white/85 backdrop-blur-sm transition-colors hover:text-white focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                clipClassName,
              )}
            >
              {playing ? (
                <Pause className="size-3.5" />
              ) : (
                <Play className="size-3.5" />
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export { AmbientVideo };
