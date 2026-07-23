"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { diffLines } from "diff";
import { getToolBySlug } from "@/lib/tools";
import { Breadcrumb } from "@/components/Breadcrumb";

const tool = getToolBySlug("json-diff")!;

const SAMPLE_LEFT = '{\n  "name": "Alice",\n  "age": 30,\n  "city": "London"\n}';
const SAMPLE_RIGHT = '{\n  "name": "Alice",\n  "age": 31,\n  "city": "Paris",\n  "active": true\n}';

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

interface Row {
  left: string | null;
  right: string | null;
  leftNo: number | null;
  rightNo: number | null;
  kind: "same" | "change";
}

function splitLines(value: string): string[] {
  const lines = value.split("\n");
  if (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

function buildRows(leftNorm: string, rightNorm: string): Row[] {
  const diff = diffLines(leftNorm, rightNorm);
  const rows: Row[] = [];
  let dels: string[] = [];
  let adds: string[] = [];
  let ln = 0;
  let rn = 0;

  const flush = () => {
    const n = Math.max(dels.length, adds.length);
    for (let i = 0; i < n; i++) {
      const l = i < dels.length ? dels[i] : null;
      const r = i < adds.length ? adds[i] : null;
      rows.push({
        left: l,
        right: r,
        leftNo: l !== null ? ++ln : null,
        rightNo: r !== null ? ++rn : null,
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
      for (const line of lines) {
        rows.push({ left: line, right: line, leftNo: ++ln, rightNo: ++rn, kind: "same" });
      }
    }
  }
  flush();
  return rows;
}

/** Row indices where each contiguous change block begins. */
function findHunkStarts(rows: Row[]): number[] {
  const starts: number[] = [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].kind === "change" && (i === 0 || rows[i - 1].kind !== "change")) {
      starts.push(i);
    }
  }
  return starts;
}

function hunkRange(rows: Row[], start: number): { start: number; end: number } {
  let end = start;
  while (end + 1 < rows.length && rows[end + 1].kind === "change") end++;
  return { start, end };
}

export function JsonDiff() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [activeHunk, setActiveHunk] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const { rows, leftError, rightError } = useMemo(() => {
    if (!left.trim() && !right.trim()) {
      return { rows: null as Row[] | null, leftError: undefined, rightError: undefined };
    }
    let leftNorm = "";
    let rightNorm = "";
    let lE: string | undefined;
    let rE: string | undefined;

    try {
      leftNorm = left.trim() ? normalizeJson(left) : "";
    } catch (e) {
      lE = (e as Error).message;
    }

    try {
      rightNorm = right.trim() ? normalizeJson(right) : "";
    } catch (e) {
      rE = (e as Error).message;
    }

    if (lE || rE || (!leftNorm && !rightNorm)) {
      return { rows: null, leftError: lE, rightError: rE };
    }
    return { rows: buildRows(leftNorm, rightNorm), leftError: lE, rightError: rE };
  }, [left, right]);

  const hunkStarts = useMemo(() => (rows ? findHunkStarts(rows) : []), [rows]);

  const stats = useMemo(() => {
    if (!rows) return null;
    const added = rows.filter((r) => r.kind === "change" && r.right !== null).length;
    const removed = rows.filter((r) => r.kind === "change" && r.left !== null).length;
    return { added, removed };
  }, [rows]);

  // Reset navigator when the diff set changes
  useEffect(() => {
    setActiveHunk(0);
  }, [rows]);

  const scrollToHunk = useCallback(
    (hunkIndex: number) => {
      if (!rows || hunkStarts.length === 0) return;
      const wrapped = ((hunkIndex % hunkStarts.length) + hunkStarts.length) % hunkStarts.length;
      setActiveHunk(wrapped);
      const rowIndex = hunkStarts[wrapped];
      const el = rowRefs.current.get(rowIndex);
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
    },
    [rows, hunkStarts]
  );

  const goPrev = () => scrollToHunk(activeHunk - 1);
  const goNext = () => scrollToHunk(activeHunk + 1);

  const activeRange =
    rows && hunkStarts.length > 0
      ? hunkRange(rows, hunkStarts[Math.min(activeHunk, hunkStarts.length - 1)])
      : null;

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
          { label: "Original JSON", value: left, set: setLeft, err: leftError },
          { label: "Modified JSON", value: right, set: setRight, err: rightError },
        ].map(({ label, value, set, err }) => (
          <div key={label} className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
              {label}
            </label>
            <textarea
              value={value}
              onChange={(e) => set(e.target.value)}
              placeholder={`Paste ${label.toLowerCase()} here...`}
              spellCheck={false}
              className={`mono min-h-[160px] p-4 rounded-lg border ${err ? "border-[#ef4444]" : "border-[var(--border)]"} bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none leading-relaxed`}
            />
            {err && <p className="text-xs text-[#ef4444] leading-relaxed">{err}</p>}
          </div>
        ))}
      </div>

      {rows && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
              Diff
            </label>
            {hunkStarts.length > 0 && (
              <div className="flex items-center gap-1.5" role="group" aria-label="Navigate differences">
                <button
                  type="button"
                  onClick={goPrev}
                  className="px-2.5 py-1 rounded-md text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                  aria-label="Previous difference"
                >
                  ↑ Prev
                </button>
                <span className="text-xs text-[var(--text-muted)] mono tabular-nums min-w-[4.5rem] text-center">
                  {activeHunk + 1} of {hunkStarts.length}
                </span>
                <button
                  type="button"
                  onClick={goNext}
                  className="px-2.5 py-1 rounded-md text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                  aria-label="Next difference"
                >
                  ↓ Next
                </button>
              </div>
            )}
          </div>

          <div
            ref={scrollRef}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] overflow-auto max-h-[70vh]"
          >
            <div className="grid grid-cols-2 text-[10px] uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border)] sticky top-0 bg-[var(--bg-surface)] z-10">
              <div className="px-4 py-1.5 border-r border-[var(--border)]">Original</div>
              <div className="px-4 py-1.5">Modified</div>
            </div>
            <div className="mono text-sm leading-relaxed">
              {rows.map((row, i) => {
                const inActive =
                  activeRange !== null && i >= activeRange.start && i <= activeRange.end;
                return (
                  <div
                    key={i}
                    ref={(el) => {
                      if (el) rowRefs.current.set(i, el);
                      else rowRefs.current.delete(i);
                    }}
                    data-diff-row={i}
                    className={`grid grid-cols-2 ${
                      inActive ? "ring-2 ring-inset ring-[#6366f1]/55 bg-[#6366f1]/5" : ""
                    }`}
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
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setLeft("");
            setRight("");
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
