import Link from "next/link";
import { cn } from "@/lib/utils";

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
        // Closing band: centred, on the page background, with the accent
        // rule above the content.
        "py-24 md:py-36",
        className,
      )}
    >
      <div className="container">
        <Reveal className="mx-auto flex max-w-5xl flex-col items-center gap-5 text-center lg:gap-7">
          <span aria-hidden="true" className="mb-2 h-1 w-16 bg-yrc-accent md:mb-4 md:w-24" />
          <p className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
            Yas Rise Community
          </p>
          <h2 className="text-h1 font-bold md:text-display xl:text-hero">
            RUN WITH US.
          </h2>
          <p className="max-w-xl text-balance text-body text-muted-foreground md:text-h4 md:font-normal">
            Find your people, choose your challenge and keep moving forward.
          </p>
          <div className="mt-3 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
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
