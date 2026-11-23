"use client";

import { cn } from "@/lib/utils";

import { Image } from "@/components/imagekit";
import { Button } from "@/components/ui/button";
import { slotDefaults, type SiteMediaItem } from "@/lib/site-media";
import { lqip } from "@/lib/imagekit";


interface EventsHeroProps {
  /** The slot's image (from /admin/media); defaults to the built-in one. */
  media?: SiteMediaItem[];
  className?: string;
}

const EventsHero = ({ className, media }: EventsHeroProps) => {
  const heroImage = (media ?? slotDefaults("events.hero"))[0];
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="flex max-w-4xl flex-col gap-7">
          <p className="yrc-hero-in text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
            Community & Experiences
          </p>
          <h1 style={{ animationDelay: "80ms" }} className="yrc-hero-in text-h1 text-balance md:text-display">YRC Events</h1>
          <div style={{ animationDelay: "160ms" }} className="yrc-hero-in flex max-w-2xl flex-col gap-4">
            <p className="text-body font-medium">
              Run together. Explore further. Keep moving.
            </p>
            <p className="text-body text-muted-foreground">
              YRC brings people together through community runs, international
              races, training camps and experiences built around running and
              endurance sports.
            </p>
          </div>
          <div style={{ animationDelay: "220ms" }} className="yrc-hero-in flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              className="uppercase"
              render={<a href="#upcoming-events" />}
              nativeButton={false}
            >
              Explore Upcoming Events
            </Button>
          </div>
        </div>

        <div style={{ animationDelay: "300ms" }} className="yrc-hero-in relative mt-14 aspect-3/2 w-full overflow-hidden rounded-xl border border-border bg-muted md:mt-20 md:aspect-21/9">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            fill
            priority
            sizes="(min-width: 1280px) 1280px, 100vw"
            queryParameters={heroImage.updatedAt ? { updatedAt: heroImage.updatedAt } : undefined}
            className="yrc-drift object-cover object-center"
            style={{
              backgroundImage: `url(${lqip(heroImage.src, heroImage.updatedAt)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            onLoad={(e) => {
              e.currentTarget.style.backgroundImage = "none";
            }}
          />
        </div>
      </div>
    </section>
  );
};

export { EventsHero };
