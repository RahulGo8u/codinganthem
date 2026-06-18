"use client";

import { useState } from "react";
import { tools, CATEGORY_LABELS, type ToolCategory } from "@/lib/tools";
import { ToolCard } from "@/components/ToolCard";

const ALL = "all" as const;
type Filter = ToolCategory | typeof ALL;

const CATEGORIES: { id: Filter; label: string }[] = [
  { id: ALL, label: "All" },
  ...Object.entries(CATEGORY_LABELS).map(([id, label]) => ({
    id: id as ToolCategory,
    label,
  })),
];

export default function HomePage() {
  const [filter, setFilter] = useState<Filter>(ALL);
  const filtered = filter === ALL ? tools : tools.filter((t) => t.category === filter);

  return (
    <div>
      {/* Hero */}
      <div className="hero-glow relative border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center text-center gap-6">

          {/* Heading */}
          <div className="flex flex-col gap-3 max-w-xl">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
              <span style={{ color: "#6366f1" }}>coding</span>anthem
            </h1>
            <p className="text-[var(--text-muted)] text-base sm:text-lg leading-relaxed">
              Fast, free developer tools. Everything runs in your browser —
              your data never leaves your machine.
            </p>
          </div>

          {/* Search bar */}
          <button
            onClick={() => document.getElementById("cmd-palette-trigger")?.click()}
            className="w-full max-w-md flex items-center gap-3 px-5 py-3.5 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:border-[#6366f1]/50 hover:bg-[var(--bg-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]/50 transition-all duration-150 group"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 group-hover:text-[#6366f1] transition-colors"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="flex-1 text-left text-sm">Search tools...</span>
          </button>

        </div>
      </div>

      {/* Tools section */}
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-baseline gap-2">
            <h2 className="text-sm font-semibold">Tools</h2>
            <span className="text-xs text-[var(--text-muted)]">{filtered.length} of {tools.length}</span>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  filter === id
                    ? "bg-[#6366f1]/15 text-[#6366f1] border-[#6366f1]/40"
                    : "bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)]/30"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border)] mb-8" />

        {/* Tool grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </div>
    </div>
  );
}
