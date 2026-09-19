"use client";

import { cn } from "cn";

import { Image } from "@/components/imagekit";
import { Button } from "@/components/ui/button";
import { lqip } from "@/lib/imagekit";

const heroImage = {
  src: "/YRC/Events/Upcoming/Istanbul%20Marathon%202025/pexels-roman-odintsov-5859136.jpg",
  alt: "YRC community sharing a moment together outdoors",
  updatedAt: "1789681295806",
};

interface EventsHeroProps {
  className?: string;
}

const EventsHero = ({ className }: EventsHeroProps) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="flex max-w-4xl flex-col gap-7">
          <p className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
            Community & Experiences
          </p>
          <h1 className="text-h1 text-balance md:text-display">YRC Events</h1>
          <div className="flex max-w-2xl flex-col gap-4">
            <p className="text-body font-medium">
              Run together. Explore further. Keep moving.
            </p>
            <p className="text-body text-muted-foreground">
              YRC brings people together through community runs, international
              races, training camps and experiences built around running and
              endurance sports.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
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

        <div className="relative mt-14 aspect-3/2 w-full overflow-hidden rounded-xl border border-border bg-muted md:mt-20 md:aspect-21/9">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            fill
            priority
            sizes="(min-width: 1280px) 1280px, 100vw"
            queryParameters={{ updatedAt: heroImage.updatedAt }}
            className="object-cover object-center"
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
