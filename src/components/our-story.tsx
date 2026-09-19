import { cn } from "cn";

import { Image } from "@/components/imagekit";

const portrait = {
  src: "/YRC/24.png",
  alt: "YRC runner pushing through a training session",
  updatedAt: "1789773516640",
};

const chapters = [
  {
    index: "01",
    title: "Weekly community runs",
    description: "The heartbeat of YRC — same people, same roads, week after week.",
  },
  {
    index: "02",
    title: "Training & camps",
    description: "Structure and shared effort that turn a habit into a journey.",
  },
  {
    index: "03",
    title: "International races & trips",
    description: "Start lines abroad, chased down together.",
  },
];

interface OurStoryProps {
  className?: string;
}

const OurStory = ({ className }: OurStoryProps) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-7">
            <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
              Our story
            </p>
            <h2 className="text-h2 md:text-h1">
              It started the way most good runs do — with a few people and a
              reason to show up.
            </h2>
            <div className="flex max-w-2xl flex-col gap-5 text-body text-muted-foreground">
              <p>
                Yas Rise began with a handful of runners who kept meeting at
                the same early hour, on the same streets, chasing nothing more
                than the feeling of moving together. There was no program and
                no plan — just the quiet understanding that running alone is a
                habit, but running together is a life.
              </p>
              <p>
                As the group grew, so did the ambition. Weekly runs turned
                into structured training, training turned into race entries,
                and race entries turned into journeys across borders. What
                never changed was the reason: people go further — and grow
                faster — when they go together.
              </p>
              <p>
                Today YRC is an ecosystem built around endurance sports:
                community runs, training programs, camps and international
                races. Strip it all away and the core is the same as that
                first morning — show up, run together, grow together.
              </p>
            </div>
          </div>

          <div className="relative aspect-3/4 w-full overflow-hidden rounded-xl border bg-muted lg:mt-16">
            <Image
              src={portrait.src}
              alt={portrait.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              queryParameters={{ updatedAt: portrait.updatedAt }}
              className="object-contain grayscale"
            />
          </div>
        </div>

        <div className="mt-14 grid gap-8 border-t border-border pt-10 sm:grid-cols-3 md:mt-20 md:pt-14">
          {chapters.map((chapter) => (
            <div key={chapter.index} className="flex flex-col gap-3">
              <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground">
                {chapter.index}
              </p>
              <h3 className="text-h4">{chapter.title}</h3>
              <p className="text-body-small text-muted-foreground">
                {chapter.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { OurStory };
