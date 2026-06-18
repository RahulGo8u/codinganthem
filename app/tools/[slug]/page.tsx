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
  return {
    title: tool.name,
    description: tool.description,
    openGraph: {
      title: `${tool.name} | CodingAnthem`,
      description: tool.description,
    },
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();
  return <ToolPageClient slug={slug} />;
}
