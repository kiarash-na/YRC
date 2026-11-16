"use client";

import { useEffect, useRef } from "react";
import { cn } from "cn";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger offset in ms for items revealed together. */
  delay?: number;
}

/**
 * Scroll reveal — fades + lifts its content in once it enters the viewport.
 *
 * Purely presentational: the hidden state lives in globals.css (`.yrc-reveal`)
 * behind `@media (scripting: enabled) and (prefers-reduced-motion:
 * no-preference)`, so content is always visible without JS or with reduced
 * motion. Reveals once, never re-hides. Don't wrap above-the-fold hero
 * content (it would wait for hydration) — the hero uses CSS load animations.
 */
const Reveal = ({ children, className, delay = 0 }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null);

  // Writes the attribute straight to the DOM — a one-way flag, no re-render.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.dataset.reveal = "in";
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("yrc-reveal", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
};

export { Reveal };
