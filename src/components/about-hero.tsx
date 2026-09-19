"use client";

import { cn } from "cn";

import { Image } from "@/components/imagekit";
import { lqip } from "@/lib/imagekit";

const heroImage = {
  src: "/YRC/45.png",
  alt: "Open landscape on a YRC trail run",
  updatedAt: "1789773517855",
};

interface AboutHeroProps {
  className?: string;
}

const AboutHero = ({ className }: AboutHeroProps) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="flex max-w-4xl flex-col gap-7">
          <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
            About Yas Rise
          </p>
          <h1 className="text-h1 md:text-display">
            WE&apos;RE IN IT FOR THE{" "}
            <span className="text-yrc-accent">JOURNEY</span>.
            <br />
            <span className="text-muted-foreground">
              NOT JUST THE FINISH.
            </span>
          </h1>
          <p className="max-w-2xl text-body text-muted-foreground">
            YRC — Yas Rise Community — is a running and endurance community
            built on one belief: the journey matters as much as the finish
            line. This is who we are, why we exist and what keeps us moving.
          </p>
        </div>

        <div className="relative mt-14 aspect-3/2 w-full overflow-hidden rounded-xl border border-border bg-muted md:mt-20 md:aspect-21/9">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            fill
            priority
            sizes="(min-width: 1280px) 1280px, 100vw"
            queryParameters={{ updatedAt: heroImage.updatedAt }}
            className="object-contain grayscale"
            style={{
              backgroundImage: `url(${lqip(heroImage.src, heroImage.updatedAt)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            onLoad={(e) => {
              e.currentTarget.style.backgroundImage = "none";
            }}
          />
        </div>
      </div>
    </section>
  );
};

export { AboutHero };
