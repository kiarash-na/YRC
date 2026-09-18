import type { Metadata } from "next";

import { Blog22 } from "@/components/blog22";
import { Blog52 } from "@/components/blog52";
import { JoinCta } from "@/components/join-cta";

export const metadata: Metadata = {
  title: "Blogs — YRC",
  description:
    "Stories, training notes and race recaps from the Yas Rise Community.",
};

export default function BlogsPage() {
  return (
    <main className="flex-1">
      <Blog52 />
      <Blog22 />
      <JoinCta />
    </main>
  );
}
