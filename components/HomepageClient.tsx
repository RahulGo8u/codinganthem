"use client";

import { useState, useEffect, useTransition, memo } from "react";
import { tools, CATEGORY_LABELS, CATEGORY_ORDER, sortToolsByName, type ToolCategory } from "@/lib/tools";
import { ToolCard } from "@/components/ToolCard";
import { getRecentToolSlugs, clearRecentTools } from "@/components/CommandPalette";
import { HeroDemo } from "@/components/HeroDemo";

const ALL = "all" as const;
type Filter = ToolCategory | typeof ALL;

const CATEGORIES: { id: Filter; label: string }[] = [
  { id: ALL, label: "All" },
  ...CATEGORY_ORDER.map((id) => ({
    id,
    label: CATEGORY_LABELS[id],
  })),
];

const MemoToolCard = memo(ToolCard);

type Faq = { question: string; answer: string };

export function HomepageClient({ faqs = [] }: { faqs?: Faq[] }) {
  const [filter, setFilter] = useState<Filter>(ALL);
  const [isPending, startTransition] = useTransition();
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);
  const filtered = sortToolsByName(filter === ALL ? tools : tools.filter((t) => t.category === filter));

  useEffect(() => {
    setRecentSlugs(getRecentToolSlugs());
  }, []);

  const recentTools = recentSlugs
    .map((slug) => tools.find((t) => t.slug === slug))
    .filter((t): t is (typeof tools)[number] => Boolean(t))
    .slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <div className="hero-glow relative border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center text-center gap-6">

          {/* Client-side pill */}
          <span className="badge badge-accent">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            100% Client-Side Processing
          </span>

          {/* Heading */}
          <div className="flex flex-col gap-3 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
              <span style={{ color: "#6366f1" }}>coding</span>anthem{" "}
              <span className="block text-xl sm:text-2xl font-normal mt-3" style={{ color: "var(--text-muted)" }}>
                Free Online Developer Utilities &amp; Tools
              </span>
            </h1>
            <p className="text-[var(--text-muted)] text-base sm:text-lg leading-relaxed">
              {tools.length} developer tools, most running entirely in your browser. Paste JSON
              from ChatGPT, decode a JWT from a bug report, or format SQL from Copilot —
              instantly, no sign-up required.
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

          {/* Live demo */}
          <HeroDemo />

        </div>

        {/* Stats strip (truthful numbers) */}
        <div className="border-t border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: `${tools.length}`, label: "Tools" },
              { value: "0", label: "Accounts needed" },
              { value: "100%", label: "Client-side" },
              { value: `${CATEGORY_ORDER.length}`, label: "Categories" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col gap-1">
                <span className="text-2xl font-semibold text-[var(--accent)]">{s.value}</span>
                <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recently used */}
      {recentTools.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pt-12">
          <div className="flex items-baseline justify-between gap-2 mb-4">
            <h2 className="text-sm font-semibold">Recently used</h2>
            <button
              onClick={() => {
                clearRecentTools();
                setRecentSlugs([]);
              }}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentTools.map((tool) => (
              <MemoToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </div>
      )}

      {/* Tools section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar (lg+): categories + GitHub promo */}
          <aside className="hidden lg:flex lg:flex-col gap-4 w-52 shrink-0">
            <h2 className="text-sm font-semibold">Categories</h2>
            <nav className="flex flex-col gap-0.5">
              {CATEGORIES.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => startTransition(() => setFilter(id))}
                  aria-pressed={filter === id}
                  className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    filter === id
                      ? "bg-[#6366f1]/15 text-[#6366f1] font-medium"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>

            <a
              href="https://github.com/RahulGo8u/codinganthem"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex flex-col gap-1.5 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[#6366f1]/40 transition-colors"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Open Source
              </span>
              <span className="text-xs text-[var(--text-muted)] leading-relaxed">
                codinganthem is fully open source. Contribute your own tools.
              </span>
              <span className="text-xs font-medium text-[#6366f1] mt-1">View GitHub →</span>
            </a>
          </aside>

          {/* Main column */}
          <div className="flex-1 min-w-0">
            {/* Section header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-baseline gap-2">
                <h2 className="text-sm font-semibold lg:hidden">Tools</h2>
                <span className="text-xs text-[var(--text-muted)]">{filtered.length} of {tools.length}</span>
              </div>

              {/* Category pills (mobile / tablet only) */}
              <div className="flex flex-wrap gap-1.5 lg:hidden">
                {CATEGORIES.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => startTransition(() => setFilter(id))}
                    aria-pressed={filter === id}
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

            {/* Tool grid */}
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
              style={{ opacity: isPending ? 0.6 : 1, transition: "opacity 150ms" }}
            >
              {filtered.map((tool) => (
                <MemoToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px border border-[var(--border)] rounded-xl overflow-hidden">

            {[
              {
                icon: "🔒",
                title: "Privacy-first by default",
                body: "Your JSON, passwords, and hashes never touch a server.",
              },
              {
                icon: "⚡",
                title: "Results as you type",
                body: "No submit buttons, no spinners — instant on every keystroke.",
              },
              {
                icon: "∅",
                title: "No account. Ever.",
                body: "Open the URL, use the tool, close the tab. Free forever.",
              },
              {
                icon: "🤖",
                title: "Pairs well with AI",
                body: "Paste ChatGPT or Copilot output straight into any tool.",
              },
            ].map(({ icon, title, body }) => (
              <div key={title} className="flex flex-col gap-3 p-6 bg-[var(--bg-surface)]">
                <span className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#6366f1]/10 text-xl">
                  {icon}
                </span>
                <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug">{title}</p>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{body}</p>
              </div>
            ))}

          </div>
        </div>
      </div>

      {/* FAQ */}
      {faqs.length > 0 && (
        <div className="border-t border-[var(--border)]">
          <div className="max-w-3xl mx-auto px-6 pt-10 pb-16">
            <h2 className="text-sm font-semibold mb-6">Frequently asked questions</h2>
            <div className="flex flex-col gap-2">
              {faqs.map(({ question, answer }) => (
                <details
                  key={question}
                  className="group rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 open:bg-[var(--bg-elevated)] transition-colors"
                >
                  <summary className="flex items-center justify-between gap-3 text-sm font-medium text-[var(--text-primary)] cursor-pointer list-none">
                    {question}
                    <span className="text-[var(--text-muted)] transition-transform duration-150 group-open:rotate-45 shrink-0">
                      +
                    </span>
                  </summary>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed mt-3">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
