import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  CATEGORY_LABELS,
  CATEGORY_META,
  CATEGORY_ORDER,
  getToolsByCategory,
  isToolCategory,
  sortToolsByName,
} from "@/lib/tools";
import { ToolCard } from "@/components/ToolCard";

interface Props {
  params: Promise<{ slug: string }>;
}

const BASE = "https://www.codinganthem.com";

export function generateStaticParams() {
  return CATEGORY_ORDER.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isToolCategory(slug)) return {};

  const meta = CATEGORY_META[slug];
  const url = `${BASE}/category/${slug}`;
  const title = `${meta.title} — Free Online Tools`;

  return {
    title,
    description: meta.intro,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: meta.intro,
      url,
      type: "website",
      siteName: "CodingAnthem",
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: meta.intro,
      images: ["/opengraph-image"],
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  if (!isToolCategory(slug)) notFound();

  const meta = CATEGORY_META[slug];
  const label = CATEGORY_LABELS[slug];
  const categoryTools = sortToolsByName(getToolsByCategory(slug));
  const url = `${BASE}/category/${slug}`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE },
      { "@type": "ListItem", position: 2, name: label, item: url },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: meta.title,
    description: meta.intro,
    numberOfItems: categoryTools.length,
    itemListElement: categoryTools.map((tool, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE}/tools/${tool.slug}`,
      name: tool.name,
    })),
  };

  const otherCategories = CATEGORY_ORDER.filter((c) => c !== slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-3 mb-8">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            All tools
          </Link>
          <span className="text-[var(--border)]">/</span>
          <span className="text-xs text-[var(--text-primary)]">{label}</span>
        </nav>

        {/* Header */}
        <header className="flex flex-col gap-3 max-w-2xl mb-10">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
            {meta.title}
          </h1>
          <p className="text-base leading-relaxed text-[var(--text-muted)]">
            {meta.intro}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {categoryTools.length} {categoryTools.length === 1 ? "tool" : "tools"} in {label}
          </p>
        </header>

        {/* Tool grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categoryTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>

        {/* Other categories — internal linking */}
        <div className="border-t border-[var(--border)] mt-14 pt-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">
            Browse other categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {otherCategories.map((c) => (
              <Link
                key={c}
                href={`/category/${c}`}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[#6366f1]/40 transition-colors"
              >
                {CATEGORY_LABELS[c]}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
