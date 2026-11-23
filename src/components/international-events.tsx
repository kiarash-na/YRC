import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { slotDefaults, withMedia, type SiteMediaItem } from "@/lib/site-media";

import { Image } from "@/components/imagekit";
import { Button } from "@/components/ui/button";
import { TALLY_POPUP_HASH } from "@/lib/tally";

interface CollageImage {
  className: string;
  // Bounds oversized ImageKit originals (>25MP ELIMIT) — see 6a79ba2.
  width?: number;
}

const items = [
  "Road marathons and city races",
  "Trail and mountain events",
  "Endurance challenges",
  "Travel and shared experiences",
];

const images: CollageImage[] = [
  {
    className: "row-span-2",
  },
  {
    className: "col-span-2",
  },
  {
    className: "",
  },
  {
    className: "",
  },
];

interface InternationalEventsProps {
  /** The slot's media (from /admin/media); defaults to the built-in set. */
  media?: SiteMediaItem[];
  className?: string;
}

const InternationalEvents = ({ className, media }: InternationalEventsProps) => {
  const tiles = withMedia(images, media ?? slotDefaults("events.international")).map(({ image, ...layout }) => ({ ...layout, ...image }));
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-6">
            <p className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
              Beyond Borders
            </p>
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
            {tiles.map((image) => (
              <div
                key={image.src}
                className={cn(
                  "relative overflow-hidden rounded-xl border bg-muted",
                  image.className,
                )}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  queryParameters={image.updatedAt ? { updatedAt: image.updatedAt } : undefined}
                  transformation={
                    image.width ? [{ width: image.width }] : undefined
                  }
                  className="object-cover object-center"
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
