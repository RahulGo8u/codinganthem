import type { Metadata } from "next";
import { HomepageClient } from "@/components/HomepageClient";

export const metadata: Metadata = {
  title: "CodingAnthem — Free Online Developer Utilities & Tools",
  description:
    "Fast, free developer tools for your browser and AI workflows. Format JSON, encode Base64, generate UUIDs, test regex, and more.",
  alternates: {
    canonical: "https://www.codinganthem.com",
  },
};

export default function HomePage() {
  return <HomepageClient />;
}
