import { ArrowUpRight } from "lucide-react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
interface NavItem {
  name: string;
  href: string;
}

interface SocialItem {
  name: string;
  href: string;
}

interface FooterProps {
  heading?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  navigation?: NavItem[];
  social?: SocialItem[];
  legal?: NavItem[];
  brandName?: string;
  className?: string;
}

const Footer = ({
  heading = "RUN WITH US",
  description = "Weekly runs, training sessions and outdoor adventures in Munich. All paces welcome — just show up.",
  ctaText = "JOIN YRC",
  ctaHref = "#join",
  navigation = [
    { name: "Runs & Events", href: "#runs" },
    { name: "Community", href: "#community" },
    { name: "About", href: "#about" },
    { name: "JOIN YRC", href: "#join" },
  ],
  social = [
    { name: "Instagram", href: "#" },
    { name: "Strava", href: "#" },
  ],
  legal = [],
  brandName = "YRC",
  className,
}: FooterProps) => {
  return (
    <footer
      className={cn(
        "flex flex-col items-center gap-14 pt-28 lg:pt-32",
        className,
      )}
    >
      <div className="container space-y-3 text-center">
        <h2 className="text-h3 tracking-tight md:text-h2 lg:text-h1">
          {heading}
        </h2>
        <p className="mx-auto max-w-xl leading-snug text-balance text-muted-foreground">
          {description}
        </p>
        <div>
          <Button
            size="lg"
            className="mt-4"
            render={<a href={ctaHref} />}
            nativeButton={false}
          >
            {ctaText}
          </Button>
        </div>
      </div>

      <nav className="container flex flex-col items-center gap-4">
        <ul className="flex flex-wrap items-center justify-center gap-6">
          {navigation.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                className="font-medium transition-opacity hover:opacity-75"
              >
                {item.name}
              </a>
            </li>
          ))}
          {social.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                className="flex items-center gap-0.5 font-medium transition-opacity hover:opacity-75"
              >
                {item.name} <ArrowUpRight className="size-4" />
              </a>
            </li>
          ))}
        </ul>
        {legal.length > 0 && (
          <ul className="flex flex-wrap items-center justify-center gap-6">
            {legal.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  className="text-body-small text-muted-foreground transition-opacity hover:opacity-75"
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </nav>

      <div
        className="mt-10 w-full overflow-hidden text-primary md:mt-14 lg:mt-20"
        aria-label={brandName}
      >
        <div className="text-center text-[clamp(8rem,32vw,28rem)] leading-[0.75] font-bold tracking-tight select-none [mask-image:linear-gradient(to_bottom,black_55%,transparent)]">
          {brandName}
        </div>
      </div>
    </footer>
  );
};

export { Footer };
