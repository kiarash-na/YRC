import { ClipboardList } from "lucide-react";
import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CourseDetail } from "@/data/events";

interface CourseDetailsProps {
  details: CourseDetail[];
  className?: string;
}

const CourseDetails = ({ details, className }: CourseDetailsProps) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="flex max-w-3xl flex-col gap-5">
          <Badge
            variant="outline"
            className="flex h-6 w-fit items-center gap-1.5 px-3 text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase"
          >
            <ClipboardList className="size-3.5" />
            Programs
          </Badge>
          <h2 className="text-h2 md:text-h1">Course Details</h2>
          <p className="text-body-small text-muted-foreground md:text-body">
            Structured training with a clear path. YRC running programs are
            built around structured preparation, consistency and progression.
            Program format, duration and participation details can vary
            depending on the course.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {details.map((detail) => (
            <Card key={detail.title} className="gap-0">
              <CardHeader>
                <CardDescription className="text-caption font-medium tracking-[0.2em] uppercase">
                  {detail.title}
                </CardDescription>
                <CardTitle className="text-h3 text-balance">
                  {detail.value}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-body-small text-muted-foreground">
                  {detail.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-body-small text-muted-foreground">
          Exact details are announced with each program.
        </p>
      </div>
    </section>
  );
};

export { CourseDetails };
