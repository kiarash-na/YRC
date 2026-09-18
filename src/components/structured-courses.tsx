import { Route } from "lucide-react";
import { cn } from "cn";

import { Badge } from "@/components/ui/badge";

interface CoursePrinciple {
  index: string;
  title: string;
  description: string;
}

const principles: CoursePrinciple[] = [
  {
    index: "01",
    title: "Train With Purpose",
    description:
      "Every course follows a clear structure — sessions built with intent, so each week of training has a direction.",
  },
  {
    index: "02",
    title: "Build Consistency",
    description:
      "Progress is built on showing up. Structured weeks and shared sessions make consistency easier to keep, whatever your starting point.",
  },
  {
    index: "03",
    title: "Move Toward Your Goal",
    description:
      "Courses build progressively toward what you are training for, with guidance and a community training beside you.",
  },
];

interface StructuredCoursesProps {
  className?: string;
}

const StructuredCourses = ({ className }: StructuredCoursesProps) => {
  return (
    <section id="courses" className={cn("py-32", className)}>
      <div className="container">
        <div className="flex max-w-3xl flex-col gap-5">
          <Badge
            variant="outline"
            className="flex h-6 w-fit items-center gap-1.5 px-3 text-caption font-bold tracking-[0.3em] uppercase"
          >
            <Route className="size-3.5" />
            Programs
          </Badge>
          <h2 className="text-h2 md:text-h1">Structured Running Courses</h2>
          <p className="text-body-small text-muted-foreground md:text-body">
            Structured training programs designed to help runners train with
            purpose, build consistency and move toward their goals with a
            clear path.
          </p>
        </div>

        <div className="mt-14 border-t border-border">
          {principles.map((principle) => (
            <div
              key={principle.index}
              className="grid gap-3 border-b border-border py-8 md:grid-cols-2 md:items-baseline md:gap-16 md:py-10"
            >
              <div className="flex items-baseline gap-5">
                <span className="font-mono text-sm text-muted-foreground">
                  {principle.index}
                </span>
                <h3 className="text-h3">{principle.title}</h3>
              </div>
              <p className="max-w-xl text-body-small text-muted-foreground md:text-body">
                {principle.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { StructuredCourses };
