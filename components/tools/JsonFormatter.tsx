"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { SegmentedControl } from "@/components/SegmentedControl";
import { getToolBySlug } from "@/lib/tools";
import { HighlightedOutput } from "@/lib/highlight";

const tool = getToolBySlug("json-formatter")!;

const SAMPLE = `{"id":1,"name":"CodingAnthem","tags":["fast","free"],"active":true,"meta":{"stars":2400,"license":"MIT"}}`;

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value !== null && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return Object.keys(obj)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortKeys(obj[key]);
        return acc;
      }, {});
  }
  return value;
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

export function JsonFormatter() {
  const [input, setInput] = useState(SAMPLE);
  const [mode, setMode] = useState<"beautify" | "minify">("beautify");
  const [sortKeysEnabled, setSortKeysEnabled] = useState(false);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: undefined };
    try {
      const parsed = JSON.parse(input);
      const value = sortKeysEnabled ? sortKeys(parsed) : parsed;
      const result =
        mode === "minify"
          ? JSON.stringify(value)
          : JSON.stringify(value, null, 2);
      return { output: result, error: undefined };
    } catch (e) {
      return { output: "", error: friendlyJsonError(e, input) };
    }
  }, [input, mode, sortKeysEnabled]);

  const isValid = input.trim() !== "" && !error;

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      error={error}
      downloadFileName="formatted.json"
      downloadMimeType="application/json"
      inputPlaceholder={'Paste your JSON here...\n\n{"name": "codinganthem", "type": "dev tools"}'}
      outputPlaceholder="Formatted JSON will appear here..."
      extraActions={
        <button
          type="button"
          onClick={() => setInput(SAMPLE)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
      }
      options={
        <div className="flex items-center justify-between w-full gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <SegmentedControl
              label="Format mode"
              value={mode}
              onChange={setMode}
              segments={[
                { value: "beautify", label: "Beautify" },
                { value: "minify", label: "Minify" },
              ]}
            />
            <label className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sortKeysEnabled}
                onChange={(e) => setSortKeysEnabled(e.target.checked)}
                className="accent-[#6366f1]"
              />
              Sort keys
            </label>
          </div>

          {input.trim() !== "" && (
            <span
              role="status"
              aria-live="polite"
              className={`flex items-center gap-1.5 text-xs font-medium ${
                isValid ? "text-[#22c55e]" : "text-[#ef4444]"
              }`}
            >
              <span aria-hidden="true">{isValid ? "●" : "✕"}</span>
              {isValid ? "Valid JSON" : "Invalid JSON"}
            </span>
          )}
        </div>
      }
      outputContent={
        error ? (
          <div className="flex flex-col">
            <div
              role="alert"
              className="flex items-start gap-2 px-4 py-2.5 bg-[#ef4444]/10 border-b border-[#ef4444]/30 text-xs text-[#ef4444] leading-relaxed"
            >
              <span className="shrink-0" aria-hidden="true">
                ⚠
              </span>
              <span>{error}</span>
            </div>
          </div>
        ) : output ? (
          <HighlightedOutput code={output} />
        ) : (
          <p className="p-4 text-[var(--text-muted)] text-sm">
            Formatted JSON will appear here...
          </p>
        )
      }
    />
  );
}
