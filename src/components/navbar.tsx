"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "cn";

import { Image } from "@/components/imagekit";
import { Button } from "@/components/ui/button";

interface MenuItem {
  label: string;
  href: string;
}

const menuItems: MenuItem[] = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Community", href: "/community" },
  { label: "About", href: "/about" },
  { label: "Journal", href: "/journal" },
];

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com/yrc_munich/" },
  { label: "Strava", href: "https://www.strava.com/clubs/YRCMunich" },
];

interface NavbarProps {
  className?: string;
}

/** Full-screen overlay menu. Animations are pure CSS (see globals.css). */
const Navbar = ({ className }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <section className={cn("bg-background", className)}>
      <div className="container flex items-center justify-between py-6">
        <div className="z-50">
          <Link
            href="/"
            aria-label="Yas Rise Community — Home"
            className="flex items-center gap-2"
            onClick={() => setIsOpen(false)}
          >
            <Image
              src="/YRC/Brand/Logo/logo-black.png"
              alt="YRC — Yas Rise Community"
              width={1080}
              height={1080}
              priority
              className="h-9 w-auto"
            />
          </Link>
        </div>

        <div className="z-50 flex items-center gap-6">
          <Button
            size="lg"
            className="tracking-wider uppercase"
            render={<Link href="/login" />}
            nativeButton={false}
          >
            Join YRC
          </Button>
          <button
            onClick={toggleMenu}
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="text-body-small font-medium tracking-wider text-foreground uppercase transition-colors hover:text-muted-foreground"
          >
            <span key={isOpen ? "close" : "menu"} className="yrc-menu-label-in inline-block">
              {isOpen ? "Close" : "Menu"}
            </span>
          </button>
        </div>
      </div>

      {/* overlay stays mounted so opacity can transition both ways */}
      <div
        aria-hidden={!isOpen}
        className={cn(
          "fixed inset-0 z-40 overflow-hidden bg-background transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none invisible opacity-0",
        )}
      >
        <nav
          aria-label="Primary"
          className="flex h-full flex-col items-center justify-center px-6"
        >
          <div className="mb-16 text-center">
            {menuItems.map((item, index) => (
              <div
                key={item.label}
                className={cn("mb-5", isOpen && "yrc-menu-item-in")}
                style={isOpen ? { animationDelay: `${0.2 + index * 0.1}s` } : undefined}
              >
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="group relative inline-block"
                >
                  <span
                    className={cn(
                      "relative z-10 text-h2 font-bold uppercase transition-all duration-300 md:text-display group-hover:opacity-80 group-hover:blur-[6px]",
                      isActive(item.href)
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </span>
                  <span className="absolute bottom-0 left-0 h-1 w-0 bg-yrc-accent transition-[width] duration-300 group-hover:w-full" />
                </Link>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-8 sm:flex-row sm:gap-12">
            {socialLinks.map((link, index) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "group flex items-center gap-2 text-caption font-medium text-muted-foreground transition-all duration-300 hover:translate-x-1 hover:text-foreground",
                  isOpen && "yrc-menu-item-in",
                )}
                style={isOpen ? { animationDelay: `${0.8 + index * 0.1}s` } : undefined}
              >
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </nav>
      </div>
    </section>
  );
};

export { Navbar };
