import { cn } from "cn";

import { Image } from "@/components/imagekit";

interface StickerOverlayProps {
  src: string;
  updatedAt: string;
  className?: string;
}

/**
 * Decorative sticker overlay for images. Render inside a `relative`
 * container so it anchors to the image. Purely visual: hidden from
 * assistive tech and never intercepts pointer events.
 */
const StickerOverlay = ({ src, updatedAt, className }: StickerOverlayProps) => {
  return (
    <Image
      src={src}
      alt=""
      aria-hidden
      width={160}
      height={160}
      queryParameters={{ updatedAt }}
      className={cn(
        "pointer-events-none absolute top-3 right-3 z-10 h-auto w-12 rotate-6 grayscale md:w-16",
        className,
      )}
    />
  );
};

export { StickerOverlay };
