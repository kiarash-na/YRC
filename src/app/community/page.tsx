import type { Metadata } from "next";

import { JoinCta } from "@/components/join-cta";

export const metadata: Metadata = {
  title: "Community — YRC",
  description:
    "Yas Rise Community — the people behind the runs. Every pace welcome.",
};

export default function CommunityPage() {
  return (
    <main className="flex-1">
      <section className="py-32">
        <div className="container flex flex-col items-center gap-7 text-center">
          <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
            Yas Rise Community
          </p>
          <h1 className="text-h1 md:text-display">COMMUNITY</h1>
          <p className="max-w-xl text-body text-muted-foreground">
            The people behind the runs. This page is on its way — the community
            is already out running.
          </p>
        </div>
      </section>
      <JoinCta />
    </main>
  );
}
