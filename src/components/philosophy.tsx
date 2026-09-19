import { ArrowRight, Footprints, NotebookPen, SportShoe } from "lucide-react";
import { cn } from "cn";

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
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="flex max-w-4xl flex-col gap-7">
          <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
            What we don&rsquo;t sell
          </p>
          <h2 className="text-h2 md:text-h1">
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
            className="inline-flex w-fit items-center gap-1 font-medium text-primary underline underline-offset-4 transition-opacity hover:opacity-75"
          >
            More about YRC <ArrowRight className="size-4" />
          </a>
        </div>

        <div className="mt-14 grid gap-10 sm:grid-cols-2 md:mt-20 lg:grid-cols-3">
          {beliefs.map((belief) => (
            <div key={belief.title} className="flex flex-col gap-4">
              <belief.icon className="size-6 text-foreground" />
              <h3 className="text-h4 md:text-h3">{belief.title}</h3>
              <p className="text-body-small text-muted-foreground">
                {belief.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Philosophy };
