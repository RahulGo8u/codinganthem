"use client";

import { useState, useMemo } from "react";
import { diffLines, type Change } from "diff";
import { getToolBySlug } from "@/lib/tools";
import Link from "next/link";

const tool = getToolBySlug("json-diff")!;

function normalizeJson(input: string): string {
  const parsed = JSON.parse(input);
  return JSON.stringify(parsed, sortReplacer, 2);
}

function sortReplacer(_key: string, value: unknown): unknown {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b))
    );
  }
  return value;
}

export function JsonDiff() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [leftError, setLeftError] = useState<string | undefined>();
  const [rightError, setRightError] = useState<string | undefined>();

  const diff = useMemo(() => {
    if (!left.trim() && !right.trim()) return null;
    let leftNorm = left;
    let rightNorm = right;
    let lErr: string | undefined;
    let rErr: string | undefined;

    try { leftNorm = left.trim() ? normalizeJson(left) : ""; }
    catch (e) { lErr = (e as Error).message; }

    try { rightNorm = right.trim() ? normalizeJson(right) : ""; }
    catch (e) { rErr = (e as Error).message; }

    setLeftError(lErr);
    setRightError(rErr);

    if (lErr || rErr) return null;
    return diffLines(leftNorm, rightNorm);
  }, [left, right]);

  const stats = useMemo(() => {
    if (!diff) return null;
    const added = diff.filter((c) => c.added).reduce((a, c) => a + (c.count ?? 0), 0);
    const removed = diff.filter((c) => c.removed).reduce((a, c) => a + (c.count ?? 0), 0);
    return { added, removed };
  }, [diff]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            All tools
          </Link>
          <span className="text-[var(--border)]">/</span>
          <h1 className="text-sm font-medium text-[var(--text-primary)]">{tool.name}</h1>
        </div>
        {stats && (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-[#22c55e]">+{stats.added} added</span>
            <span className="text-[#ef4444]">−{stats.removed} removed</span>
          </div>
        )}
      </div>

      {/* Two input panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          { label: "Original JSON", value: left, set: setLeft, err: leftError },
          { label: "Modified JSON", value: right, set: setRight, err: rightError },
        ].map(({ label, value, set, err }) => (
          <div key={label} className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">{label}</label>
            <textarea
              value={value}
              onChange={(e) => set(e.target.value)}
              placeholder={`Paste ${label.toLowerCase()} here...`}
              spellCheck={false}
              className={`mono min-h-[200px] p-4 rounded-lg border ${err ? "border-[#ef4444]" : "border-[var(--border)]"} bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none leading-relaxed`}
            />
            {err && <p className="text-xs text-[#ef4444] leading-relaxed">{err}</p>}
          </div>
        ))}
      </div>

      {/* Diff output */}
      {diff && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Diff</label>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] overflow-auto">
            <div className="mono text-sm leading-relaxed">
              {diff.map((part: Change, i: number) => (
                <div
                  key={i}
                  className={`px-4 py-0.5 whitespace-pre-wrap ${
                    part.added
                      ? "bg-[#22c55e]/10 text-[#22c55e]"
                      : part.removed
                      ? "bg-[#ef4444]/10 text-[#ef4444]"
                      : "text-[var(--text-muted)]"
                  }`}
                >
                  <span className="select-none mr-2 opacity-60">
                    {part.added ? "+" : part.removed ? "−" : " "}
                  </span>
                  {part.value}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => { setLeft(""); setRight(""); setLeftError(undefined); setRightError(undefined); }}
            disabled={!left && !right}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Clear all
          </button>
          <button
            onClick={() => { const t = left; setLeft(right); setRight(t); }}
            disabled={!left && !right}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Swap
          </button>
        </div>
      </div>

      {/* Explainer */}
      {tool.explainer && (
        <div className="border-t border-[var(--border)] pt-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
            About {tool.name}
          </h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-3xl whitespace-pre-line">
            {tool.explainer}
          </p>
        </div>
      )}
    </div>
  );
}
