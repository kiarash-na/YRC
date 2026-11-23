import { cn } from "@/lib/utils";
import { CommunityGallery } from "@/components/community-gallery";
import { slotDefaults, type SiteMediaItem } from "@/lib/site-media";

/*
 * Home page gallery: the same cover-flow block as the Community page, with
 * the home page's own copy and photo set.
 */

interface GalleryProps {
  /** The slot's photos (from /admin/media); defaults to the built-in set. */
  media?: SiteMediaItem[];
  className?: string;
}

const Gallery = ({ className, media }: GalleryProps) => (
  <CommunityGallery
    heading="Run. Explore. Rise."
    description="A glimpse into the people, places and experiences that make Yas Rise what it is."
    photos={media ?? slotDefaults("home.gallery")}
    className={cn("py-24 md:py-32", className)}
  />
);

export { Gallery };
