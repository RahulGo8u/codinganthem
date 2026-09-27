import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getToolBySlug, getToolFaqs, tools } from "@/lib/tools";
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
  // seoTitle is a hand-written, keyword-targeted title distinct from the
  // generic on-page `name` — falls back to the old boilerplate if unset.
  const title = tool.seoTitle ?? `${tool.name} — Free Online Tool`;

  return {
    title,
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
      // No explicit `images` here — the colocated opengraph-image.tsx in this
      // route segment generates a per-tool image automatically.
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: tool.description,
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

  const toolFaqs = getToolFaqs(tool);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.codinganthem.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: tool.name,
        item: toolUrl,
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: toolFaqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <ToolPageClient slug={slug} />
    </>
  );
}
