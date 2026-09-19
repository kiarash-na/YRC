import { cn } from "cn";

import { JoinYrcButton } from "@/components/join-yrc-button";
import { Button } from "@/components/ui/button";

interface JoinCtaProps {
  className?: string;
}

const JoinCta = ({ className }: JoinCtaProps) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="flex max-w-5xl flex-col gap-4 border-l-4 border-yrc-accent pl-8 lg:gap-6">
          <p className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
            Yas Rise Community
          </p>
          <h2 className="text-h1 md:text-display">RUN WITH US.</h2>
          <p className="max-w-xl text-body text-muted-foreground">
            Find your people, choose your challenge and keep moving forward.
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <JoinYrcButton className="w-full sm:w-auto">JOIN YRC</JoinYrcButton>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              render={<a href="/events" />}
              nativeButton={false}
            >
              EXPLORE EVENTS
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export { JoinCta };
