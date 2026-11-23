"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Images,
} from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  /** Accent tab (yellow, bold) that stands out from the rest. */
  highlight?: boolean;
}[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/agent", label: "Agent", icon: Sparkles, highlight: true },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/media", label: "Media", icon: Images },
  { href: "/admin/scoring", label: "Scoring", icon: Star },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/admins", label: "Admins", icon: ShieldCheck },
];

export function AdminNav({ orientation = "vertical" }: { orientation?: "vertical" | "horizontal" }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex gap-1",
        orientation === "vertical" ? "flex-col" : "flex-row overflow-x-auto",
      )}
    >
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-body-small font-medium whitespace-nowrap transition-colors",
              item.highlight
                ? cn(
                    "bg-yrc-accent font-bold text-yrc-accent-foreground hover:bg-yrc-accent/85",
                    active && "ring-2 ring-primary ring-inset",
                  )
                : active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebarFooter() {
  return (
    <div className="flex flex-col gap-1 border-t border-border pt-3">
      <Link
        href="/"
        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-body-small font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <CalendarDays className="size-4" />
        Back to site
      </Link>
      <a
        href="/auth/logout"
        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-body-small font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <LogOut className="size-4" />
        Log out
      </a>
    </div>
  );
}
