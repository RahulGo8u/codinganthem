"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("json-statistics")!;

interface JsonStats {
  totalNodes: number;
  maxDepth: number;
  sizeBytes: number;
  types: Record<string, number>;
  objectCount: number;
  arrayCount: number;
  totalKeys: number;
  totalArrayItems: number;
}

function getType(val: unknown): string {
  if (val === null) return "null";
  if (Array.isArray(val)) return "array";
  return typeof val;
}

function walk(val: unknown, depth: number, stats: JsonStats): void {
  stats.totalNodes++;
  const type = getType(val);
  stats.types[type] = (stats.types[type] ?? 0) + 1;
  if (depth > stats.maxDepth) stats.maxDepth = depth;

  if (Array.isArray(val)) {
    stats.arrayCount++;
    stats.totalArrayItems += val.length;
    val.forEach((item) => walk(item, depth + 1, stats));
  } else if (val !== null && typeof val === "object") {
    stats.objectCount++;
    const entries = Object.entries(val as Record<string, unknown>);
    stats.totalKeys += entries.length;
    entries.forEach(([, v]) => walk(v, depth + 1, stats));
  }
}

function analyzeJson(input: string): JsonStats {
  const parsed = JSON.parse(input);
  const stats: JsonStats = {
    totalNodes: 0,
    maxDepth: 0,
    sizeBytes: new TextEncoder().encode(input).length,
    types: {},
    objectCount: 0,
    arrayCount: 0,
    totalKeys: 0,
    totalArrayItems: 0,
  };
  walk(parsed, 0, stats);
  return stats;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

const TYPE_COLORS: Record<string, string> = {
  string: "#6366f1",
  number: "#22c55e",
  boolean: "#f59e0b",
  null: "#ef4444",
  object: "#3b82f6",
  array: "#8b5cf6",
};

export function JsonStatistics() {
  const [input, setInput] = useState("");

  const { stats, error } = useMemo(() => {
    if (!input.trim()) return { stats: null, error: undefined };
    try {
      return { stats: analyzeJson(input), error: undefined };
    } catch (e) {
      return { stats: null, error: (e as Error).message };
    }
  }, [input]);

  const summaryRows = stats
    ? [
        { label: "Total nodes", value: stats.totalNodes.toLocaleString() },
        { label: "Maximum depth", value: stats.maxDepth },
        { label: "File size", value: formatBytes(stats.sizeBytes) },
        { label: "Objects", value: stats.objectCount.toLocaleString() },
        { label: "Total keys", value: stats.totalKeys.toLocaleString() },
        { label: "Arrays", value: stats.arrayCount.toLocaleString() },
        { label: "Total array items", value: stats.totalArrayItems.toLocaleString() },
      ]
    : [];

  return (
    <ToolShell
      tool={tool}
      input={input}
      output=""
      onInputChange={setInput}
      error={error}
      inputLabel="JSON"
      outputLabel="Statistics"
      inputPlaceholder="Paste your JSON here..."
      badges={<span className="badge badge-neutral">Client-side</span>}
      extraActions={
        <button
          onClick={() => setInput('{"id":1,"name":"CodingAnthem","tags":["fast","free","private"],"active":true,"meta":{"stars":2400,"forks":680,"license":"MIT","contributors":[{"name":"Alice"},{"name":"Bob"}]},"score":null}')}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
      }
      outputContent={
        stats ? (
          <div className="p-4 flex flex-col gap-5">
            {/* Summary grid */}
            <div className="grid grid-cols-2 gap-3">
              {summaryRows.map(({ label, value }) => (
                <div key={label} className="result-card flex flex-col gap-1">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{label}</span>
                  <span className="text-lg font-semibold text-[var(--text-primary)] mono">{value}</span>
                </div>
              ))}
            </div>

            {/* Type distribution */}
            <div className="result-card flex flex-col gap-2">
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Type distribution</p>
              {Object.entries(stats.types)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => {
                  const pct = Math.round((count / stats.totalNodes) * 100);
                  return (
                    <div key={type} className="flex items-center gap-3">
                      <span className="text-xs w-16 text-[var(--text-muted)] capitalize">{type}</span>
                      <div className="flex-1 h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: TYPE_COLORS[type] ?? "#6b7280",
                          }}
                        />
                      </div>
                      <span className="text-xs text-[var(--text-muted)] mono w-20 text-right">
                        {count.toLocaleString()} ({pct}%)
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        ) : (
          <p className="p-4 text-[var(--text-muted)] text-sm">Statistics will appear here after you paste JSON...</p>
        )
      }
    />
  );
}
