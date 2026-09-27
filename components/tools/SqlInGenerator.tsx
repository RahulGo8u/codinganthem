"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { SegmentedControl } from "@/components/SegmentedControl";
import { getToolBySlug } from "@/lib/tools";
import { HighlightedOutput } from "@/lib/highlight";

const tool = getToolBySlug("sql-in-generator")!;

const SAMPLE = `1001\n1002\n1003\n1004\n1005`;
const LARGE_WARN = 500;

export function SqlInGenerator() {
  const [input, setInput] = useState("");
  const [column, setColumn] = useState("id");
  const [quote, setQuote] = useState(false);
  const [withWhere, setWithWhere] = useState(true);
  const [negated, setNegated] = useState(false);

  const { output, valueCount, duplicateCount, warning } = useMemo(() => {
    const raw = input
      .split(/[\n,]/)
      .map((v) => v.trim())
      .filter((v) => v !== "");
    if (raw.length === 0) {
      return {
        output: "",
        valueCount: 0,
        duplicateCount: 0,
        warning: undefined as string | undefined,
      };
    }

    const seen = new Set<string>();
    let duplicateCount = 0;
    for (const v of raw) {
      if (seen.has(v)) duplicateCount++;
      else seen.add(v);
    }

    const values = [...seen];
    const escaped = values.map((v) => (quote ? `'${v.replace(/'/g, "''")}'` : v));
    const list = escaped.join(", ");
    const op = negated ? "NOT IN" : "IN";
    const clause = `${column || "id"} ${op} (${list})`;
    const output = withWhere ? `WHERE ${clause}` : clause;
    const warning =
      values.length >= LARGE_WARN
        ? `Large IN list (${values.length} values) — consider a temp table or JOIN for performance.`
        : undefined;

    return { output, valueCount: values.length, duplicateCount, warning };
  }, [input, column, quote, withWhere, negated]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      error={warning}
      hideFileActions
      showClear
      downloadFileName="in-clause.sql"
      downloadMimeType="application/sql"
      inputLabel="Values (one per line)"
      outputLabel="SQL IN clause"
      inputPlaceholder={"1001\n1002\n1003"}
      outputPlaceholder="Generated SQL IN clause will appear here..."
      outputContent={
        output ? (
          <div className="flex flex-col">
            <p
              role="status"
              className="px-4 py-2 text-[10px] uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border)]"
            >
              {valueCount} unique value{valueCount === 1 ? "" : "s"}
              {duplicateCount > 0 ? ` · ${duplicateCount} duplicate${duplicateCount === 1 ? "" : "s"} removed` : ""}
            </p>
            <HighlightedOutput code={output} lang="sql" />
          </div>
        ) : (
          <p className="p-4 text-[var(--text-muted)] text-sm">Generated SQL IN clause will appear here...</p>
        )
      }
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
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
            Column
            <input
              type="text"
              value={column}
              onChange={(e) => setColumn(e.target.value)}
              placeholder="id"
              className="mono w-32 bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--text-primary)]"
            />
          </label>
          <SegmentedControl
            label="IN or NOT IN"
            value={negated ? "not-in" : "in"}
            onChange={(v) => setNegated(v === "not-in")}
            compact
            segments={[
              { value: "in", label: "IN" },
              { value: "not-in", label: "NOT IN" },
            ]}
          />
          <label className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={quote}
              onChange={(e) => setQuote(e.target.checked)}
              className="accent-[#6366f1]"
            />
            Quote values (for strings)
          </label>
          <label className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={withWhere}
              onChange={(e) => setWithWhere(e.target.checked)}
              className="accent-[#6366f1]"
            />
            Add WHERE prefix
          </label>
        </div>
      }
    />
  );
}
