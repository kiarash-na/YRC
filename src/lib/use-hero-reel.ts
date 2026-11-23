"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

export interface ReelClip {
  /** ImageKit path of the clip. */
  src: string;
  /** Seconds into the file where this clip's part starts. */
  start: number;
  /** Seconds into the file where it hands over to the next clip (Infinity = at its end). */
  end: number;
  updatedAt?: string;
}

interface NetworkInformationLike {
  saveData?: boolean;
  effectiveType?: string;
}

/**
 * A muted background reel: plays `clips` one after another (each from
 * `start` to `end`), crossfading into the next and looping back to the first.
 * Same playback policy as useAmbientPlayback: only while the section is on
 * screen, never on its own for reduced motion / Save-Data / 2G, and a pause
 * from the toggle sticks. Only the current and the next clip preload.
 */
export function useHeroReel(
  section: RefObject<HTMLElement | null>,
  clips: ReelClip[],
  threshold = 0.1,
) {
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [failed, setFailed] = useState<Set<number>>(new Set());
  // Once any clip has painted a frame the reel fades in over the still.
  const [started, setStarted] = useState(false);
  const count = clips.length;
  const playing = allowed && visible && !userPaused && failed.size < count;

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowData = connection?.saveData === true || /(^|-)2g$/.test(connection?.effectiveType ?? "");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads browser-only settings once
    setAllowed(!reduced && !lowData);

    const el = section.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(Boolean(entry?.isIntersecting)), {
      threshold,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [section, threshold]);

  // The next clip that hasn't failed.
  const nextIndex = useCallback(
    (from: number) => {
      for (let step = 1; step <= count; step += 1) {
        const i = (from + step) % count;
        if (!failed.has(i)) return i;
      }
      return from;
    },
    [count, failed],
  );

  // Play the current clip, pause the others once the crossfade is over.
  useEffect(() => {
    const current = videos.current[index];
    if (!current) return;
    if (!playing) {
      current.pause();
      return;
    }
    const clip = clips[index];
    if (current.currentTime < clip.start || current.currentTime >= clip.end) {
      current.currentTime = clip.start;
    }
    current.play().catch(() => {});
    const settle = window.setTimeout(() => {
      videos.current.forEach((video, i) => {
        if (video && i !== index && !video.paused) video.pause();
      });
    }, 1200);
    return () => window.clearTimeout(settle);
  }, [index, playing, clips]);

  // Hand over at each clip's end mark.
  const onTimeUpdate = useCallback(
    (i: number) => {
      const video = videos.current[i];
      if (i !== index || !video || (video.currentTime < clips[i].end && !video.ended)) return;
      const next = nextIndex(i);
      if (next === i) {
        video.currentTime = clips[i].start; // a reel of one: loop its part
        return;
      }
      const upcoming = videos.current[next];
      if (upcoming) upcoming.currentTime = clips[next].start;
      setIndex(next);
    },
    [index, clips, nextIndex],
  );

  const onError = useCallback(
    (i: number) => {
      setFailed((current) => new Set(current).add(i));
      if (i === index) setIndex(nextIndex(i));
    },
    [index, nextIndex],
  );

  const toggle = useCallback(() => {
    if (playing) {
      setUserPaused(true);
    } else {
      setAllowed(true); // pressing play opts in, even with reduced motion
      setUserPaused(false);
    }
  }, [playing]);

  const preloadFor = (i: number) => (i === index || i === nextIndex(index) ? "auto" : "none");

  return {
    videos,
    index,
    playing,
    started,
    allFailed: failed.size >= count,
    failed,
    preloadFor,
    onPlaying: () => setStarted(true),
    onTimeUpdate,
    onError,
    toggle,
  };
}
