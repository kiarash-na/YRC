import type { Metadata } from "next";

import { Blog52 } from "@/components/blog52";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { PostCard } from "@/components/post-card";
import { getAllTags, getPostSummaries, getPostsByTag } from "@/lib/posts-db";
import { Reveal } from "@/components/reveal";
import { getSlotsMedia } from "@/lib/site-media-db";

export const metadata: Metadata = {
  title: "Journal — YRC",
  description:
    "Stories, training notes and race recaps from the Yas Rise Community journal.",
};

// ISR: journal posts change rarely; admin edits revalidate on demand.
export const revalidate = 900;

export default async function JournalPage() {
  const media = await getSlotsMedia(["journal.hero"]);
  const summaries = await getPostSummaries();
  const tags = getAllTags(summaries);

  return (
    <main id="main" className="flex-1">
      <Blog52 image={media["journal.hero"][0]} />

      <section className="bg-background pb-32">
        <div className="container">
          <div className="mx-auto flex max-w-6xl flex-col gap-12">
            <div className="flex max-w-xl flex-col gap-7">
              <p className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
                Latest
              </p>
              <h2 className="text-h2 md:text-h1">Fresh from the journal</h2>
            </div>

            <Reveal className="yrc-stagger flex flex-wrap justify-center gap-6">
              {summaries.slice(0, 9).map((post) => (
                <PostCard
                  key={post.slug}
                  post={post}
                  morph
                  className="sm:max-w-[calc(50%-0.75rem)] lg:max-w-[calc(33.333%-1rem)]"
                />
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {tags.map((tag) => {
        const posts = getPostsByTag(summaries, tag);
        return (
          <section key={tag} className="bg-background pb-32">
            <div className="container">
              <div className="mx-auto flex max-w-6xl flex-col gap-12 border-t border-border pt-16">
                <div className="flex max-w-xl flex-col gap-7">
                  <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
                    Topic
                  </p>
                  <h2 className="text-h2 md:text-h1">{tag}</h2>
                </div>

                <Reveal className="yrc-stagger flex flex-wrap justify-center gap-6">
                  {posts.slice(0, 3).map((post) => (
                    <PostCard
                      key={post.slug}
                      post={post}
                      className="sm:max-w-[calc(50%-0.75rem)] lg:max-w-[calc(33.333%-1rem)]"
                    />
                  ))}
                </Reveal>
              </div>
            </div>
          </section>
        );
      })}

      <Reveal>
        <NewsletterSignup />
      </Reveal>
    </main>
  );
}
