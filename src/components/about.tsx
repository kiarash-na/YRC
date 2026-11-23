import { cn } from "@/lib/utils";
import { slotDefaults, withMedia, type SiteMediaItem } from "@/lib/site-media";

import { Image } from "@/components/imagekit";
import { Reveal } from "@/components/reveal";

interface AboutImage {
  /** Grid placement in the asymmetric editorial pair. */
  span: string;
  /** Frame aspect classes (literal, so Tailwind's scanner sees them). */
  frame: string;
}

const images: AboutImage[] = [
  {
    span: "md:col-span-7",
    frame: "aspect-4/3",
  },
  {
    span: "md:col-span-5 md:mb-24",
    frame: "aspect-4/3 md:aspect-3/4",
  },
];

interface AboutProps {
  /** The slot's media (from /admin/media); defaults to the built-in set. */
  media?: SiteMediaItem[];
  className?: string;
}

const About = ({ className, media }: AboutProps) => {
  const tiles = withMedia(images, media ?? slotDefaults("home.about")).map(({ image, ...layout }) => ({ ...layout, ...image }));
  return (
    <section className={cn("py-24 md:py-32", className)}>
      <div className="container">
        <Reveal className="grid gap-6 md:grid-cols-12 md:gap-10">
          <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase md:col-span-3">
            Who we are
          </p>
          <div className="flex flex-col gap-6 md:col-span-8 md:col-start-5">
            <h2 className="text-h2 md:text-h1">Yas Rise Community</h2>
            <p className="text-h4 font-medium md:text-h3">
              Personal growth through a shared journey.
            </p>
            <p className="max-w-2xl text-body-small text-muted-foreground md:text-body">
              Yas Rise is an ecosystem built around endurance sports,
              community, travel and shared experiences. We bring together
              selected sporting events, training programs, sports camps and
              international trips with a community of people who believe the
              journey matters as much as the finish line.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid items-end gap-4 md:mt-20 md:grid-cols-12 md:gap-6">
          {tiles.map((image, index) => (
            <Reveal key={image.src} delay={index * 120} className={image.span}>
              <div
                className={cn(
                  "relative w-full overflow-hidden rounded-xl border bg-muted",
                  image.frame,
                )}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 768px) 58vw, 100vw"
                  queryParameters={
                  image.updatedAt ? { updatedAt: image.updatedAt } : undefined
                }
                  // No server-side crop: the frame ratio changes per
                  // breakpoint, so object-cover crops the original instead.
                  transformation={
                    image.width ? [{ width: image.width }] : undefined
                  }
                  className="object-cover object-center grayscale transition-[filter] duration-500 hover:filter-none active:filter-none"
                />
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-20 grid gap-6 border-t-2 border-foreground pt-10 md:mt-28 md:grid-cols-12 md:gap-10">
          <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase md:col-span-3">
            What drives us
          </p>
          <div className="flex flex-col gap-6 md:col-span-8 md:col-start-5">
            <h3 className="text-h2 md:text-h1">
              The journey matters as much as the finish line.
            </h3>
            <p className="max-w-2xl text-body-small text-muted-foreground md:text-body">
              Finishing a race is a moment. Everything around it — the early
              mornings, the people beside you, the places it takes you — is
              what stays. YRC exists to make that journey shared, sustainable
              and worth showing up for.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export { About };
