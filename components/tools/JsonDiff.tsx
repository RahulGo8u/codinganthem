"use client";

import { useState, useMemo } from "react";
import { diffLines } from "diff";
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
      rows.push({ left: l, right: r, leftNo: l !== null ? ++ln : null, rightNo: r !== null ? ++rn : null, kind: "change" });
    }
    dels = [];
    adds = [];
  };

  for (const part of diff) {
    const lines = splitLines(part.value);
    if (part.added) { adds.push(...lines); }
    else if (part.removed) { dels.push(...lines); }
    else {
      flush();
      for (const line of lines) {
        rows.push({ left: line, right: line, leftNo: ++ln, rightNo: ++rn, kind: "same" });
      }
    }
  }
  flush();
  return rows;
}

export function JsonDiff() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [leftError, setLeftError] = useState<string | undefined>();
  const [rightError, setRightError] = useState<string | undefined>();

  const rows = useMemo(() => {
    if (!left.trim() && !right.trim()) return null;
    let leftNorm = "";
    let rightNorm = "";
    let lErr: string | undefined;
    let rErr: string | undefined;

    try { leftNorm = left.trim() ? normalizeJson(left) : ""; }
    catch (e) { lErr = (e as Error).message; }

    try { rightNorm = right.trim() ? normalizeJson(right) : ""; }
    catch (e) { rErr = (e as Error).message; }

    setLeftError(lErr);
    setRightError(rErr);

    if (lErr || rErr || (!leftNorm && !rightNorm)) return null;
    return buildRows(leftNorm, rightNorm);
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
              className={`mono min-h-[160px] p-4 rounded-lg border ${err ? "border-[#ef4444]" : "border-[var(--border)]"} bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none leading-relaxed`}
            />
            {err && <p className="text-xs text-[#ef4444] leading-relaxed">{err}</p>}
          </div>
        ))}
      </div>

      {/* Side-by-side diff */}
      {rows && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Diff</label>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] overflow-auto">
            <div className="grid grid-cols-2 text-[10px] uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border)] sticky top-0 bg-[var(--bg-surface)]">
              <div className="px-4 py-1.5 border-r border-[var(--border)]">Original</div>
              <div className="px-4 py-1.5">Modified</div>
            </div>
            <div className="mono text-sm leading-relaxed">
              {rows.map((row, i) => (
                <div key={i} className="grid grid-cols-2">
                  <div className={`flex border-r border-[var(--border)] ${row.left === null ? "bg-[var(--bg-elevated)]/40" : row.kind === "change" ? "bg-[#ef4444]/10" : ""}`}>
                    <span className="select-none w-10 shrink-0 px-2 text-right text-[var(--text-muted)] opacity-50">{row.leftNo ?? ""}</span>
                    <span className={`flex-1 px-2 whitespace-pre-wrap break-words ${row.left !== null && row.kind === "change" ? "text-[#ef4444]" : "text-[var(--text-primary)]"}`}>
                      {row.left ?? ""}
                    </span>
                  </div>
                  <div className={`flex ${row.right === null ? "bg-[var(--bg-elevated)]/40" : row.kind === "change" ? "bg-[#22c55e]/10" : ""}`}>
                    <span className="select-none w-10 shrink-0 px-2 text-right text-[var(--text-muted)] opacity-50">{row.rightNo ?? ""}</span>
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
      <div className="flex items-center gap-2">
        <button
          onClick={() => { setLeft(""); setRight(""); setLeftError(undefined); setRightError(undefined); }}
          disabled={!left && !right}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Clear all
        </button>
        <button
          onClick={() => { const t = left; setLeft(right); setRight(t); setLeftError(undefined); setRightError(undefined); }}
          disabled={!left && !right}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Swap
        </button>
      </div>
    </div>
  );
}
