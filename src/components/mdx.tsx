import type { MDXComponents } from "mdx/types";

import { Image } from "@/components/imagekit";

/**
 * Component map for MDX bodies rendered via next-mdx-remote/rsc compileMDX.
 * Style lock: white background, grayscale type scale, Poppins.
 */
export const mdxComponents: MDXComponents = {
  h2: ({ children }) => (
    <h2 className="text-h3 md:text-h2 mt-12 first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-h4 md:text-h3 mt-10 first:mt-0">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-body-small md:text-body mt-5 text-muted-foreground">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="text-body-small md:text-body mt-5 list-disc space-y-2 pl-6 text-muted-foreground marker:text-foreground">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="text-body-small md:text-body mt-5 list-decimal space-y-2 pl-6 text-muted-foreground marker:text-foreground">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  a: ({ children, href }) => (
    <a
      href={href}
      className="font-medium text-primary underline underline-offset-4 transition-opacity hover:opacity-75"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mt-6 border-l-2 border-yrc-accent pl-5">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="mt-10 border-border" />,
  img: ({ src, alt }) => (
    <span className="relative mt-8 block aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted">
      <Image
        src={typeof src === "string" ? src : ""}
        alt={alt ?? ""}
        fill
        sizes="(min-width: 1024px) 720px, 100vw"
        className="object-cover object-center"
      />
    </span>
  ),
};
