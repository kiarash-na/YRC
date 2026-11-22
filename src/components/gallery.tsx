import { cn } from "@/lib/utils";
import { CommunityGallery, type GalleryPhoto } from "@/components/community-gallery";

/*
 * Home page gallery: the same cover-flow block as the Community page, with
 * the home page's own copy and photo set.
 */

const basePath = "/YRC/Events/Upcoming/Istanbul%20Marathon%202025";

const photos: GalleryPhoto[] = [
  {
    src: `${basePath}/M06.jpg`,
    alt: "YRC runners on the course at Istanbul Marathon 2025",
    updatedAt: "1789681147875",
  },
  {
    src: "/YRC/Home/photo_2026-11-22_14-57-00.jpg",
    alt: "The YRC pack running through an autumn park",
  },
  {
    src: `${basePath}/09.jpg`,
    alt: "A YRC runner mid-race at Istanbul Marathon",
    updatedAt: "1789681141241",
  },
  {
    src: "/YRC/Home/SRK09793.jpg",
    alt: "The YRC pack together on a group run",
    updatedAt: "1789992741992",
    width: 1600,
  },
  {
    src: "/YRC/Community/IMG_2713.HEIC",
    alt: "A YRC runner smiling mid-run with the group behind her",
    updatedAt: "1794843451896",
  },
  {
    src: "/YRC/Home/photo_2026-11-22_14-57-11.jpg",
    alt: "A mountain lake under clouds on a YRC trip",
  },
  {
    src: "/YRC/Home/photo_2026-11-22_14-57-07.jpg",
    alt: "Sunrise over the path on an early-morning YRC run",
  },
  {
    src: "/YRC/Community/photo_5877443723178741687_w.jpg",
    alt: "The YRC community gathered after a run",
    updatedAt: "1790017039009",
  },
];

interface GalleryProps {
  className?: string;
}

const Gallery = ({ className }: GalleryProps) => (
  <CommunityGallery
    heading="Run. Explore. Rise."
    description="A glimpse into the people, places and experiences that make Yas Rise what it is."
    photos={photos}
    className={cn("py-24 md:py-32", className)}
  />
);

export { Gallery };
