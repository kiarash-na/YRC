import type { Metadata } from "next";

import { JoinCta } from "@/components/join-cta";

export const metadata: Metadata = {
  title: "About — YRC",
  description:
    "About Yas Rise Community — a running community in Munich. Run together. Grow together.",
};

export default function AboutPage() {
  return (
    <main className="flex-1">
      <section className="py-32">
        <div className="container flex flex-col items-center gap-7 text-center">
          <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
            Yas Rise Community
          </p>
          <h1 className="text-h1 md:text-display">ABOUT YRC</h1>
          <p className="max-w-xl text-body text-muted-foreground">
            Run together. Grow together. The full story is on its way.
          </p>
        </div>
      </section>
      <JoinCta />
    </main>
  );
}
