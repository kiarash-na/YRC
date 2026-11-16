import { ArrowRight, Footprints, NotebookPen, SportShoe } from "lucide-react";
import { cn } from "@/lib/utils";

import { Reveal } from "@/components/reveal";

interface Belief {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const beliefs: Belief[] = [
  {
    icon: SportShoe,
    title: "Not just race registration",
    description:
      "A start number is the beginning, not the product. Every event we select is chosen for everything around it.",
  },
  {
    icon: Footprints,
    title: "Not just trips",
    description:
      "Travel is the setting. Preparation, shared purpose and meaningful time together are the point.",
  },
  {
    icon: NotebookPen,
    title: "Not just training programs",
    description:
      "Plans on paper don't move people. Community, consistency and continuous growth do.",
  },
];

interface PhilosophyProps {
  className?: string;
}

const Philosophy = ({ className }: PhilosophyProps) => {
  return (
    <section
      className={cn(
        // Dark band — the "what we don't sell" statement gets its own beat.
        "dark bg-background py-24 text-foreground md:py-32",
        className,
      )}
    >
      <div className="container">
        <Reveal className="flex max-w-5xl flex-col gap-7">
          <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
            What we don&rsquo;t sell
          </p>
          <h2 className="text-h2 md:text-h1 lg:text-display">
            We build the experience — from the first step to the starting
            line.
          </h2>
          <p className="max-w-2xl text-body text-muted-foreground">
            Race entries, trips and training plans are easy to find. What
            matters is everything around them — the people, the preparation,
            the journey.
          </p>
          <a
            href="/about"
            className="group inline-flex w-fit items-center gap-1 font-medium text-foreground underline underline-offset-4 transition-colors hover:text-yrc-accent"
          >
            More about YRC{" "}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </a>
        </Reveal>

        <div className="mt-16 grid gap-10 sm:grid-cols-2 md:mt-24 lg:grid-cols-3 lg:gap-8">
          {beliefs.map((belief, index) => (
            <Reveal key={belief.title} delay={index * 120}>
              <div className="flex flex-col gap-4 border-t border-border pt-8">
                <belief.icon className="size-6 text-yrc-accent" />
                <h3 className="text-h4 md:text-h3">{belief.title}</h3>
                <p className="text-body-small text-muted-foreground">
                  {belief.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Philosophy };
