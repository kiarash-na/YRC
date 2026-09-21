import {
  CalendarCheck,
  Flag,
  Footprints,
  Globe,
  HeartHandshake,
  Sprout,
} from "lucide-react";
import { cn } from "cn";

interface Value {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const values: Value[] = [
  {
    icon: CalendarCheck,
    title: "Show up",
    description:
      "Consistency beats intensity. The hardest step is the one out the door — we make it easier to take.",
  },
  {
    icon: Footprints,
    title: "Every pace counts",
    description:
      "First 5K or fiftieth marathon — nobody here is too slow, too new or too late to belong.",
  },
  {
    icon: HeartHandshake,
    title: "Keep it human",
    description:
      "We're a community first and a training plan second. People before personal bests.",
  },
  {
    icon: Sprout,
    title: "Grow together",
    description:
      "We share what we learn, celebrate each other's wins and pull each other through the hard weeks.",
  },
  {
    icon: Globe,
    title: "Explore further",
    description:
      "From city streets to start lines abroad, we keep finding new places worth running toward.",
  },
  {
    icon: Flag,
    title: "Finish together",
    description:
      "Nobody gets left behind — on the course or off it. The run ends when everyone is home.",
  },
];

interface OurValuesProps {
  className?: string;
}

const OurValues = ({ className }: OurValuesProps) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="flex max-w-3xl flex-col gap-7">
          <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
            Our values
          </p>
          <h2 className="text-h2 md:text-h1">How we move</h2>
          <p className="max-w-2xl text-body text-muted-foreground">
            Values are easy to write on a wall. These six are the ones the
            community actually runs on — every week, at every pace.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 md:mt-20 lg:grid-cols-3">
          {values.map((value) => (
            <div
              key={value.title}
              className="flex flex-col gap-4 rounded-xl border border-border p-6 lg:p-8"
            >
              <value.icon className="size-6 text-foreground" />
              <h3 className="text-h4">{value.title}</h3>
              <p className="text-body-small text-muted-foreground">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { OurValues };
