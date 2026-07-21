"use client";

import { useEffect, useState, useCallback } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { ICON_MAP, type IconName } from "@/lib/icons";
import { tools, CATEGORY_LABELS, CATEGORY_ORDER, sortToolsByName } from "@/lib/tools";

function ToolIcon({ name }: { name: string }) {
  const Icon = ICON_MAP[name as IconName] as React.ComponentType<{ size?: number; className?: string }> | undefined;
  if (!Icon) return null;
  return <Icon size={14} className="text-[var(--text-muted)]" />;
}

const RECENT_KEY = "ca_recent_tools";
// Keep in sync with the homepage "Recently used" section (HomepageClient.tsx),
// which displays up to 4 — both surfaces should show the same set.
const MAX_RECENT = 4;

function getRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addRecentTool(slug: string) {
  if (typeof window === "undefined") return;
  const recent = getRecent().filter((s) => s !== slug);
  recent.unshift(slug);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

/** Public helper so other components (e.g. the homepage) can show recently used tools. */
export function getRecentToolSlugs(): string[] {
  return getRecent();
}

/** Wipes recently-used history — surfaced on the homepage for privacy-conscious users. */
export function clearRecentTools() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(RECENT_KEY);
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      } else if (
        e.key === "/" &&
        !(document.activeElement instanceof HTMLInputElement) &&
        !(document.activeElement instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (open) {
      setRecent(getRecent());
      setSearch("");
    }
  }, [open]);

  const navigate = useCallback(
    (slug: string) => {
      addRecentTool(slug);
      setOpen(false);
      router.push(`/tools/${slug}`);
    },
    [router]
  );

  const recentTools = recent
    .map((slug) => tools.find((t) => t.slug === slug))
    .filter(Boolean);

  const categories = CATEGORY_ORDER;

  return (
    <>
      {/* Trigger button (used in Nav) */}
      <button
        id="cmd-palette-trigger"
        onClick={() => setOpen(true)}
        className="hidden"
        aria-label="Open command palette"
      />

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
          onClick={() => setOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" />

          {/* Palette */}
          <div
            className="relative w-full max-w-[560px] rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Command
              label="Command palette"
              shouldFilter={true}
              filter={(value, search) => {
                const tool = tools.find((t) => t.slug === value);
                if (!tool) return 0;
                const haystack = [tool.name, ...tool.keywords].join(" ").toLowerCase();
                return haystack.includes(search.toLowerCase()) ? 1 : 0;
              }}
            >
              <div className="flex items-center gap-3 px-4 border-b border-[var(--border)]">
                <svg
                  className="text-[var(--text-muted)] shrink-0"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Search tools..."
                  className="w-full h-12 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm outline-none"
                  autoFocus
                />
                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded text-xs text-[var(--text-muted)] border border-[var(--border)] bg-[var(--bg-elevated)] shrink-0">
                  Esc
                </kbd>
              </div>

              <Command.List className="max-h-[400px] overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center text-sm text-[var(--text-muted)]">
                  No tools found for &quot;{search}&quot;
                </Command.Empty>

                {!search && recentTools.length > 0 && (
                  <Command.Group
                    heading="Recently used"
                    className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--text-muted)] [&_[cmdk-group-heading]]:font-semibold"
                  >
                    {recentTools.map((tool) => (
                      <Command.Item
                        key={tool!.slug}
                        value={tool!.slug}
                        onSelect={() => navigate(tool!.slug)}
                        className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer text-[var(--text-primary)] aria-selected:bg-[var(--bg-elevated)] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                            <span className="w-5 flex items-center justify-center">
                              <ToolIcon name={tool!.icon} />
                            </span>
                            <span>{tool!.name}</span>
                          </div>
                        <span className="text-xs text-[var(--text-muted)] capitalize">
                          {CATEGORY_LABELS[tool!.category]}
                        </span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {categories.map((cat) => {
                  const catTools = sortToolsByName(tools.filter((t) => t.category === cat));
                  return (
                    <Command.Group
                      key={cat}
                      heading={search ? undefined : CATEGORY_LABELS[cat]}
                      className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--text-muted)] [&_[cmdk-group-heading]]:font-semibold mt-1"
                    >
                      {catTools.map((tool) => (
                        <Command.Item
                          key={tool.slug}
                          value={tool.slug}
                          onSelect={() => navigate(tool.slug)}
                          className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer text-[var(--text-primary)] aria-selected:bg-[var(--bg-elevated)] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-5 flex items-center justify-center">
                              <ToolIcon name={tool.icon} />
                            </span>
                            <span>{tool.name}</span>
                          </div>
                          <span className="text-xs text-[var(--text-muted)]">
                            {CATEGORY_LABELS[tool.category]}
                          </span>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  );
                })}
              </Command.List>

              {/* Footer hint */}
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t border-[var(--border)] text-[11px] text-[var(--text-muted)]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--bg-elevated)]">↑</kbd>
                    <kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--bg-elevated)]">↓</kbd>
                    to navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--bg-elevated)]">↵</kbd>
                    to select
                  </span>
                </div>
                <span className="text-[var(--text-muted)]">
                  {tools.length} tools
                </span>
              </div>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}
