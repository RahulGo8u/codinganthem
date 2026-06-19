"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("json-to-csv")!;

function toCsv(data: unknown): string {
  if (!Array.isArray(data)) throw new Error("Input must be a JSON array of objects.");
  if (data.length === 0) throw new Error("Array is empty — nothing to convert.");

  const headers = Object.keys(data[0] as object);
  if (headers.length === 0) throw new Error("Objects in the array have no keys.");

  const escape = (val: unknown): string => {
    const str = val === null || val === undefined ? "" : String(val);
    return str.includes(",") || str.includes('"') || str.includes("\n")
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };

  const rows = (data as Record<string, unknown>[]).map((row) =>
    headers.map((h) => escape(row[h])).join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

export function JsonToCsv() {
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: undefined };
    try {
      const parsed = JSON.parse(input);
      return { output: toCsv(parsed), error: undefined };
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
      inputLabel="JSON"
      outputLabel="CSV"
      inputPlaceholder={'[\n  {"name": "Alice", "age": 30},\n  {"name": "Bob", "age": 25}\n]'}
      outputPlaceholder="CSV output will appear here..."
    />
  );
}
