import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { slotDefaults, withMedia, type SiteMediaItem } from "@/lib/site-media";

import { Image } from "@/components/imagekit";
import { TALLY_POPUP_HASH } from "@/lib/tally";

interface TrainingElement {
  title: string;
  description: string;
  href: string;
}

const elements: TrainingElement[] = [
  {
    title: "Functional Strength",
    description:
      "Strength work built around the movements that running actually demands.",
    href: TALLY_POPUP_HASH,
  },
  {
    title: "Mobility & Movement",
    description:
      "Mobility sessions that keep your movement quality high through demanding training weeks.",
    href: TALLY_POPUP_HASH,
  },
  {
    title: "Balanced Training",
    description:
      "Strength and mobility woven into the training week — part of the program, not an afterthought.",
    href: TALLY_POPUP_HASH,
  },
  {
    title: "Preparation",
    description:
      "Arrive at sessions, races and camps feeling prepared for the challenges ahead.",
    href: TALLY_POPUP_HASH,
  },
];

interface StrengthMobilityProps {
  /** The slot's media (from /admin/media); defaults to the built-in set. */
  media?: SiteMediaItem[];
  className?: string;
}

const StrengthMobility = ({ className, media }: StrengthMobilityProps) => {
  const cards = withMedia(elements, media ?? slotDefaults("events.strength"));
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          <div className="flex max-w-xl flex-col items-start gap-7">
            <p className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
              Beyond the Miles
            </p>
            <h2 className="text-h2 text-balance md:text-h1">
              Functional Strength & Mobility
            </h2>
            <p className="text-body-small text-pretty text-muted-foreground md:text-body">
              Running is more than the miles. Build strength, mobility and
              movement habits that support your training and help you feel
              prepared for the challenges ahead.
            </p>
          </div>

          <div className="border-t border-border">
            {cards.map((element) => (
              <a
                key={element.title}
                href={element.href}
                className="group flex items-center gap-5 border-b border-border py-5 transition-colors hover:bg-muted/40"
              >
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border bg-muted">
                  <Image
                    src={element.image.src}
                    alt={element.image.alt}
                    fill
                    sizes="64px"
                    queryParameters={element.image.updatedAt ? { updatedAt: element.image.updatedAt } : undefined}
                    className="object-cover object-center"
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <h3 className="text-h4">{element.title}</h3>
                  <p className="text-body-small text-muted-foreground">
                    {element.description}
                  </p>
                </div>
                <span className="ml-auto flex size-10 shrink-0 items-center justify-center rounded-full border transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                  <ArrowRight className="size-4 -rotate-45" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { StrengthMobility };
