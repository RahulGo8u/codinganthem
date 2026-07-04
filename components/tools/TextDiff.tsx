"use client";

import { useState, useMemo } from "react";
import { diffLines, type Change } from "diff";
import { getToolBySlug } from "@/lib/tools";
import Link from "next/link";

const tool = getToolBySlug("text-diff")!;

const SAMPLE_LEFT = "The quick brown fox jumps over the lazy dog.\nThis line stays the same.\nOld line to be removed.";
const SAMPLE_RIGHT = "The quick brown fox leaps over the lazy dog.\nThis line stays the same.\nNew line that was added.";

type RowKind = "same" | "change";
interface Row {
  left: string | null;
  right: string | null;
  leftNo: number | null;
  rightNo: number | null;
  kind: RowKind;
}

function splitLines(value: string): string[] {
  const lines = value.split("\n");
  if (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

function buildRows(diff: Change[]): Row[] {
  const rows: Row[] = [];
  let dels: string[] = [];
  let adds: string[] = [];
  let ln = 0;
  let rn = 0;

  const flush = () => {
    const n = Math.max(dels.length, adds.length);
    for (let i = 0; i < n; i++) {
      const left = i < dels.length ? dels[i] : null;
      const right = i < adds.length ? adds[i] : null;
      rows.push({
        left,
        right,
        leftNo: left !== null ? ++ln : null,
        rightNo: right !== null ? ++rn : null,
        kind: "change",
      });
    }
    dels = [];
    adds = [];
  };

  for (const part of diff) {
    const lines = splitLines(part.value);
    if (part.added) {
      adds.push(...lines);
    } else if (part.removed) {
      dels.push(...lines);
    } else {
      flush();
      for (const ln2 of lines) {
        rows.push({ left: ln2, right: ln2, leftNo: ++ln, rightNo: ++rn, kind: "same" });
      }
    }
  }
  flush();
  return rows;
}

export function TextDiff() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");

  const rows = useMemo(() => {
    if (!left && !right) return null;
    return buildRows(diffLines(left, right));
  }, [left, right]);

  const stats = useMemo(() => {
    if (!rows) return null;
    const added = rows.filter((r) => r.kind === "change" && r.right !== null).length;
    const removed = rows.filter((r) => r.kind === "change" && r.left !== null).length;
    return { added, removed };
  }, [rows]);

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
          { label: "Original", value: left, set: setLeft },
          { label: "Modified", value: right, set: setRight },
        ].map(({ label, value, set }) => (
          <div key={label} className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
              {label}
            </label>
            <textarea
              value={value}
              onChange={(e) => set(e.target.value)}
              placeholder={`Paste ${label.toLowerCase()} text here...`}
              spellCheck={false}
              className="mono min-h-[180px] p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none leading-relaxed"
            />
          </div>
        ))}
      </div>

      {/* Side-by-side diff */}
      {rows && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Diff</label>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] overflow-auto">
            {/* Column headers */}
            <div className="grid grid-cols-2 text-[10px] uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border)] sticky top-0 bg-[var(--bg-surface)]">
              <div className="px-4 py-1.5 border-r border-[var(--border)]">Original</div>
              <div className="px-4 py-1.5">Modified</div>
            </div>
            <div className="mono text-sm leading-relaxed">
              {rows.map((row, i) => (
                <div key={i} className="grid grid-cols-2">
                  {/* Left */}
                  <div
                    className={`flex border-r border-[var(--border)] ${
                      row.left === null
                        ? "bg-[var(--bg-elevated)]/40"
                        : row.kind === "change"
                        ? "bg-[#ef4444]/10"
                        : ""
                    }`}
                  >
                    <span className="select-none w-10 shrink-0 px-2 text-right text-[var(--text-muted)] opacity-50">
                      {row.leftNo ?? ""}
                    </span>
                    <span className={`flex-1 px-2 whitespace-pre-wrap break-words ${row.left !== null && row.kind === "change" ? "text-[#ef4444]" : "text-[var(--text-primary)]"}`}>
                      {row.left ?? ""}
                    </span>
                  </div>
                  {/* Right */}
                  <div
                    className={`flex ${
                      row.right === null
                        ? "bg-[var(--bg-elevated)]/40"
                        : row.kind === "change"
                        ? "bg-[#22c55e]/10"
                        : ""
                    }`}
                  >
                    <span className="select-none w-10 shrink-0 px-2 text-right text-[var(--text-muted)] opacity-50">
                      {row.rightNo ?? ""}
                    </span>
                    <span className={`flex-1 px-2 whitespace-pre-wrap break-words ${row.right !== null && row.kind === "change" ? "text-[#22c55e]" : "text-[var(--text-primary)]"}`}>
                      {row.right ?? ""}
                    </span>
                  </div>
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
            onClick={() => { setLeft(""); setRight(""); }}
            disabled={!left && !right}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#ef4444]/40 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 hover:border-[#ef4444]/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
          <button
            onClick={() => { setLeft(SAMPLE_LEFT); setRight(SAMPLE_RIGHT); }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Load sample
          </button>
        </div>
      </div>
    </div>
  );
}
