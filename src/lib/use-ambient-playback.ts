"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

/**
 * Playback policy for decorative, muted, looping videos (hero + ambient
 * clips). Plays only while the video is on screen, so off-screen clips cost
 * no CPU, battery or bandwidth (`preload="none"` means nothing downloads
 * until the first play). Every visitor gets autoplay (site decision: all
 * clips autoplay, muted, everywhere); the pause toggle is the opt-out, and a
 * manual pause sticks — scrolling back doesn't restart it. Browsers that
 * refuse autoplay outright (e.g. iOS Low Power Mode) keep the poster.
 */
export function useAmbientPlayback(
  ref: RefObject<HTMLVideoElement | null>,
  threshold = 0.25,
) {
  const [playing, setPlaying] = useState(false);
  const userPaused = useRef(false);
  const autoplay = useRef(true);
  // Set while *we* pause (scrolled off screen), so any other pause — the
  // toggle or native controls — counts as the visitor's choice.
  const observerPause = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.muted = true; // iOS only autoplays videos that are muted as a property too

    const onPlay = () => {
      userPaused.current = false;
      setPlaying(true);
    };
    const onPause = () => {
      if (!observerPause.current) userPaused.current = true;
      observerPause.current = false;
      setPlaying(false);
    };
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          if (autoplay.current && !userPaused.current) el.play().catch(() => {});
        } else if (!el.paused) {
          observerPause.current = true;
          el.pause();
        }
      },
      { threshold },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
    };
  }, [ref, threshold]);

  const toggle = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) {
      autoplay.current = true;
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [ref]);

  return { playing, toggle };
}
