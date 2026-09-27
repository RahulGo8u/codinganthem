"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("json-statistics")!;

interface JsonStats {
  totalNodes: number;
  maxDepth: number;
  deepestPath: string;
  largestArrayPath: string;
  largestArrayLength: number;
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

function walk(
  val: unknown,
  depth: number,
  path: string,
  stats: JsonStats
): void {
  stats.totalNodes++;
  const type = getType(val);
  stats.types[type] = (stats.types[type] ?? 0) + 1;
  if (depth > stats.maxDepth) {
    stats.maxDepth = depth;
    stats.deepestPath = path || "(root)";
  }

  if (Array.isArray(val)) {
    stats.arrayCount++;
    stats.totalArrayItems += val.length;
    if (val.length > stats.largestArrayLength) {
      stats.largestArrayLength = val.length;
      stats.largestArrayPath = path || "(root)";
    }
    val.forEach((item, i) => walk(item, depth + 1, `${path}[${i}]`, stats));
  } else if (val !== null && typeof val === "object") {
    stats.objectCount++;
    const entries = Object.entries(val as Record<string, unknown>);
    stats.totalKeys += entries.length;
    entries.forEach(([k, v]) => {
      const next = path ? `${path}.${k}` : k;
      walk(v, depth + 1, next, stats);
    });
  }
}

function analyzeJson(input: string): JsonStats {
  const parsed = JSON.parse(input);
  const stats: JsonStats = {
    totalNodes: 0,
    maxDepth: 0,
    deepestPath: "(root)",
    largestArrayPath: "—",
    largestArrayLength: 0,
    sizeBytes: new TextEncoder().encode(input).length,
    types: {},
    objectCount: 0,
    arrayCount: 0,
    totalKeys: 0,
    totalArrayItems: 0,
  };
  walk(parsed, 0, "", stats);
  return stats;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function friendlyJsonError(err: unknown, input: string): string {
  const msg = err instanceof Error ? err.message : "Invalid JSON";
  const match = /position\s+(\d+)/i.exec(msg);
  if (!match) return msg.startsWith("JSON") || msg.includes("JSON") ? msg : `Invalid JSON: ${msg}`;
  const pos = Number(match[1]);
  let line = 1;
  let col = 1;
  for (let i = 0; i < pos && i < input.length; i++) {
    if (input[i] === "\n") {
      line++;
      col = 1;
    } else {
      col++;
    }
  }
  return `Invalid JSON at line ${line}, column ${col}. ${msg}`;
}

const TYPE_COLORS: Record<string, string> = {
  string: "#6366f1",
  number: "#22c55e",
  boolean: "#f59e0b",
  null: "#ef4444",
  object: "#3b82f6",
  array: "#8b5cf6",
};

const SAMPLE =
  '{"id":1,"name":"CodingAnthem","tags":["fast","free","private"],"active":true,"meta":{"stars":2400,"forks":680,"license":"MIT","contributors":[{"name":"Alice"},{"name":"Bob"}]},"score":null}';

export function JsonStatistics() {
  const [input, setInput] = useState("");

  const { stats, error, report } = useMemo(() => {
    if (!input.trim()) return { stats: null, error: undefined, report: "" };
    try {
      const s = analyzeJson(input);
      const reportLines = [
        `Total nodes: ${s.totalNodes}`,
        `Maximum depth: ${s.maxDepth}`,
        `Deepest path: ${s.deepestPath}`,
        `Largest array: ${s.largestArrayPath} (${s.largestArrayLength} items)`,
        `File size: ${formatBytes(s.sizeBytes)}`,
        `Objects: ${s.objectCount}`,
        `Total keys: ${s.totalKeys}`,
        `Arrays: ${s.arrayCount}`,
        `Total array items: ${s.totalArrayItems}`,
        "",
        "Type distribution:",
        ...Object.entries(s.types)
          .sort(([, a], [, b]) => b - a)
          .map(([type, count]) => `  ${type}: ${count}`),
      ];
      return { stats: s, error: undefined, report: reportLines.join("\n") };
    } catch (e) {
      return { stats: null, error: friendlyJsonError(e, input), report: "" };
    }
  }, [input]);

  const summaryRows = stats
    ? [
        { label: "Total nodes", value: stats.totalNodes.toLocaleString() },
        { label: "Maximum depth", value: String(stats.maxDepth) },
        { label: "Deepest path", value: stats.deepestPath },
        {
          label: "Largest array",
          value:
            stats.largestArrayLength > 0
              ? `${stats.largestArrayPath} (${stats.largestArrayLength})`
              : "—",
        },
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
      output={report}
      onInputChange={setInput}
      error={error}
      downloadFileName="json-statistics.txt"
      downloadMimeType="text/plain"
      inputLabel="JSON"
      outputLabel="Statistics"
      inputPlaceholder="Paste your JSON here..."
      extraActions={
        <button
          type="button"
          onClick={() => setInput(SAMPLE)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
      }
      outputContent={
        stats ? (
          <div className="p-4 flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3">
              {summaryRows.map(({ label, value }) => (
                <div key={label} className="result-card flex flex-col gap-1">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                    {label}
                  </span>
                  <span className="text-sm sm:text-lg font-semibold text-[var(--text-primary)] mono break-all">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="result-card flex flex-col gap-2">
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Type distribution
              </p>
              {Object.entries(stats.types)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => {
                  const pct = Math.round((count / stats.totalNodes) * 100);
                  return (
                    <div key={type} className="flex items-center gap-3">
                      <span className="text-xs w-16 text-[var(--text-muted)] capitalize">{type}</span>
                      <div
                        className="flex-1 h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden"
                        role="meter"
                        aria-label={`${type}: ${count.toLocaleString()} (${pct}%)`}
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
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
          <p className="p-4 text-[var(--text-muted)] text-sm">
            Statistics will appear here after you paste JSON...
          </p>
        )
      }
    />
  );
}
