import { cn } from "cn";

interface Belief {
  title: string;
  description: string;
}

const beliefs: Belief[] = [
  {
    title: "Someone else's start line",
    description:
      "We count our wins differently: how many people we brought along, not how many we left behind.",
  },
  {
    title: "Progress compounds",
    description:
      "One person's breakthrough becomes the group's new normal. Shared progress moves faster than solo effort ever does.",
  },
  {
    title: "The pack holds the pace",
    description:
      "On the mornings your motivation doesn't show up, the community does. That's the whole trick.",
  },
];

interface CommunityPhilosophyProps {
  className?: string;
}

const CommunityPhilosophy = ({ className }: CommunityPhilosophyProps) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col gap-7">
            <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
              Community philosophy
            </p>
            <h2 className="text-h2 md:text-h1">
              Progress is better when it&apos;s{" "}
              <span className="text-yrc-accent">shared</span>
            </h2>
          </div>
          <div className="flex flex-col gap-7">
            <p className="text-body text-muted-foreground">
              Running looks like an individual sport. It isn&apos;t — not here.
              Every plan we write, every run we schedule and every challenge we
              set starts from the same idea: people go further together than
              they ever go alone.
            </p>
            <p className="text-body text-muted-foreground">
              That&apos;s what &ldquo;shared progress&rdquo; means to us. Your
              finish line matters — but so does the person finding theirs
              because you ran beside them.
            </p>
            <div className="mt-4 flex flex-col gap-8">
              {beliefs.map((belief, idx) => (
                <div
                  key={belief.title}
                  className="flex gap-6 border-t-2 border-foreground pt-6"
                >
                  <span className="text-h4 text-muted-foreground">
                    /{String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-h4">{belief.title}</h3>
                    <p className="text-body-small text-muted-foreground">
                      {belief.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { CommunityPhilosophy };
