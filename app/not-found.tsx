import type { Metadata } from "next";
import Link from "next/link";
import { ToolCard } from "@/components/ToolCard";
import { getToolBySlug } from "@/lib/tools";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
};

const FEATURED = ["json-formatter", "jwt-decoder", "regex-tester", "uuid-generator"];

export default function NotFound() {
  const featured = FEATURED.map(getToolBySlug).filter(Boolean) as NonNullable<ReturnType<typeof getToolBySlug>>[];

  return (
    <div className="max-w-2xl mx-auto px-6 py-20 flex flex-col items-center text-center gap-8">
      {/* Logotype */}
      <div className="text-3xl font-semibold tracking-tight">
        <span style={{ color: "#6366f1" }}>coding</span>
        <span className="text-[var(--text-primary)]">anthem</span>
      </div>

      {/* 404 message */}
      <div className="flex flex-col gap-3">
        <p className="text-6xl font-semibold text-[var(--text-primary)] mono">404</p>
        <p className="text-lg text-[var(--text-muted)]">This page doesn't exist.</p>
        <p className="text-sm text-[var(--text-muted)]">
          The URL may be mistyped, or the page may have moved.
        </p>
      </div>

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#6366f1]/15 border border-[#6366f1]/40 text-[#6366f1] text-sm font-medium hover:bg-[#6366f1]/25 transition-colors"
      >
        ← Back to all tools
      </Link>

      {/* Popular tools */}
      <div className="w-full flex flex-col gap-4 pt-4 border-t border-[var(--border)]">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Popular tools
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          {featured.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </div>
    </div>
  );
}
