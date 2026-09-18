import type { Metadata } from "next";

import { JoinCta } from "@/components/join-cta";

export const metadata: Metadata = {
  title: "Blogs — YRC",
  description:
    "Stories, training notes and race recaps from the Yas Rise Community.",
};

export default function BlogsPage() {
  return (
    <main className="flex-1">
      <section className="py-32">
        <div className="container flex flex-col items-center gap-7 text-center">
          <p className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
            Yas Rise Community
          </p>
          <h1 className="text-h1 md:text-display">BLOGS</h1>
          <p className="max-w-xl text-body text-muted-foreground">
            Stories, training notes and race recaps are on their way.
          </p>
        </div>
      </section>
      <JoinCta />
    </main>
  );
}
