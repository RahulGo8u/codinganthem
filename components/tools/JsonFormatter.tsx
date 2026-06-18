"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("json-formatter")!;

export function JsonFormatter() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [minify, setMinify] = useState(false);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: undefined };
    try {
      const parsed = JSON.parse(input);
      const sorted = sortKeys ? sortObject(parsed) : parsed;
      const result = minify
        ? JSON.stringify(sorted)
        : JSON.stringify(sorted, null, indent);
      return { output: result, error: undefined };
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, indent, sortKeys, minify]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      error={error}
      inputPlaceholder='Paste your JSON here...\n\n{"name": "codinganthem", "type": "dev tools"}'
      outputPlaceholder="Formatted JSON will appear here..."
      options={
        <>
          <label className="flex items-center gap-2 text-[var(--text-muted)]">
            Indent
            <select
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
              disabled={minify}
              className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--text-primary)] disabled:opacity-40"
            >
              {[2, 4, 8].map((n) => (
                <option key={n} value={n}>
                  {n} spaces
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-[var(--text-muted)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sortKeys}
              onChange={(e) => setSortKeys(e.target.checked)}
              className="accent-[#6366f1]"
            />
            Sort keys
          </label>
          <label className="flex items-center gap-2 text-[var(--text-muted)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={minify}
              onChange={(e) => setMinify(e.target.checked)}
              className="accent-[#6366f1]"
            />
            Minify
          </label>
        </>
      }
    />
  );
}

function sortObject(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortObject);
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, sortObject(v)])
    );
  }
  return obj;
}
