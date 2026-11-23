import { cn } from "@/lib/utils";
import { slotDefaults, withMedia, type SiteMediaItem } from "@/lib/site-media";

import { Image } from "@/components/imagekit";
import { Reveal } from "@/components/reveal";


interface Challenge {
  heading: string;
  subheading: string;
  description: string;
  example: string;
}

const challenges: Challenge[] = [
  {
    heading: "Distance challenges",
    subheading: "How far can a month take you?",
    description:
      "Pick a monthly distance that scares you a little, then chip away at it with the rest of the pack. Big targets get smaller when hundreds of kilometers of company come with them.",
    example:
      "Think: one long month, one shared target, everyone's kilometers on the same board.",
  },
  {
    heading: "Consistency streaks",
    subheading: "Show up. Then show up again.",
    description:
      "Not faster, not longer — just there. Streak challenges reward the only training secret that actually works: weeks of unglamorous, dependable showing up.",
    example:
      "Think: a run every week for a season, whatever the weather has to say about it.",
  },
  {
    heading: "Community goals",
    subheading: "One target. Every pair of legs.",
    description:
      "Sometimes the challenge belongs to all of us: a collective distance no single runner could cover alone, reached one shared run at a time. Every kilometer counts the same.",
    example:
      "Think: the whole community's miles stacked toward a single finish line.",
  },
  {
    heading: "Event countdowns",
    subheading: "Train toward a start line together",
    description:
      "A race on the calendar changes everything. Countdown challenges turn the weeks before an event into a shared build-up — same plan, same nerves, same finish-line photo.",
    example:
      "Think: a training block that ends with all of us on the same start line.",
  },
];

interface CommunityChallengesProps {
  /** The slot's media (from /admin/media); defaults to the built-in set. */
  media?: SiteMediaItem[];
  className?: string;
}

const CommunityChallenges = ({ className, media }: CommunityChallengesProps) => {
  const cards = withMedia(challenges, media ?? slotDefaults("community.challenges"));
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="flex max-w-3xl flex-col gap-7">
          <p className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
            Community challenges
          </p>
          <h2 className="text-h2 md:text-h1">
            Pick your <span className="text-yrc-accent">challenge</span>.
          </h2>
          <p className="max-w-2xl text-body text-muted-foreground">
            Challenges are how the community turns good intentions into done
            kilometers. New ones appear throughout the season — these are the
            shapes they take.
          </p>
        </div>

        <Reveal className="yrc-stagger mt-14 flex flex-col gap-5 md:mt-20">
          {cards.map((challenge, idx) => (
            <div
              key={challenge.heading}
              className="group relative isolate min-h-72 overflow-hidden rounded-xl border border-border px-5 py-14 lg:px-12 lg:py-20"
            >
              <Image
                src={challenge.image.src}
                alt={challenge.image.alt}
                fill
                sizes="(min-width: 1280px) 1280px, 100vw"
                className="object-cover object-center grayscale transition-[filter] duration-500 hover:filter-none group-hover:filter-none active:filter-none"
              />
              <div className="absolute inset-0 z-0 bg-black/80 backdrop-blur-xs transition-all duration-300 ease-out group-hover:bg-black/55 group-hover:backdrop-blur-none" />
              <div className="relative z-10 flex flex-col gap-7 text-white/80 transition-colors duration-300 ease-out group-hover:text-white lg:flex-row">
                <div className="flex gap-1 text-h3 font-bold">
                  <span>/</span>
                  <span>{String(idx + 1).padStart(2, "0")}</span>
                </div>
                <div className="flex flex-1 flex-col gap-2.5">
                  <h3 className="text-h3 lg:text-h2">{challenge.heading}</h3>
                  <p className="text-body-small font-medium uppercase">
                    {challenge.subheading}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-body-small lg:text-body">
                    {challenge.description}
                  </p>
                  <div className="mt-2.5 overflow-hidden transition-all duration-300 ease-out lg:h-0 lg:group-hover:h-12">
                    <p className="text-body-small text-white/70 italic transition-opacity duration-300 ease-out lg:opacity-0 lg:group-hover:opacity-100">
                      {challenge.example}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
};

export { CommunityChallenges };
