"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("timestamp-converter")!;

const SAMPLE_TIMESTAMP = "1718822400";

export function TimestampConverter() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"to-date" | "to-unix">("to-date");

  const { rows, error } = useMemo<{
    rows: { label: string; value: string }[] | null;
    error: string | undefined;
  }>(() => {
    if (!input.trim()) return { rows: null, error: undefined };

    if (mode === "to-date") {
      const num = Number(input.trim());
      if (isNaN(num)) return { rows: null, error: "Enter a valid Unix timestamp (e.g. 1718822400)" };
      const ms = num > 1e12 ? num : num * 1000;
      const d = new Date(ms);
      if (isNaN(d.getTime())) return { rows: null, error: "Invalid timestamp" };
      return {
        rows: [
          { label: "Local", value: d.toLocaleString() },
          { label: "UTC", value: d.toUTCString() },
          { label: "ISO 8601", value: d.toISOString() },
          { label: "Unix (s)", value: String(Math.floor(ms / 1000)) },
          { label: "Unix (ms)", value: String(ms) },
          { label: "Relative", value: relativeTime(ms) },
        ],
        error: undefined,
      };
    } else {
      const d = new Date(input.trim());
      if (isNaN(d.getTime())) return { rows: null, error: "Invalid date string. Try: 2026-06-19 or June 19 2026" };
      return {
        rows: [
          { label: "Unix (s)", value: String(Math.floor(d.getTime() / 1000)) },
          { label: "Unix (ms)", value: String(d.getTime()) },
          { label: "ISO 8601", value: d.toISOString() },
          { label: "UTC", value: d.toUTCString() },
          { label: "Local", value: d.toLocaleString() },
        ],
        error: undefined,
      };
    }
  }, [input, mode]);

  const output = rows ? rows.map((r) => `${r.label}: ${r.value}`).join("\n") : "";
  const now = Math.floor(Date.now() / 1000);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      error={error}
      hideFileActions
      showClear
      inputLabel={mode === "to-date" ? "Unix Timestamp" : "Date / Time String"}
      outputLabel="Result"
      inputPlaceholder={
        mode === "to-date"
          ? `Enter Unix timestamp (e.g. ${now})`
          : "Enter date string (e.g. 2026-06-19T00:00:00Z)"
      }
      outputPlaceholder="Conversion result will appear here..."
      outputContent={
        rows ? (
          <div className="p-4 flex flex-col">
            {rows.map(({ label, value }) => (
              <div
                key={label}
                className="flex items-start gap-3 py-2.5 border-b border-[var(--border)] last:border-0"
              >
                <span className="text-xs text-[var(--text-muted)] w-24 shrink-0 pt-0.5 uppercase tracking-wider">
                  {label}
                </span>
                <span className="text-sm text-[var(--text-primary)] mono break-all">{value}</span>
              </div>
            ))}
          </div>
        ) : undefined
      }
      options={
        <>
          <div className="flex rounded-lg border border-[var(--border)] overflow-hidden text-xs">
            <button
              onClick={() => setMode("to-date")}
              className={`px-3 py-1.5 transition-colors ${
                mode === "to-date"
                  ? "bg-[#6366f1]/15 text-[#6366f1]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
              }`}
            >
              Timestamp → Date
            </button>
            <button
              onClick={() => setMode("to-unix")}
              className={`px-3 py-1.5 transition-colors ${
                mode === "to-unix"
                  ? "bg-[#6366f1]/15 text-[#6366f1]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
              }`}
            >
              Date → Timestamp
            </button>
          </div>
          <button
            onClick={() => { setMode("to-date"); setInput(String(now)); }}
            className="px-3 py-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Use current time
          </button>
          <button
            onClick={() => { setMode("to-date"); setInput(SAMPLE_TIMESTAMP); }}
            className="px-3 py-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Load sample
          </button>
        </>
      }
    />
  );
}

function relativeTime(ms: number): string {
  const diff = ms - Date.now();
  const abs = Math.abs(diff);
  const units: [number, string][] = [
    [31536000000, "year"],
    [2592000000, "month"],
    [86400000, "day"],
    [3600000, "hour"],
    [60000, "minute"],
    [1000, "second"],
  ];
  for (const [unitMs, name] of units) {
    if (abs >= unitMs) {
      const n = Math.round(abs / unitMs);
      const plural = n !== 1 ? "s" : "";
      return diff < 0 ? `${n} ${name}${plural} ago` : `in ${n} ${name}${plural}`;
    }
  }
  return "just now";
}
