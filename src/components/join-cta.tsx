import Link from "next/link";
import { cn } from "cn";

import { Reveal } from "@/components/reveal";
import { JoinYrcButton } from "@/components/join-yrc-button";
import { Button } from "@/components/ui/button";

interface JoinCtaProps {
  className?: string;
}

const JoinCta = ({ className }: JoinCtaProps) => {
  return (
    <section
      className={cn(
        // Dark closing band — mirrors the hero so the page ends on the
        // same note it opens with.
        "dark bg-background py-24 text-foreground md:py-36",
        className,
      )}
    >
      <div className="container">
        <Reveal className="flex max-w-5xl flex-col gap-5 border-l-4 border-yrc-accent pl-6 md:pl-10 lg:gap-7">
          <p className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
            Yas Rise Community
          </p>
          <h2 className="text-h1 font-bold md:text-display xl:text-hero">
            RUN WITH US.
          </h2>
          <p className="max-w-xl text-body text-muted-foreground md:text-h4 md:font-normal">
            Find your people, choose your challenge and keep moving forward.
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <JoinYrcButton className="h-12 w-full bg-yrc-accent px-7 tracking-wider text-yrc-accent-foreground hover:bg-yrc-accent/85 sm:w-auto">
              JOIN YRC
            </JoinYrcButton>
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-full px-7 tracking-wider sm:w-auto"
              render={<Link href="/events" />}
              nativeButton={false}
            >
              EXPLORE EVENTS
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export { JoinCta };
