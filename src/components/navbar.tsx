"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "cn";

import { Image } from "@/components/imagekit";
import { JoinYrcButton } from "@/components/join-yrc-button";

interface MenuItem {
  label: string;
  href: string;
}

const menuItems: MenuItem[] = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Community", href: "/community" },
  { label: "About", href: "/about" },
  { label: "Blogs", href: "/blogs" },
];

const socialLinks = [
  { label: "Instagram", href: "#" },
  { label: "Strava", href: "#" },
];

interface NavbarProps {
  className?: string;
}

const Navbar = ({ className }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <section className={cn("", className)}>
      <div className="container relative flex items-center justify-between py-6">
        <div className="z-50">
          <Link
            href="/"
            aria-label="Yas Rise Community — Home"
            className="flex items-center gap-2"
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

        <nav
          aria-label="Primary"
          className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 md:flex"
        >
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "text-body-small font-medium tracking-wider uppercase transition-colors hover:text-yrc-accent",
                isActive(item.href)
                  ? "text-yrc-accent"
                  : "text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="z-50 flex items-center gap-6">
          <JoinYrcButton className="tracking-wider uppercase" />
          <button
            onClick={toggleMenu}
            className="text-lg tracking-wider text-foreground transition-colors hover:text-muted-foreground md:hidden"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={isOpen ? "close" : "menu"}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                {isOpen ? "CLOSE" : "MENU"}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 overflow-hidden bg-background"
          >
            <div className="flex h-full flex-col items-center justify-center px-6">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="mb-16 text-center"
              >
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                    className="mb-5"
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className="group relative inline-block"
                    >
                      <motion.span
                        className={cn(
                          "relative z-10 text-h2 font-bold uppercase transition-transform duration-300 md:text-display",
                          isActive(item.href)
                            ? "text-yrc-accent"
                            : "text-foreground",
                        )}
                        initial={{ opacity: 1, filter: "blur(0px)" }}
                        whileHover={{ opacity: 0.8, filter: "blur(6px)" }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        {item.label}
                      </motion.span>

                      <motion.div
                        className="absolute bottom-0 left-0 h-1 bg-yrc-accent"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </Link>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="flex flex-col gap-8 sm:flex-row sm:gap-12"
              >
                {socialLinks.map((link, index) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 text-caption font-medium text-muted-foreground transition-colors hover:text-foreground"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
                    whileHover={{ x: 5 }}
                  >
                    <span>{link.label}</span>
                  </motion.a>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export { Navbar };
