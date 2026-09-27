"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { SegmentedControl } from "@/components/SegmentedControl";
import { getToolBySlug } from "@/lib/tools";
import { HighlightedOutput } from "@/lib/highlight";

const tool = getToolBySlug("csv-to-json")!;

const SAMPLE = "name,age,city\nAlice,30,New York\nBob,25,London";

type Delimiter = "," | "\t" | ";";

function parseCsv(
  csv: string,
  delimiter: Delimiter,
  hasHeader: boolean
): Record<string, string>[] {
  const allLines = csv.split(/\r?\n/);
  const lines = allLines.filter((l) => l.trim() !== "");
  if (lines.length < 1) throw new Error("CSV is empty.");
  if (hasHeader && lines.length < 2) {
    throw new Error("CSV must have at least a header row and one data row.");
  }

  const headers = hasHeader
    ? splitCsvLine(lines[0], delimiter)
    : splitCsvLine(lines[0], delimiter).map((_, i) => `column_${i + 1}`);
  if (headers.length === 0) throw new Error("No columns found in the first row.");

  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines.map((line, i) => {
    const values = splitCsvLine(line, delimiter);
    const row: Record<string, string> = {};
    headers.forEach((header, j) => {
      row[header] = values[j] ?? "";
    });
    if (values.length > headers.length) {
      throw new Error(
        `Row ${hasHeader ? i + 2 : i + 1} has more columns (${values.length}) than the header (${headers.length}).`
      );
    }
    return row;
  });
}

function splitCsvLine(line: string, delimiter: Delimiter): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  let wasQuoted = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
        wasQuoted = true;
      }
    } else if (ch === delimiter && !inQuotes) {
      fields.push(wasQuoted ? current : current.trim());
      current = "";
      wasQuoted = false;
    } else {
      current += ch;
    }
  }
  fields.push(wasQuoted ? current : current.trim());
  return fields;
}

export function CsvToJson() {
  const [input, setInput] = useState("");
  const [delimiter, setDelimiter] = useState<Delimiter>(",");
  const [hasHeader, setHasHeader] = useState(true);

  const { output, error, rowCount, preview } = useMemo(() => {
    if (!input.trim()) {
      return {
        output: "",
        error: undefined,
        rowCount: 0,
        preview: [] as Record<string, string>[],
      };
    }
    try {
      const result = parseCsv(input, delimiter, hasHeader);
      return {
        output: JSON.stringify(result, null, 2),
        error: undefined,
        rowCount: result.length,
        preview: result.slice(0, 5),
      };
    } catch (e) {
      return {
        output: "",
        error: (e as Error).message,
        rowCount: 0,
        preview: [],
      };
    }
  }, [input, delimiter, hasHeader]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      error={error}
      downloadFileName="converted.json"
      downloadMimeType="application/json"
      inputLabel="CSV"
      outputLabel="JSON"
      inputPlaceholder={"name,age,city\nAlice,30,New York\nBob,25,London"}
      outputPlaceholder="JSON output will appear here..."
      outputContent={
        output ? (
          <div className="flex flex-col">
            {rowCount > 0 && (
              <p className="px-4 py-2 text-[10px] uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border)]">
                {rowCount} row{rowCount === 1 ? "" : "s"}
                {preview.length > 0 && preview.length < rowCount
                  ? ` · previewing first ${preview.length}`
                  : ""}
              </p>
            )}
            <HighlightedOutput code={output} />
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
      options={
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            label="Delimiter"
            value={delimiter === "\t" ? "tab" : delimiter === ";" ? "semi" : "comma"}
            onChange={(v) =>
              setDelimiter(v === "tab" ? "\t" : v === "semi" ? ";" : ",")
            }
            compact
            segments={[
              { value: "comma", label: "Comma" },
              { value: "tab", label: "Tab" },
              { value: "semi", label: "Semicolon" },
            ]}
          />
          <label className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasHeader}
              onChange={(e) => setHasHeader(e.target.checked)}
              className="accent-[#6366f1]"
            />
            First row is header
          </label>
        </div>
      }
    />
  );
}
