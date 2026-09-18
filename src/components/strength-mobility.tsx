import { ArrowRight, Dumbbell } from "lucide-react";
import { cn } from "cn";

import { Image } from "@/components/imagekit";
import { Badge } from "@/components/ui/badge";
import { TALLY_POPUP_HASH } from "@/lib/tally";

interface TrainingElement {
  title: string;
  description: string;
  image: {
    src: string;
    alt: string;
    updatedAt: string;
  };
  href: string;
}

const elements: TrainingElement[] = [
  {
    title: "Functional Strength",
    description:
      "Strength work built around the movements that running actually demands.",
    image: {
      src: "/YRC/Events/Upcoming/Istanbul%20Marathon%202025/03.jpg",
      alt: "YRC runners in motion on a group run",
      updatedAt: "1789641881097",
    },
    href: TALLY_POPUP_HASH,
  },
  {
    title: "Mobility & Movement",
    description:
      "Mobility sessions that keep your movement quality high through demanding training weeks.",
    image: {
      src: "/YRC/Events/Upcoming/Istanbul%20Marathon%202025/4.jpg",
      alt: "YRC runners training together",
      updatedAt: "1789641774014",
    },
    href: TALLY_POPUP_HASH,
  },
  {
    title: "Balanced Training",
    description:
      "Strength and mobility woven into the training week — part of the program, not an afterthought.",
    image: {
      src: "/YRC/Events/Upcoming/Istanbul%20Marathon%202025/pexels-roman-odintsov-5859136.jpg",
      alt: "YRC group sharing a moment after training",
      updatedAt: "1789681295806",
    },
    href: TALLY_POPUP_HASH,
  },
  {
    title: "Preparation",
    description:
      "Arrive at sessions, races and camps feeling prepared for the challenges ahead.",
    image: {
      src: "/YRC/Events/Upcoming/Istanbul%20Marathon%202025/photo_5940647121873128959_x.jpg",
      alt: "YRC runner during a marathon race day",
      updatedAt: "1789681280915",
    },
    href: TALLY_POPUP_HASH,
  },
];

interface StrengthMobilityProps {
  className?: string;
}

const StrengthMobility = ({ className }: StrengthMobilityProps) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          <div className="flex max-w-xl flex-col items-start gap-5">
            <Badge
              variant="outline"
              className="flex h-6 items-center gap-1.5 px-3 text-caption font-bold tracking-[0.3em] uppercase"
            >
              <Dumbbell className="size-3.5" />
              Beyond the Miles
            </Badge>
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
            {elements.map((element) => (
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
                    queryParameters={{ updatedAt: element.image.updatedAt }}
                    className="object-cover"
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
