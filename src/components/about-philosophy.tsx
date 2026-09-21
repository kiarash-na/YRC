import { Compass, Route, Sprout, Users } from "lucide-react";
import { cn } from "cn";

interface Principle {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const principles: Principle[] = [
  {
    icon: Route,
    title: "The journey is the point",
    description:
      "Finish lines are moments. The months of mornings, the people and the places are the story. We build for the story.",
  },
  {
    icon: Users,
    title: "Together beats alone",
    description:
      "Motivation fades; community doesn't. Everything we create is designed to be shared.",
  },
  {
    icon: Sprout,
    title: "Growth over performance",
    description:
      "Pace is a detail. Progress — physical, mental, personal — is the measure that matters.",
  },
  {
    icon: Compass,
    title: "Adventure is a mindset",
    description:
      "New streets, new trails, new countries. Endurance is our excuse to keep exploring.",
  },
];

interface AboutPhilosophyProps {
  className?: string;
}

const AboutPhilosophy = ({ className }: AboutPhilosophyProps) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="flex max-w-3xl flex-col gap-7">
          <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
            Yas Rise philosophy
          </p>
          <h2 className="text-h2 md:text-h1">
            What we <span className="text-yrc-accent">believe</span>
          </h2>
          <p className="max-w-2xl text-body text-muted-foreground">
            Four ideas sit underneath everything YRC does — every run, every
            program, every trip. They aren&rsquo;t slogans. They&rsquo;re how
            decisions get made.
          </p>
        </div>

        <div className="mt-14 grid gap-10 sm:grid-cols-2 md:mt-20 lg:grid-cols-4">
          {principles.map((principle) => (
            <div
              key={principle.title}
              className="flex flex-col gap-4 border-t-2 border-foreground pt-6"
            >
              <principle.icon className="size-6 text-foreground" />
              <h3 className="text-h4">{principle.title}</h3>
              <p className="text-body-small text-muted-foreground">
                {principle.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { AboutPhilosophy };
