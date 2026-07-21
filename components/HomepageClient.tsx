"use client";

import { useState, useEffect, useTransition, memo } from "react";
import { tools, CATEGORY_LABELS, CATEGORY_ORDER, sortToolsByName, type ToolCategory } from "@/lib/tools";
import { ToolCard } from "@/components/ToolCard";
import { getRecentToolSlugs, clearRecentTools } from "@/components/CommandPalette";
import { HeroDemo } from "@/components/HeroDemo";
import { GitHubStars } from "@/components/GitHubStars";

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

          {/* Heading */}
          <div className="flex flex-col gap-3 max-w-2xl">
            <span className="text-sm font-semibold tracking-tight" style={{ color: "var(--text-muted)" }}>
              <span style={{ color: "#6366f1" }}>coding</span>anthem
            </span>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
              {tools.length} Free Developer Tools
            </h1>
            <p className="text-base sm:text-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Built for developers, students, and AI engineers. No login, no ads — just instant
              results. Paste JSON from ChatGPT, decode a JWT from a bug report, or format SQL
              from Copilot, most tools running entirely in your browser.
            </p>
            <a
              href="https://github.com/RahulGo8u/codinganthem"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 text-sm text-[var(--text-muted)] hover:text-[#6366f1] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              <span>Open source on GitHub</span>
              <GitHubStars className="w-auto group-hover:text-[#6366f1]" />
            </a>
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
              { value: "Free", label: "Forever" },
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
              className="mt-2 flex flex-col gap-2 p-4 rounded-xl border border-[#6366f1]/30 bg-[#6366f1]/5 hover:border-[#6366f1]/50 hover:bg-[#6366f1]/10 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6366f1]">
                  Open Source
                </span>
                <GitHubStars />
              </div>
              <span className="text-xs text-[var(--text-muted)] leading-relaxed">
                Fully open source. Star the repo or contribute a tool.
              </span>
              <span className="text-xs font-medium text-[#6366f1]">Star on GitHub →</span>
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
