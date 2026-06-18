import type { MetadataRoute } from "next";
import { tools } from "@/lib/tools";

const BASE = "https://codinganthem.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const toolPages: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${BASE}/tools/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  return [...staticPages, ...toolPages];
}
