import { ArrowRight } from "lucide-react";
import { cn } from "cn";

import { Image } from "@/components/imagekit";
import { TALLY_POPUP_HASH } from "@/lib/tally";

interface Camp {
  title: string;
  description: string;
  image: {
    src: string;
    alt: string;
    updatedAt: string;
  };
  href: string;
  wide?: boolean;
}

const camps: Camp[] = [
  {
    title: "Endurance & Altitude Camps",
    description:
      "Focused training blocks in the mountains — building endurance, strength and routine together.",
    image: {
      src: "/YRC/Events/Upcoming/Istanbul%20Marathon%202025/4.jpg",
      alt: "YRC runners in motion on a group run",
      updatedAt: "1789681284418",
    },
    href: TALLY_POPUP_HASH,
  },
  {
    title: "Race Preparation",
    description:
      "Structured build-up toward a shared goal race — training, pacing and race-day support side by side.",
    image: {
      src: "/YRC/Events/Upcoming/Istanbul%20Marathon%202025/M05.jpg",
      alt: "YRC runner during a marathon race day",
      updatedAt: "1789681320000",
    },
    href: TALLY_POPUP_HASH,
    wide: true,
  },
  {
    title: "Trail & Outdoor Training",
    description:
      "Technical terrain, elevation and time outside — training that doubles as exploration.",
    image: {
      src: "/YRC/Events/Upcoming/Istanbul%20Marathon%202025/03.jpg",
      alt: "Runner outdoors during a YRC trip",
      updatedAt: "1789681310000",
    },
    href: TALLY_POPUP_HASH,
    wide: true,
  },
  {
    title: "Community Sports Trips",
    description:
      "Trips that mix training with travel, recovery and time together — the experience matters as much as the sessions.",
    image: {
      src: "/YRC/Events/Upcoming/Istanbul%20Marathon%202025/M07.jpg",
      alt: "YRC community members connecting after a run",
      updatedAt: "1789681140651",
    },
    href: TALLY_POPUP_HASH,
  },
];

interface TrainingCampsProps {
  className?: string;
}

const TrainingCamps = ({ className }: TrainingCampsProps) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-7">
          <p className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
            Camps & Trips
          </p>
          <h2 className="text-center text-h2 md:text-h1">
            <span className="text-yrc-accent">Training</span> Camps
          </h2>
          <p className="text-center text-body-small text-muted-foreground md:text-body">
            Specialized camps and trips designed around training, preparation,
            motivation and meaningful time together.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-6xl gap-4 md:mt-20 lg:grid-cols-3">
          {camps.map((camp) => (
            <a
              key={camp.title}
              href={camp.href}
              className={cn(
                "group flex flex-col rounded-xl border border-border transition-colors hover:bg-muted/40",
                camp.wide && "lg:col-span-2",
              )}
            >
              <div className="flex items-start justify-between gap-4 p-6">
                <div className="flex flex-col gap-2">
                  <h3 className="text-h4 md:text-h3">{camp.title}</h3>
                  <p className="max-w-xl text-body-small text-muted-foreground">
                    {camp.description}
                  </p>
                </div>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                  <ArrowRight className="size-4 -rotate-45" />
                </span>
              </div>
              <div className="mt-auto p-1">
                <div className="relative h-56 w-full overflow-hidden rounded-lg border bg-muted md:h-64">
                  <Image
                    src={camp.image.src}
                    alt={camp.image.alt}
                    fill
                    sizes={
                      camp.wide
                        ? "(min-width: 1024px) 66vw, 100vw"
                        : "(min-width: 1024px) 33vw, 100vw"
                    }
                    queryParameters={{ updatedAt: camp.image.updatedAt }}
                    className="object-contain transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export { TrainingCamps };
