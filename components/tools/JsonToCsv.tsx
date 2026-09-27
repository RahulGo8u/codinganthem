"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("json-to-csv")!;

const SAMPLE = '[\n  {"name": "Alice", "age": 30},\n  {"name": "Bob", "age": 25}\n]';

function friendlyJsonError(err: unknown, input: string): string {
  const msg = err instanceof Error ? err.message : "Invalid JSON";
  if (
    msg.includes("must be") ||
    msg.includes("Array") ||
    msg.includes("Objects") ||
    msg.includes("empty")
  ) {
    return msg;
  }
  const match = /position\s+(\d+)/i.exec(msg);
  if (!match) return msg.includes("JSON") ? msg : `Invalid JSON: ${msg}`;
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

function toCsv(data: unknown): { csv: string; rowCount: number; headers: string[] } {
  if (!Array.isArray(data)) throw new Error("Input must be a JSON array of objects.");
  if (data.length === 0) throw new Error("Array is empty — nothing to convert.");
  if (data.some((item) => typeof item !== "object" || item === null || Array.isArray(item))) {
    throw new Error("All items in the array must be plain objects, not arrays or primitives.");
  }

  const headerSet = new Set<string>();
  (data as Record<string, unknown>[]).forEach((row) =>
    Object.keys(row).forEach((k) => headerSet.add(k))
  );
  const headers = Array.from(headerSet);
  if (headers.length === 0) throw new Error("Objects in the array have no keys.");

  const serialize = (val: unknown): string => {
    if (val === null || val === undefined) return "";
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  };

  const escape = (val: unknown): string => {
    const str = serialize(val);
    return str.includes(",") || str.includes('"') || str.includes("\n")
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };

  const rows = (data as Record<string, unknown>[]).map((row) =>
    headers.map((h) => escape(row[h])).join(",")
  );

  return {
    csv: [headers.join(","), ...rows].join("\n"),
    rowCount: rows.length,
    headers,
  };
}

export function JsonToCsv() {
  const [input, setInput] = useState("");

  const { output, error, rowCount, headers } = useMemo(() => {
    if (!input.trim()) {
      return { output: "", error: undefined, rowCount: 0, headers: [] as string[] };
    }
    try {
      const parsed = JSON.parse(input);
      const result = toCsv(parsed);
      return {
        output: result.csv,
        error: undefined,
        rowCount: result.rowCount,
        headers: result.headers,
      };
    } catch (e) {
      return {
        output: "",
        error: friendlyJsonError(e, input),
        rowCount: 0,
        headers: [],
      };
    }
  }, [input]);

  const previewRows = useMemo(() => {
    if (!output) return [];
    return output.split("\n").slice(0, 6);
  }, [output]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      error={error}
      downloadFileName="converted.csv"
      downloadMimeType="text/csv"
      inputLabel="JSON"
      outputLabel="CSV"
      inputPlaceholder={'[\n  {"name": "Alice", "age": 30},\n  {"name": "Bob", "age": 25}\n]'}
      outputPlaceholder="CSV output will appear here..."
      outputContent={
        output ? (
          <div className="p-4 flex flex-col gap-3">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              {rowCount} row{rowCount === 1 ? "" : "s"} · {headers.length} column
              {headers.length === 1 ? "" : "s"}
            </p>
            <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
              <table className="w-full text-xs mono text-left">
                <thead className="bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                  <tr>
                    {headers.map((h) => (
                      <th key={h} className="px-3 py-2 font-medium whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.slice(1).map((line, i) => {
                    const cells = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((c) =>
                      c.replace(/^"|"$/g, "").replace(/""/g, '"')
                    );
                    return (
                      <tr key={i} className="border-t border-[var(--border)]">
                        {headers.map((_, j) => (
                          <td
                            key={j}
                            className="px-3 py-2 text-[var(--text-primary)] whitespace-nowrap max-w-[200px] truncate"
                          >
                            {cells[j] ?? ""}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {rowCount > 5 && (
              <p className="text-[10px] text-[var(--text-muted)]">
                Showing first 5 rows · download for full CSV
              </p>
            )}
            <pre className="mono text-xs text-[var(--text-primary)] whitespace-pre-wrap break-all">
              {output}
            </pre>
          </div>
        ) : undefined
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
    />
  );
}
