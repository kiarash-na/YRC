import { cn } from "@/lib/utils";
import { slotDefaults, type SiteMediaItem } from "@/lib/site-media";

import { Image } from "@/components/imagekit";
import { Reveal } from "@/components/reveal";

interface Coach {
  name: string;
  role: string;
  bio: string[];
}

const coaches: Coach[] = [
  {
    name: "Reza",
    role: "Running, Marathon, Half Marathon & Functional Training for Runners",
    bio: [
      "Reza focuses on Running, Marathon, Half Marathon, and Functional Training for Runners. His primary focus is helping runners build the physical and mental readiness they need to perform at their best. His approach combines a structured training plan with strength development, endurance, and functional exercises.",
      "He believes that every runner is different and should have a training plan based on their goals, level of readiness, and physical capacity — a path that leads to a stronger body and more sustainable performance.",
    ],
  },
  {
    name: "Kambiz",
    role: "Hybrid Endurance & Strength Coach (Online)",
    bio: [
      "Kambiz is a Hybrid Endurance and Strength Coach with extensive experience in endurance sports and competitions. He has participated in more than 150 races, ranging from Trail, Ultra, and SwimRun to Ironman.",
      "Today, as an Online Endurance Coach at TrainingPeaks, he uses his experience and knowledge to design personalized training programs for Running, Road Racing, and Marathon.",
      "His experience has taught him that running is not simply about reaching the finish line; it is a journey toward building discipline, developing structure, and discovering your own abilities.",
    ],
  },
];

interface TeamProps {
  /** The slot's media (from /admin/media); defaults to the built-in set. */
  media?: SiteMediaItem[];
  className?: string;
}

const Team = ({ className, media }: TeamProps) => {
  const portraits = media ?? slotDefaults("about.coaches");
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="flex max-w-3xl flex-col gap-7">
          <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
            The coaches
          </p>
          <h2 className="text-h2 md:text-h1">The people behind the pace.</h2>
          <p className="max-w-2xl text-body text-muted-foreground">
            Structure doesn&rsquo;t come from an app — it comes from people
            who&rsquo;ve run the miles themselves. Meet the coaches who turn
            showing up into getting better.
          </p>
        </div>

        <Reveal className="yrc-stagger mt-14 grid gap-4 sm:grid-cols-2 md:mt-20">
          {coaches.map((coach, index) => (
            <article
              key={coach.name}
              className="flex flex-col gap-5 rounded-xl border border-border p-6 lg:p-8"
            >
              <div className="relative aspect-4/5 w-full overflow-hidden rounded-lg bg-muted">
                <Image
                  src={(portraits[index] ?? portraits[0]).src}
                  alt={(portraits[index] ?? portraits[0]).alt}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover object-center grayscale transition-[filter] duration-500 hover:filter-none active:filter-none"
                />
              </div>
              <h3 className="text-h4 md:text-h3">{coach.name}</h3>
              <p className="text-body-small font-semibold">{coach.role}</p>
              <div className="flex flex-col gap-4 text-body-small text-muted-foreground">
                {coach.bio.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
};

export { Team };
