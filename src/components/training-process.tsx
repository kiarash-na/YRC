import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { slotDefaults, type SiteMediaItem } from "@/lib/site-media";

import { AmbientVideo } from "@/components/ambient-video";
import { Button } from "@/components/ui/button";

const steps = [
  "Understand your goal — start with where you are and where you want to go.",
  "Build your plan — follow a structured approach that fits your training and goals.",
  "Train with purpose — build consistency through focused training and shared accountability.",
  "Keep moving forward — reflect, adapt and continue progressing with the community.",
];

interface TrainingProcessProps {
  /** The slot's media (from /admin/media); defaults to the built-in set. */
  media?: SiteMediaItem[];
  className?: string;
}

const TrainingProcess = ({ className, media }: TrainingProcessProps) => {
  // Balance-board drills at a YRC Munich session (portrait clip); its still
  // is what reduced-motion visitors keep.
  const [clip] = media ?? slotDefaults("events.training");
  const poster = { src: clip.poster ?? clip.src, alt: clip.alt, updatedAt: clip.updatedAt };
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div className="relative mx-auto aspect-3/4 w-full max-w-lg overflow-hidden rounded-xl border bg-muted lg:max-w-none">
            <AmbientVideo
              src={clip.src}
              poster={poster}
              sizes="(min-width: 1024px) 50vw, 100vw"
              label="training drills video"
              mediaClassName="object-[50%_60%]"
            />
          </div>

          <div className="flex flex-col items-start gap-6">
            <p className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
              How It Works
            </p>
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
