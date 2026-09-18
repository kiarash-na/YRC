"use client";

import { cn } from "cn";

import { buildSrc, Image } from "@/components/imagekit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? "";

const lqip = (src: string, updatedAt: string) =>
  urlEndpoint
    ? buildSrc({
        src,
        urlEndpoint,
        transformation: [{ quality: 10, blur: 90 }],
        queryParameters: { updatedAt },
      })
    : "";

const heroImage = {
  src: "/YRC/Events/Upcoming/Istanbul%20Marathon%202025/M05.jpg",
  alt: "YRC community sharing a moment together outdoors",
  updatedAt: "1789681303886",
};

interface EventsHeroProps {
  className?: string;
}

const EventsHero = ({ className }: EventsHeroProps) => {
  return (
    <section className={cn("overflow-hidden py-16 md:py-24", className)}>
      <div className="container">
        <div className="relative overflow-hidden rounded-xl border border-border">
          <div className="relative aspect-video bg-muted">
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
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-2/3 bg-linear-to-t from-background from-10% via-background/80 to-transparent md:block"
            />
          </div>

          <div className="relative z-10 grid gap-8 border-t border-border bg-background p-6 md:absolute md:inset-x-0 md:bottom-0 md:grid-cols-2 md:items-end md:gap-12 md:border-0 md:bg-transparent md:p-8 lg:p-10">
            <div className="flex flex-col gap-4">
              <Badge variant="outline" className="w-fit text-yrc-accent">
                Community & Experiences
              </Badge>
              <h1 className="max-w-xl text-h2 text-balance md:text-h1">
                YRC Events
              </h1>
            </div>
            <div className="flex flex-col gap-5">
              <p className="text-body-small font-medium text-foreground/80">
                Run together. Explore further. Keep moving.
              </p>
              <p className="max-w-xl text-pretty text-body text-foreground/80">
                YRC brings people together through community runs,
                international races, training camps and experiences built
                around running and endurance sports.
              </p>
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
          </div>
        </div>
      </div>
    </section>
  );
};

export { EventsHero };
