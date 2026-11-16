import type { MetadataRoute } from "next";

import { IS_PRODUCTION_SITE, SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Keep the dev preview / local builds out of search results.
  if (!IS_PRODUCTION_SITE) return { rules: { userAgent: "*", disallow: "/" } };

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/profile", "/checkin", "/login", "/auth"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
