import { ArrowUpRight } from "lucide-react";
import { cn } from "cn";

import { JoinYrcButton } from "@/components/join-yrc-button";
import { TALLY_POPUP_HASH } from "@/lib/tally";
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
  navigation?: NavItem[];
  social?: SocialItem[];
  legal?: NavItem[];
  brandName?: string;
  className?: string;
}

const Footer = ({
  heading = "JOIN THE COMMUNITY",
  description = "Weekly runs, training sessions and outdoor adventures. All paces welcome — just show up.",
  ctaText = "JOIN YRC",
  navigation = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    { name: "Community", href: "/community" },
    { name: "About", href: "/about" },
    { name: "Blogs", href: "/blogs" },
    { name: "JOIN YRC", href: TALLY_POPUP_HASH },
  ],
  social = [
    { name: "Instagram", href: "#" },
    { name: "Strava", href: "#" },
  ],
  legal = [],
  brandName = "YASRISE",
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
        <h2 className="text-h2 md:text-h1">
          {heading}
        </h2>
        <p className="mx-auto max-w-xl leading-snug text-balance text-muted-foreground">
          {description}
        </p>
        <div>
          <JoinYrcButton className="mt-4">{ctaText}</JoinYrcButton>
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
        <div className="text-center text-[clamp(3.5rem,17vw,15rem)] leading-[0.85] font-bold tracking-tight select-none [mask-image:linear-gradient(to_bottom,black_55%,transparent)]">
          {brandName}
        </div>
      </div>
    </footer>
  );
};

export { Footer };
