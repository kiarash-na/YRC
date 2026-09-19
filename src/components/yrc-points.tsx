import { CalendarCheck, Flag, UserPlus } from "lucide-react";
import { cn } from "cn";

import { Badge } from "@/components/ui/badge";

interface EarnPath {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const earnPaths: EarnPath[] = [
  {
    icon: CalendarCheck,
    title: "Showing up",
    description:
      "The weekly runs, the early mornings, the days you came even when it rained. Presence is the foundation — it should count.",
  },
  {
    icon: Flag,
    title: "Taking on challenges",
    description:
      "Distance challenges, consistency streaks, community goals. Saying yes to something hard, and seeing it through.",
  },
  {
    icon: UserPlus,
    title: "Bringing people along",
    description:
      "Inviting a friend, pacing a first-timer, being the reason someone found their start line. Growing the pack grows your points.",
  },
];

interface YrcPointsProps {
  className?: string;
}

const YrcPoints = ({ className }: YrcPointsProps) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="rounded-xl border border-border bg-muted/40 p-8 md:p-14 lg:p-20">
          <div className="flex max-w-3xl flex-col gap-7">
            <Badge variant="outline" className="h-6 px-3">
              IN THE WORKS
            </Badge>
            <h2 className="text-h2 md:text-h1">
              YRC <span className="text-yrc-accent">POINTS</span> ARE COMING.
            </h2>
            <p className="max-w-2xl text-body text-muted-foreground">
              We&apos;re building a points system that rewards what this
              community already runs on — participation, not podiums. The
              honest status: the details are still being figured out, and
              we&apos;ll share them when they&apos;re real. What we know
              already is what will count.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {earnPaths.map((path) => (
              <div
                key={path.title}
                className="flex flex-col gap-4 rounded-xl border border-border bg-background p-6 lg:p-8"
              >
                <path.icon className="size-6 text-foreground" />
                <h3 className="text-h4">{path.title}</h3>
                <p className="text-body-small text-muted-foreground">
                  {path.description}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-10 max-w-2xl text-body-small text-muted-foreground">
            No leaderboards for the fastest. No paywalls. Just a way of saying:
            the effort you put into this community doesn&apos;t go unnoticed.
          </p>
        </div>
      </div>
    </section>
  );
};

export { YrcPoints };
