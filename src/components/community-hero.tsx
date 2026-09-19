"use client";

import { cn } from "cn";

import { buildSrc, Image } from "@/components/imagekit";

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? "";

const lqip = (src: string) =>
  urlEndpoint
    ? buildSrc({
        src,
        urlEndpoint,
        transformation: [{ quality: 10, blur: 90 }],
      })
    : "";

const heroImage = {
  src: "/YRC/36.png",
  alt: "YRC community runners moving together as a pack",
};

interface CommunityHeroProps {
  className?: string;
}

const CommunityHero = ({ className }: CommunityHeroProps) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="flex max-w-4xl flex-col gap-7">
          <p className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
            Yas Rise Community
          </p>
          <h1 className="text-h1 md:text-display">
            EVERY <span className="text-yrc-accent">PACE</span>.
            <br />
            <span className="text-muted-foreground">ONE PACK.</span>
          </h1>
          <p className="max-w-2xl text-body text-muted-foreground">
            YRC — Yas Rise Community — is a running and endurance community
            where nobody runs alone. First kilometers, comeback seasons,
            hundredth long runs: if you keep showing up, you belong here.
          </p>
        </div>

        <div className="relative mt-14 aspect-3/2 w-full overflow-hidden rounded-xl border border-border bg-muted md:mt-20 md:aspect-21/9">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            fill
            priority
            sizes="(min-width: 1280px) 1280px, 100vw"
            className="object-cover object-center grayscale"
            style={{
              backgroundImage: `url(${lqip(heroImage.src)})`,
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
