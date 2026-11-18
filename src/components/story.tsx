import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

import { Image } from "@/components/imagekit";
import { Reveal } from "@/components/reveal";

const portrait = {
  src: "/YRC/41.png",
  alt: "YRC runner during a marathon race day",
  updatedAt: "1789773516271",
};

const landscape = {
  src: "/YRC/Events/Upcoming/Istanbul%20Marathon%202025/03.jpg",
  alt: "YRC community sharing a moment together outdoors",
  updatedAt: "1789681140856",
};

interface StoryProps {
  className?: string;
}

const Story = ({ className }: StoryProps) => {
  return (
    <section className={cn("py-24 md:py-32", className)}>
      <div className="container">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="order-last lg:sticky lg:top-12 lg:order-first lg:col-span-5">
            <div className="relative aspect-3/4 w-full overflow-hidden rounded-xl border bg-muted">
              <Image
                src={portrait.src}
                alt={portrait.alt}
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                queryParameters={{ updatedAt: portrait.updatedAt }}
                transformation={[
                  { aspectRatio: "3-4", crop: "maintain_ratio", focus: "auto" },
                ]}
                className="object-cover object-center grayscale transition-[filter] duration-500 hover:filter-none active:filter-none"
              />
            </div>
          </Reveal>

          <div className="flex flex-col gap-7 lg:col-span-7">
            <Reveal className="flex flex-col gap-7">
              <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
                Our story
              </p>
              <h2 className="text-h2 md:text-h1 lg:text-display">
                More than the finish line
              </h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <p className="text-body-small text-muted-foreground md:text-body">
                  Yas Rise was built around a simple belief: the journey
                  matters as much as the finish line.
                </p>
                <p className="text-body-small text-muted-foreground md:text-body">
                  We believe running and endurance sports can become more
                  than individual performance — connection, shared
                  experiences, personal growth and a community that keeps
                  moving forward together.
                </p>
              </div>
              <a
                href="/about"
                className="group inline-flex w-fit items-center gap-1 font-medium text-primary underline underline-offset-4 transition-opacity hover:opacity-75"
              >
                Read Our Story{" "}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Reveal>
            <Reveal delay={120} className="mt-4">
              <div className="relative aspect-3/2 w-full overflow-hidden rounded-xl border bg-muted">
                <Image
                  src={landscape.src}
                  alt={landscape.alt}
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  queryParameters={{ updatedAt: landscape.updatedAt }}
                  transformation={[
                    { aspectRatio: "3-2", crop: "maintain_ratio", focus: "auto" },
                  ]}
                  className="object-cover object-center grayscale transition-[filter] duration-500 hover:filter-none active:filter-none"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Story };
