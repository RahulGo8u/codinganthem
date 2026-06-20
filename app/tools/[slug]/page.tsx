import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getToolBySlug, tools } from "@/lib/tools";
import { ToolPageClient } from "./ToolPageClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};

  const url = `https://www.codinganthem.com/tools/${tool.slug}`;
  const title = `${tool.name} — Free Online Tool`;

  return {
    title: tool.name,
    description: tool.description,
    keywords: tool.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description: tool.description,
      url,
      type: "website",
      siteName: "CodingAnthem",
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: tool.description,
      images: ["/opengraph-image"],
    },
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const toolUrl = `https://www.codinganthem.com/tools/${tool.slug}`;

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    url: toolUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  const explainerParts = tool.explainer.split("\n\n");
  const summary = explainerParts[0] ?? tool.description;
  const bulletText = explainerParts[1]
    ? explainerParts[1]
        .split("\n")
        .map((b) => b.replace(/^•\s*/, "").trim())
        .filter(Boolean)
        .join(". ")
    : null;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is ${tool.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: summary,
        },
      },
      ...(bulletText
        ? [
            {
              "@type": "Question",
              name: `How do I use ${tool.name}?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: bulletText,
              },
            },
          ]
        : []),
      {
        "@type": "Question",
        name: `Is ${tool.name} free?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes, ${tool.name} is completely free. No account or sign-up required, and all processing happens in your browser — nothing is sent to a server.`,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <ToolPageClient slug={slug} />
    </>
  );
}
