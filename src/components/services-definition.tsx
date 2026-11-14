import { Check, X } from "lucide-react";
import { cn } from "cn";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Service {
  title: string;
  description: string;
}

// TODO(user): these one-line descriptions are draft copy in the site's voice —
// review and replace with final text before launch.
const does: Service[] = [
  {
    title: "Weekly community runs",
    description: "The heartbeat of the week — show up and run together.",
  },
  {
    title: "Special weekend long runs",
    description: "Longer miles on the weekend, with company and a plan.",
  },
  {
    title: "Technical running drills",
    description: "Form, technique and efficiency work that makes running feel easier.",
  },
  {
    title: "Community swimming",
    description: "Cross-training in the water with the same people beside you.",
  },
  {
    title: "Weekend trail runs",
    description: "Off-road escapes to the trails outside the city.",
  },
  {
    title: "Races, training camps & international trips",
    description: "Start lines abroad, shared camps and trips worth remembering.",
  },
];

const doesnt: Service[] = [
  {
    title: "Not a racing team.",
    description:
      "No selections, no pace requirements, no podiums for speed — the board rewards showing up, not finishing first.",
  },
  {
    title: "Not a coaching business.",
    description:
      "No paid training plans or one-on-one coaching — sessions and camps are community-organized and volunteer-led.",
  },
  {
    title: "No paywalls.",
    description:
      "Weekly community runs are free; you only ever cover your own race entry or a travel share on trips.",
  },
  {
    title: "Not a gym.",
    description:
      "No indoor facility, no machines, no equipment rental — we meet at cafés, piers, tracks, and trailheads.",
  },
];

interface ServicesDefinitionProps {
  className?: string;
}

const ServicesDefinition = ({ className }: ServicesDefinitionProps) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="flex max-w-3xl flex-col gap-7">
          <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
            Services
          </p>
          <h2 className="text-h2 md:text-h1">
            What YRC does. What YRC doesn&rsquo;t.
          </h2>
          <p className="max-w-2xl text-body text-muted-foreground">
            A community works best when everyone knows what they&rsquo;re
            showing up to — so here it is, plainly.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:mt-20 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-h4 md:text-h3">
                What YRC does
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col divide-y divide-border">
                {does.map((service) => (
                  <li key={service.title} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                    <Check className="mt-1 size-4 shrink-0 text-yrc-accent" />
                    <div className="flex flex-col gap-1">
                      <h3 className="text-body-small font-semibold">
                        {service.title}
                      </h3>
                      <p className="text-body-small text-muted-foreground">
                        {service.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-h4 md:text-h3">
                What YRC doesn&rsquo;t
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col divide-y divide-border">
                {doesnt.map((item) => (
                  <li key={item.title} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                    <X className="mt-1 size-4 shrink-0 text-muted-foreground" />
                    <div className="flex flex-col gap-1">
                      <h3 className="text-body-small font-semibold">
                        {item.title}
                      </h3>
                      <p className="text-body-small text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export { ServicesDefinition };
