"use client";

import Link from "next/link";
import { cn } from "cn";

import { Video } from "@/components/imagekit";
import { Button } from "@/components/ui/button";
import { videoPoster } from "@/lib/imagekit";
import { TALLY_POPUP_HASH } from "@/lib/tally";

interface HeroVideo {
  src: string;
}
interface HeroButton {
  text: string;
  url: string;
  icon?: React.ReactNode;
}
interface Buttons {
  primary?: HeroButton;
  secondary?: HeroButton;
}
interface Badge {
  text: string;
  announcement?: string;
  url?: string;
}

interface HeroProps {
  heading: string;
  description: string;
  badge?: Badge;
  buttons?: Buttons;
  videoProduct?: HeroVideo;
  className?: string;
  subheading?: string;
}
type Props = Partial<HeroProps>;

const defaultProps: HeroProps = {
  badge: {
    text: "Yas Rise Community",
    url: "/community",
  },
  heading: "RUN TOGETHER.",
  subheading: "GROW TOGETHER.",
  description:
    "Weekly runs · training · outdoor adventures · good people. YRC is a running community for every pace — show up, run together, grow together.",
  buttons: {
    primary: {
      text: "JOIN THE COMMUNITY",
      url: TALLY_POPUP_HASH,
    },
    secondary: {
      text: "SEE UPCOMING RUNS",
      url: "/events",
    },
  },
  videoProduct: {
    src: "/YRC/13372516_1080_1920_30fps.mp4",
  },
};

const Hero = (props: Props) => {
  const {
    badge,
    heading,
    subheading,
    description,
    buttons,
    videoProduct,
    className,
  } = {
    ...defaultProps,
    ...props,
  };

  const poster = videoProduct ? videoPoster(videoProduct.src) : "";

  return (
    <section className={cn("relative overflow-hidden py-32", className)}>
      <div className="relative z-10 container">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            {badge && (
              <a
                href={badge.url ?? "#"}
                className="my-6 text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase hover:underline"
              >
                {badge.text}
              </a>
            )}

            <h1 className="text-h1 md:text-display">
              {heading}
              {subheading && (
                <>
                  <br />
                  <span className="text-muted-foreground">{subheading}</span>
                </>
              )}
            </h1>

            <p className="my-8 max-w-xl text-body text-muted-foreground">
              {description}
            </p>

            <div className="flex w-full flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              {buttons?.primary && (
                <Button
                  size="lg"
                  className="w-full sm:w-auto"
                  render={<a href={buttons.primary.url} />}
                  nativeButton={false}
                >
                  {buttons.primary.text}
                </Button>
              )}
              {buttons?.secondary && (
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                  render={
                    buttons.secondary.url.startsWith("/") ? (
                      <Link href={buttons.secondary.url} />
                    ) : (
                      <a href={buttons.secondary.url} />
                    )
                  }
                  nativeButton={false}
                >
                  {buttons.secondary.text}
                </Button>
              )}
            </div>
          </div>

          <div className="relative">
            {videoProduct && (
              <div
                className="relative aspect-3/4 w-full overflow-hidden rounded-xl border border-border bg-muted"
                style={{
                  backgroundImage: `url(${poster})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <Video
                  src={videoProduct.src}
                  poster={poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  controls={false}
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export { Hero };
