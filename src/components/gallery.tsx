import { cn } from "@/lib/utils";
import { CommunityGallery, type GalleryPhoto } from "@/components/community-gallery";

/*
 * Home page gallery: the same cover-flow block as the Community page, with
 * the home page's own copy and photo set.
 */

const basePath = "/YRC/Events/Upcoming/Istanbul%20Marathon%202025";

const photos: GalleryPhoto[] = [
  {
    src: `${basePath}/M06.JPG`,
    alt: "YRC runners on the course at Istanbul Marathon 2025",
    updatedAt: "1789681147875",
  },
  {
    src: `${basePath}/M07.jpg`,
    alt: "A YRC runner celebrating on the course at Istanbul Marathon",
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
    src: `${basePath}/M05.JPG`,
    alt: "YRC runners pushing through Istanbul Marathon 2025",
    updatedAt: "1789681152474",
  },
  {
    src: `${basePath}/pexels-ciro-palomba-1275986148-31517243.jpg`,
    alt: "Runners sharing miles through the city",
    updatedAt: "1789681305377",
  },
  {
    src: `${basePath}/pexels-stephen-leonardi-587681991-29840316.jpg`,
    alt: "A runner alone with the road on a long run",
    updatedAt: "1789681346908",
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
