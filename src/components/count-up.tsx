"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

interface CountUpProps {
  value: number;
  /** ms; slow on purpose — a scoreboard settling, not a slot machine. */
  duration?: number;
  className?: string;
}

/**
 * Scoreboard count-up. The server renders the final number (no JS, SEO and
 * screen readers always get the real value); only when the number starts
 * below the fold and motion is allowed does it reset to 0 and count up as it
 * scrolls into view. Mutates the existing text node directly — no React
 * re-renders per frame. Tabular figures keep the width steady.
 */
const CountUp = ({ value, duration = 1400, className }: CountUpProps) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const node = el?.firstChild;
    if (!el || !node || value <= 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // already seen

    const format = (n: number) => String(Math.round(n));
    node.nodeValue = format(0);
    let frame = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
          node.nodeValue = format(value * eased);
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      node.nodeValue = format(value);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {String(value)}
    </span>
  );
};

export { CountUp };
