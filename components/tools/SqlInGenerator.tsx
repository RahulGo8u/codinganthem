"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("sql-in-generator")!;

const SAMPLE = `1001\n1002\n1003\n1004\n1005`;

export function SqlInGenerator() {
  const [input, setInput] = useState("");
  const [column, setColumn] = useState("id");
  const [quote, setQuote] = useState(false);
  const [withWhere, setWithWhere] = useState(true);

  const output = useMemo(() => {
    const values = input
      .split(/[\n,]/)
      .map((v) => v.trim())
      .filter((v) => v !== "");
    if (values.length === 0) return "";

    const escaped = values.map((v) =>
      quote ? `'${v.replace(/'/g, "''")}'` : v
    );
    const list = escaped.join(", ");
    const clause = `${column || "id"} IN (${list})`;
    return withWhere ? `WHERE ${clause}` : clause;
  }, [input, column, quote, withWhere]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      hideFileActions
      showClear
      inputLabel="Values (one per line)"
      outputLabel="SQL IN clause"
      inputPlaceholder={"1001\n1002\n1003"}
      outputPlaceholder="Generated SQL IN clause will appear here..."
      extraActions={
        <button
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
          <label className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs cursor-pointer select-none">
            <input type="checkbox" checked={quote} onChange={(e) => setQuote(e.target.checked)} className="accent-[#6366f1]" />
            Quote values (for strings)
          </label>
          <label className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs cursor-pointer select-none">
            <input type="checkbox" checked={withWhere} onChange={(e) => setWithWhere(e.target.checked)} className="accent-[#6366f1]" />
            Add WHERE prefix
          </label>
        </div>
      }
    />
  );
}
