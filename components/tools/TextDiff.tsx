"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { diffLines, type Change } from "diff";
import { getToolBySlug } from "@/lib/tools";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  activeHunkRowClass,
  findHunkStarts,
  hunkRange,
  isTypingTarget,
  wrapIndex,
} from "@/lib/diffHunks";

const tool = getToolBySlug("text-diff")!;

const SAMPLE_LEFT =
  "The quick brown fox jumps over the lazy dog.\nThis line stays the same.\nOld line to be removed.";
const SAMPLE_RIGHT =
  "The quick brown fox leaps over the lazy dog.\nThis line stays the same.\nNew line that was added.";

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

function rowsToUnifiedText(rows: Row[]): string {
  const lines: string[] = [];
  for (const row of rows) {
    if (row.kind === "same") {
      lines.push(`  ${row.left ?? ""}`);
      continue;
    }
    if (row.left !== null) lines.push(`- ${row.left}`);
    if (row.right !== null) lines.push(`+ ${row.right}`);
  }
  return lines.join("\n");
}

export function TextDiff() {
  const [left, setLeft] = useState(SAMPLE_LEFT);
  const [right, setRight] = useState(SAMPLE_RIGHT);
  const [copied, setCopied] = useState(false);
  const [activeHunk, setActiveHunk] = useState(0);
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const rows = useMemo(() => {
    if (!left && !right) return null;
    return buildRows(diffLines(left, right));
  }, [left, right]);

  const hunkStarts = useMemo(() => (rows ? findHunkStarts(rows) : []), [rows]);
  const displayHunk =
    hunkStarts.length === 0 ? 0 : wrapIndex(activeHunk, hunkStarts.length);

  const stats = useMemo(() => {
    if (!rows) return null;
    const added = rows.filter((r) => r.kind === "change" && r.right !== null).length;
    const removed = rows.filter((r) => r.kind === "change" && r.left !== null).length;
    return { added, removed };
  }, [rows]);

  const scrollToHunk = useCallback(
    (hunkIndex: number) => {
      if (!rows || hunkStarts.length === 0) return;
      const wrapped = wrapIndex(hunkIndex, hunkStarts.length);
      setActiveHunk(wrapped);
      rowRefs.current.get(hunkStarts[wrapped])?.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
    },
    [rows, hunkStarts]
  );

  const goPrev = useCallback(
    () => scrollToHunk(displayHunk - 1),
    [scrollToHunk, displayHunk]
  );
  const goNext = useCallback(
    () => scrollToHunk(displayHunk + 1),
    [scrollToHunk, displayHunk]
  );

  useEffect(() => {
    if (hunkStarts.length === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.key === "]") {
        e.preventDefault();
        goNext();
      } else if (e.key === "[") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hunkStarts.length, goNext, goPrev]);

  const handleCopyDiff = useCallback(async () => {
    if (!rows) return;
    try {
      await navigator.clipboard.writeText(rowsToUnifiedText(rows));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }, [rows]);

  const activeRange =
    rows && hunkStarts.length > 0 ? hunkRange(rows, hunkStarts[displayHunk]) : null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <Breadcrumb current={tool.name} />
        {stats && (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-[#22c55e]">+{stats.added} added</span>
            <span className="text-[#ef4444]">−{stats.removed} removed</span>
          </div>
        )}
      </div>

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

      {rows && (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="flex justify-start">
              <button
                type="button"
                onClick={handleCopyDiff}
                className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                  copied
                    ? "text-[#22c55e] border-[#22c55e]/40"
                    : "text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-primary)]"
                }`}
              >
                {copied ? "Copied ✓" : "Copy diff"}
              </button>
            </div>
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider text-center">
              Comparison
            </label>
            <div className="flex justify-end">
              {hunkStarts.length > 0 && (
                <div className="flex items-center gap-1.5" role="group" aria-label="Navigate differences">
                  <button
                    type="button"
                    onClick={goPrev}
                    className="px-2.5 py-1 rounded-md text-xs font-medium border border-[#6366f1]/45 bg-[#6366f1]/10 text-[var(--accent-text)] hover:bg-[#6366f1]/20 transition-colors"
                    aria-label="Previous difference"
                  >
                    ↑ Prev
                  </button>
                  <span className="text-xs text-[var(--text-muted)] mono tabular-nums min-w-[4.5rem] text-center">
                    {displayHunk + 1} of {hunkStarts.length}
                  </span>
                  <button
                    type="button"
                    onClick={goNext}
                    className="px-2.5 py-1 rounded-md text-xs font-medium border border-[#22c55e]/45 bg-[#22c55e]/10 text-[#22c55e] hover:bg-[#22c55e]/20 transition-colors"
                    aria-label="Next difference"
                  >
                    ↓ Next
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] overflow-auto max-h-[70vh]">
            <div className="grid grid-cols-2 text-[10px] uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border)] sticky top-0 bg-[var(--bg-surface)] z-10">
              <div className="px-4 py-1.5 border-r border-[var(--border)]">Original</div>
              <div className="px-4 py-1.5">Modified</div>
            </div>
            <div className="mono text-sm leading-relaxed">
              {rows.map((row, i) => {
                const inActive =
                  activeRange !== null && i >= activeRange.start && i <= activeRange.end;
                const isHunkStart = inActive && activeRange !== null && i === activeRange.start;
                const isHunkEnd = inActive && activeRange !== null && i === activeRange.end;
                return (
                  <div
                    key={i}
                    ref={(el) => {
                      if (el) rowRefs.current.set(i, el);
                      else rowRefs.current.delete(i);
                    }}
                    className={`grid grid-cols-2 ${activeHunkRowClass(inActive, isHunkStart, isHunkEnd)}`}
                  >
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
                      <span
                        className={`flex-1 px-2 whitespace-pre-wrap break-words ${
                          row.left !== null && row.kind === "change"
                            ? "text-[#ef4444]"
                            : "text-[var(--text-primary)]"
                        }`}
                      >
                        {row.left ?? ""}
                      </span>
                    </div>
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
                      <span
                        className={`flex-1 px-2 whitespace-pre-wrap break-words ${
                          row.right !== null && row.kind === "change"
                            ? "text-[#22c55e]"
                            : "text-[var(--text-primary)]"
                        }`}
                      >
                        {row.right ?? ""}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {hunkStarts.length > 0 && (
            <p className="text-[10px] text-[var(--text-muted)]">
              Tip: press <span className="mono">[</span> / <span className="mono">]</span> to jump
              between changes
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setLeft("");
            setRight("");
            setActiveHunk(0);
          }}
          disabled={!left && !right}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#ef4444]/40 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 hover:border-[#ef4444]/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Clear all
        </button>
        <button
          type="button"
          onClick={() => {
            const t = left;
            setLeft(right);
            setRight(t);
          }}
          disabled={!left && !right}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Swap
        </button>
        <button
          type="button"
          onClick={() => {
            setLeft(SAMPLE_LEFT);
            setRight(SAMPLE_RIGHT);
          }}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
      </div>
    </div>
  );
}
