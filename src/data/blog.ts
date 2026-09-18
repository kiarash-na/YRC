export interface BlogPostImage {
  src: string;
  alt: string;
  updatedAt: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  image: BlogPostImage;
}

const basePath = "/YRC/Events/Upcoming/Istanbul%20Marathon%202025";

export const featuredStory: BlogPost = {
  slug: "build-the-habit-not-just-the-pace",
  title: "BUILD THE HABIT, NOT JUST THE PACE",
  summary:
    "How consistent running turns scattered workouts into a sustainable routine.",
  category: "Training",
  date: "September 2026",
  image: {
    src: `${basePath}/M07.jpg`,
    alt: "YRC runners celebrating together at the finish",
    updatedAt: "1789681140651",
  },
};

export const secondaryStories: BlogPost[] = [
  {
    slug: "strength-for-runners-what-actually-matters",
    title: "STRENGTH FOR RUNNERS: WHAT ACTUALLY MATTERS",
    summary:
      "The few strength fundamentals that keep runners healthy, durable and progressing — without living in the gym.",
    category: "Strength",
    date: "September 2026",
    image: {
      src: `${basePath}/pexels-roman-odintsov-5859136.jpg`,
      alt: "Runner training outdoors during a YRC trip",
      updatedAt: "1789681295806",
    },
  },
  {
    slug: "from-5k-to-your-first-half-marathon",
    title: "FROM 5K TO YOUR FIRST HALF MARATHON",
    summary:
      "A realistic path from comfortable 5K runs to standing on your first half marathon start line with confidence.",
    category: "Racing",
    date: "August 2026",
    image: {
      src: `${basePath}/03-1.jpg`,
      alt: "Runners on the course during a YRC event",
      updatedAt: "1789681290358",
    },
  },
  {
    slug: "why-running-with-other-people-changes-the-journey",
    title: "WHY RUNNING WITH OTHER PEOPLE CHANGES THE JOURNEY",
    summary:
      "Shared miles, shared motivation — how community turns running from a task into something you look forward to.",
    category: "Community",
    date: "August 2026",
    image: {
      src: `${basePath}/photo_5953857689656346515_w.jpg`,
      alt: "YRC community member mid-run with the group",
      updatedAt: "1789681284418",
    },
  },
];
