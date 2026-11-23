import { cn } from "@/lib/utils";
import { slotDefaults, withMedia, type SiteMediaItem } from "@/lib/site-media";

import { Image } from "@/components/imagekit";

const images = [
  {
    className: "aspect-4/3",
  },
  {
    className: "aspect-4/3 md:aspect-3/4",
  },
];

interface LivedJourneyProps {
  /** The slot's media (from /admin/media); defaults to the built-in set. */
  media?: SiteMediaItem[];
  className?: string;
}

const LivedJourney = ({ className, media }: LivedJourneyProps) => {
  const tiles = withMedia(images, media ?? slotDefaults("about.journey")).map(({ image, ...layout }) => ({ ...layout, ...image }));
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="flex max-w-4xl flex-col gap-7">
          <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
            We lived the journey
          </p>
          <h2 className="text-h2 md:text-h1">
            We didn&rsquo;t read about this life.
            <br />
            <span className="text-muted-foreground">
              We ran our way into it.
            </span>
          </h2>
        </div>

        <div className="mt-14 grid items-start gap-10 md:mt-20 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-5 text-body text-muted-foreground">
            <p>
              Every one of us started somewhere. We&rsquo;ve been the
              first-timer nervous at the start line. The runner coming back
              after a long break. The one who swore marathons weren&rsquo;t
              for them — right up until one was.
            </p>
            <p>
              That&rsquo;s why nobody here performs expertise from a podium.
              YRC works because it&rsquo;s built by people who are still on
              the journey — still training, still learning, still chasing the
              next start line. When we say every pace, we mean it. Every one
              of us has been every pace.
            </p>
            <blockquote className="mt-4 border-l-4 border-yrc-accent pl-8">
              <p className="text-h4 text-foreground md:text-h3">
                &ldquo;We&rsquo;re not ahead of you on the road. We&rsquo;re
                beside you on it.&rdquo;
              </p>
            </blockquote>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div
              className={cn(
                "relative w-full overflow-hidden rounded-xl border bg-muted",
                tiles[0].className
              )}
            >
              <Image
                src={tiles[0].src}
                alt={tiles[0].alt}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                queryParameters={tiles[0].updatedAt ? { updatedAt: tiles[0].updatedAt } : undefined}
                className="object-cover object-center grayscale transition-[filter] duration-500 hover:filter-none active:filter-none"
              />
            </div>
            <div
              className={cn(
                "relative w-full overflow-hidden rounded-xl border bg-muted sm:mt-12",
                tiles[1].className
              )}
            >
              <Image
                src={tiles[1].src}
                alt={tiles[1].alt}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                queryParameters={tiles[1].updatedAt ? { updatedAt: tiles[1].updatedAt } : undefined}
                className="object-cover object-center grayscale transition-[filter] duration-500 hover:filter-none active:filter-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { LivedJourney };
