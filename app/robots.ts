import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // API endpoints return JSON and short-link redirects have no standalone
      // content to index — keep them out of the crawl budget and search results.
      disallow: ["/api/", "/r/"],
    },
    sitemap: "https://www.codinganthem.com/sitemap.xml",
  };
}
