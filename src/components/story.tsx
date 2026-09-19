import { ArrowRight } from "lucide-react";
import { cn } from "cn";

import { Image } from "@/components/imagekit";

const portrait = {
  src: "/YRC/14.png",
  alt: "YRC runner during a marathon race day",
  updatedAt: "1789773523944",
};

const landscape = {
  src: "/YRC/8.png",
  alt: "YRC community sharing a moment together outdoors",
  updatedAt: "1789773523621",
};

interface StoryProps {
  className?: string;
}

const Story = ({ className }: StoryProps) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative order-last aspect-3/4 w-full overflow-hidden rounded-xl border bg-muted lg:order-first">
            <Image
              src={portrait.src}
              alt={portrait.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              queryParameters={{ updatedAt: portrait.updatedAt }}
              transformation={[
                { aspectRatio: "3-4", crop: "force", focus: "auto" },
              ]}
              className="object-cover object-center grayscale"
            />
          </div>

          <div className="flex flex-col gap-7">
            <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
              Our story
            </p>
            <h2 className="text-h2 md:text-h1">More than the finish line</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <p className="text-body-small text-muted-foreground md:text-body">
                Yas Rise was built around a simple belief: the journey matters
                as much as the finish line.
              </p>
              <p className="text-body-small text-muted-foreground md:text-body">
                We believe running and endurance sports can become more than
                individual performance — connection, shared experiences,
                personal growth and a community that keeps moving forward
                together.
              </p>
            </div>
            <a
              href="/about"
              className="inline-flex w-fit items-center gap-1 font-medium text-primary underline underline-offset-4 transition-opacity hover:opacity-75"
            >
              Read Our Story <ArrowRight className="size-4" />
            </a>
            <div className="relative mt-4 aspect-3/2 w-full overflow-hidden rounded-xl border bg-muted">
              <Image
                src={landscape.src}
                alt={landscape.alt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                queryParameters={{ updatedAt: landscape.updatedAt }}
                transformation={[
                  { aspectRatio: "3-2", crop: "force", focus: "auto" },
                ]}
                className="object-cover object-center grayscale"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Story };
