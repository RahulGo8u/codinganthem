import type { MetadataRoute } from "next";
import { tools, CATEGORY_ORDER } from "@/lib/tools";

const BASE = "https://www.codinganthem.com";
// Bump this only when tool content/pages meaningfully change, so the sitemap's
// lastmod stays a truthful freshness signal instead of resetting on every deploy.
const LAST_MODIFIED = "2026-07-04";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE}/about`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE}/privacy`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORY_ORDER.map((category) => ({
    url: `${BASE}/category/${category}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const toolPages: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${BASE}/tools/${tool.slug}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  return [...staticPages, ...categoryPages, ...toolPages];
}
