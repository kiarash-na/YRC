import type { Metadata } from "next";

import { Blog22 } from "@/components/blog22";
import { Blog35 } from "@/components/blog35";
import { Blog52 } from "@/components/blog52";
import { Blog56 } from "@/components/blog56";
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
      <Blog35 />
      <Blog56 />
      <JoinCta />
    </main>
  );
}
