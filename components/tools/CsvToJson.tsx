"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("csv-to-json")!;

function parseCsv(csv: string): Record<string, string>[] {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error("CSV must have at least a header row and one data row.");

  const headers = splitCsvLine(lines[0]);
  if (headers.length === 0) throw new Error("No headers found in the first row.");

  return lines.slice(1).map((line, i) => {
    const values = splitCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, j) => {
      row[header] = values[j] ?? "";
    });
    if (values.length > headers.length) {
      throw new Error(`Row ${i + 2} has more columns (${values.length}) than the header (${headers.length}).`);
    }
    return row;
  });
}

function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

export function CsvToJson() {
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: undefined };
    try {
      const result = parseCsv(input);
      return { output: JSON.stringify(result, null, 2), error: undefined };
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      error={error}
      inputLabel="CSV"
      outputLabel="JSON"
      inputPlaceholder={"name,age,city\nAlice,30,New York\nBob,25,London"}
      outputPlaceholder="JSON output will appear here..."
    />
  );
}
