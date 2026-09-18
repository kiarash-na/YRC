import { ArrowRight } from "lucide-react";
import { cn } from "cn";

import { Image } from "@/components/imagekit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TALLY_POPUP_HASH } from "@/lib/tally";

const basePath = "/YRC/Events/Upcoming/Istanbul%20Marathon%202025";

interface CollageImage {
  src: string;
  alt: string;
  updatedAt: string;
  className: string;
}

const items = [
  "Road marathons and city races",
  "Trail and mountain events",
  "Endurance challenges",
  "Travel and shared experiences",
];

const images: CollageImage[] = [
  {
    src: `${basePath}/photo_5953857689656346515_w.jpg`,
    alt: "YRC community member mid-run during an international event",
    updatedAt: "1789681284418",
    className: "row-span-2",
  },
  {
    src: `${basePath}/M06.jpg`,
    alt: "YRC runners together on race day",
    updatedAt: "1789681293386",
    className: "col-span-2",
  },
  {
    src: `${basePath}/3.jpg`,
    alt: "YRC group sharing a moment after training",
    updatedAt: "1789681291699",
    className: "",
  },
  {
    src: `${basePath}/03-1.jpg`,
    alt: "Runners on the course during a YRC event",
    updatedAt: "1789681290358",
    className: "",
  },
];

interface InternationalEventsProps {
  className?: string;
}

const InternationalEvents = ({ className }: InternationalEventsProps) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-6">
            <Badge
              variant="outline"
              className="h-6 px-3 text-caption font-bold tracking-[0.3em] uppercase"
            >
              Beyond Borders
            </Badge>
            <h2 className="text-h2 text-balance md:text-h1">
              <span className="text-yrc-accent">International</span> Events
            </h2>
            <p className="max-w-md text-body-small text-pretty text-muted-foreground md:text-body">
              Selected road, trail and endurance events that bring the YRC
              community beyond the familiar and into new places, challenges
              and experiences.
            </p>
            <ul className="space-y-3 text-body-small">
              {items.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-2 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="uppercase"
                render={<a href="#upcoming-events" />}
                nativeButton={false}
              >
                See Upcoming Events
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="uppercase"
                render={<a href={TALLY_POPUP_HASH} />}
                nativeButton={false}
              >
                Join the Community
              </Button>
            </div>
          </div>

          <div className="grid h-72 grid-cols-3 grid-rows-2 gap-3 sm:h-96 lg:h-[440px]">
            {images.map((image) => (
              <div
                key={image.src}
                className={cn(
                  "relative overflow-hidden rounded-2xl border bg-muted",
                  image.className,
                )}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  queryParameters={{ updatedAt: image.updatedAt }}
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { InternationalEvents };
