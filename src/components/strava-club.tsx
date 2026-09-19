import { Footprints, Heart, Users } from "lucide-react";
import { FaStrava } from "react-icons/fa6";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GridPattern } from "@/components/ui/grid-pattern";
import { YRC_STRAVA_CLUB_URL } from "@/lib/strava";

const clubHighlights = [
  {
    icon: Users,
    label: "The whole pack, one feed",
  },
  {
    icon: Footprints,
    label: "Every run counts",
  },
  {
    icon: Heart,
    label: "Kudos guaranteed",
  },
];

const clubActions = [
  {
    name: "Follow the club",
    description: "See what the pack is up to",
  },
  {
    name: "Log your miles",
    description: "Your runs, on the shared board",
  },
  {
    name: "Cheer each other on",
    description: "Kudos are the currency here",
  },
];

interface StravaClubProps {
  className?: string;
}

const StravaClub = ({ className }: StravaClubProps) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="flex flex-col items-center">
          <p className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
            Strava Club
          </p>
          <h2 className="mt-4 text-h3 text-foreground md:text-center md:text-h1">
            Find us on <span className="text-yrc-accent">Strava</span>
          </h2>
          <p className="mt-4 max-w-2xl text-body text-muted-foreground md:text-center">
            The runs don&apos;t end when everyone goes home. Follow the YRC
            club on Strava to keep up with the pack between meetups — routes,
            streaks, kudos and all.
          </p>

          <div className="mx-auto mt-10 flex w-full max-w-2xl flex-col items-center md:mt-14">
            <Card className="relative flex w-full flex-col items-start gap-6 overflow-hidden rounded-xl border border-border p-8 shadow-lg md:flex-row lg:items-center">
              <div className="pointer-events-none absolute right-0 bottom-0 z-0 h-2/3 w-2/3">
                <GridPattern
                  className="h-full w-full"
                  style={{
                    maskImage:
                      "radial-gradient(circle at 100% 100%, black 60%, transparent 100%)",
                    WebkitMaskImage:
                      "radial-gradient(circle at 100% 100%, black 60%, transparent 100%)",
                    opacity: 0.4,
                  }}
                />
              </div>
              <div className="z-10 flex shrink-0 flex-col items-start">
                <a
                  href={YRC_STRAVA_CLUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YRC on Strava"
                >
                  <FaStrava className="mb-2 size-16 text-foreground" />
                </a>
                <span className="text-h4 text-foreground">
                  Yas Rise Community
                </span>
                <a
                  href={YRC_STRAVA_CLUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-body-small text-muted-foreground underline hover:text-foreground"
                >
                  strava.com/clubs
                </a>
              </div>
              <div className="z-10 flex flex-1 flex-col items-start">
                <p className="mb-4 text-body-small text-muted-foreground">
                  Join the club to follow along, share your own miles and see
                  how the community is moving — every pace, every week.
                </p>
                <div className="flex flex-col gap-3 md:gap-4">
                  {clubHighlights.map((highlight) => (
                    <div
                      key={highlight.label}
                      className="flex items-center gap-2"
                    >
                      <highlight.icon className="size-4 text-muted-foreground" />
                      <span className="text-body-small font-semibold text-foreground">
                        {highlight.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Button
              size="lg"
              className="mt-8 w-full sm:w-auto"
              render={
                <a
                  href={YRC_STRAVA_CLUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              nativeButton={false}
            >
              JOIN THE CLUB ON STRAVA
            </Button>
          </div>

          <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
            {clubActions.map((action) => (
              <a
                key={action.name}
                href={YRC_STRAVA_CLUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-background p-4 text-center transition-all hover:shadow-md"
              >
                <span className="text-body-small font-medium text-foreground">
                  {action.name}
                </span>
                <span className="text-caption text-muted-foreground">
                  {action.description}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { StravaClub };
