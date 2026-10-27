import type { Metadata } from "next";

import { AdminNav, AdminSidebarFooter } from "@/components/admin-sidebar";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Admin — YRC",
};

/**
 * Admin area: separate chrome from the website. requireAdmin() 404s anyone
 * whose Strava athlete ID isn't linked to an admin seat.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-svh flex-1 bg-muted">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col gap-6 border-r border-border bg-background p-4 md:flex">
        <p className="px-3 text-h3 font-bold tracking-tight">
          YRC <span className="text-caption font-medium text-muted-foreground">admin</span>
        </p>
        <div className="flex-1">
          <AdminNav />
        </div>
        <AdminSidebarFooter />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex flex-col gap-3 border-b border-border bg-background p-4 md:hidden">
          <p className="text-body-small font-bold tracking-tight">
            YRC <span className="font-medium text-muted-foreground">admin</span>
          </p>
          <AdminNav orientation="horizontal" />
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
