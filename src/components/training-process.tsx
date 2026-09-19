import { ChevronRight } from "lucide-react";
import { cn } from "cn";

import { Image } from "@/components/imagekit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const image = {
  src: "/YRC/24.png",
  alt: "YRC runner pushing through a training session",
  updatedAt: "1789773516640",
};

const steps = [
  "Understand your goal — start with where you are and where you want to go.",
  "Build your plan — follow a structured approach that fits your training and goals.",
  "Train with purpose — build consistency through focused training and shared accountability.",
  "Keep moving forward — reflect, adapt and continue progressing with the community.",
];

interface TrainingProcessProps {
  className?: string;
}

const TrainingProcess = ({ className }: TrainingProcessProps) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl border bg-muted">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              queryParameters={{ updatedAt: image.updatedAt }}
              className="object-cover"
            />
          </div>

          <div className="flex flex-col items-start gap-6">
            <Badge
              variant="outline"
              className="h-6 px-3 text-caption font-bold tracking-[0.3em] uppercase"
            >
              How It Works
            </Badge>
            <h2 className="text-h2 text-balance md:text-h1">
              Training <span className="text-yrc-accent">Process</span>
            </h2>
            <p className="max-w-md text-body-small text-pretty text-muted-foreground md:text-body">
              How the YRC training experience works — a simple path from
              intention to progress, taken step by step and together.
            </p>
            <Button
              size="lg"
              variant="outline"
              className="uppercase"
              render={<a href="#courses" />}
              nativeButton={false}
            >
              Explore Courses
              <ChevronRight className="size-4" />
            </Button>
            <ul className="mt-2 space-y-3 text-body-small">
              {steps.map((step) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="text-muted-foreground">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export { TrainingProcess };
