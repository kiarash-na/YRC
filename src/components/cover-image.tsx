"use client";

import { Image } from "@/components/imagekit";
import { lqip } from "@/lib/imagekit";

interface CoverImageProps {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
}

/**
 * Cover image with the official ImageKit LQIP pattern: a blurred, low-quality
 * derivative as background placeholder, cleared once the full image loads.
 */
const CoverImage = ({ src, alt, sizes = "100vw", className }: CoverImageProps) => {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority
      sizes={sizes}
      className={className}
      style={{
        backgroundImage: lqip(src) ? `url(${lqip(src)})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onLoad={(e) => {
        e.currentTarget.style.backgroundImage = "none";
      }}
    />
  );
};

export { CoverImage };
