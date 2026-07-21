import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CodingAnthem — Free Online Developer Utilities & Tools",
    short_name: "CodingAnthem",
    description:
      "Fast, free developer tools for your browser and AI workflows. Format JSON, encode Base64, generate UUIDs, test regex, and more.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#6366f1",
    categories: ["developer", "productivity", "utilities"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
