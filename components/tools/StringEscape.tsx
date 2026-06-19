"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("string-escape")!;

function escapeString(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(/\0/g, "\\0")
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, (c) =>
      "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0")
    );
}

function unescapeString(str: string): string {
  return str
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\0/g, "\0")
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

export function StringEscape() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"escape" | "unescape">("escape");

  const output = useMemo(() => {
    if (!input) return "";
    return mode === "escape" ? escapeString(input) : unescapeString(input);
  }, [input, mode]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      inputLabel={mode === "escape" ? "Raw string" : "Escaped string"}
      outputLabel={mode === "escape" ? "Escaped" : "Unescaped"}
      inputPlaceholder={
        mode === "escape"
          ? 'He said "hello"\nNew line here\tTabbed'
          : 'He said \\"hello\\"\\nNew line here\\tTabbed'
      }
      outputPlaceholder="Output will appear here..."
      options={
        <div className="flex rounded-lg border border-[var(--border)] overflow-hidden text-xs">
          {(["escape", "unescape"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 capitalize transition-colors ${
                mode === m
                  ? "bg-[#6366f1]/15 text-[#6366f1]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      }
    />
  );
}
