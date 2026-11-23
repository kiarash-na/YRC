"use client";

import { cn } from "@/lib/utils";

import { Image } from "@/components/imagekit";
import { slotDefaults, type SiteMediaItem } from "@/lib/site-media";
import { lqip } from "@/lib/imagekit";


interface CommunityHeroProps {
  /** The slot's image (from /admin/media); defaults to the built-in one. */
  media?: SiteMediaItem[];
  className?: string;
}

const CommunityHero = ({ className, media }: CommunityHeroProps) => {
  const heroImage = (media ?? slotDefaults("community.hero"))[0];
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="flex max-w-4xl flex-col gap-7">
          <p className="yrc-hero-in text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
            Yas Rise Community
          </p>
          <h1 style={{ animationDelay: "80ms" }} className="yrc-hero-in text-h1 md:text-display">
            EVERY <span className="text-yrc-accent">PACE</span>.
            <br />
            <span className="text-muted-foreground">ONE PACK.</span>
          </h1>
          <p style={{ animationDelay: "160ms" }} className="yrc-hero-in max-w-2xl text-body text-muted-foreground">
            YRC — Yas Rise Community — is a running and endurance community
            where nobody runs alone. First kilometers, comeback seasons,
            hundredth long runs: if you keep showing up, you belong here.
          </p>
        </div>

        <div style={{ animationDelay: "260ms" }} className="yrc-hero-in relative mt-14 aspect-3/2 w-full overflow-hidden rounded-xl border border-border bg-muted md:mt-20 md:aspect-21/9">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            fill
            priority
            sizes="(min-width: 1280px) 1280px, 100vw"
            className="yrc-drift object-cover object-center grayscale transition-[filter] duration-500 hover:filter-none active:filter-none"
            queryParameters={
              heroImage.updatedAt ? { updatedAt: heroImage.updatedAt } : undefined
            }
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

export { CommunityHero };
