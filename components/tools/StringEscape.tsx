"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { SegmentedControl } from "@/components/SegmentedControl";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("string-escape")!;

const SAMPLES = {
  escape: 'He said "hello"\nNew line here\tTabbed',
  unescape: 'He said \\"hello\\"\\nNew line here\\tTabbed',
};

function escapeGeneric(str: string): string {
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

function escapeJson(str: string): string {
  return JSON.stringify(str).slice(1, -1);
}

function unescapeString(str: string): { value: string; warning?: string } {
  const unknown: string[] = [];
  const value = str
    .replace(/\\\\/g, "\x00BSLASH\x00")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\0/g, "\0")
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\(.)/g, (_, ch: string) => {
      unknown.push(`\\${ch}`);
      return ch;
    })
    .replace(/\x00BSLASH\x00/g, "\\");

  const unique = [...new Set(unknown)].slice(0, 5);
  return {
    value,
    warning:
      unique.length > 0
        ? `Unrecognized escape sequence${unique.length > 1 ? "s" : ""}: ${unique.join(", ")}`
        : undefined,
  };
}

export function StringEscape() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"escape" | "unescape">("escape");
  const [flavor, setFlavor] = useState<"generic" | "json">("generic");

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: undefined };
    if (mode === "escape") {
      return {
        output: flavor === "json" ? escapeJson(input) : escapeGeneric(input),
        error: undefined,
      };
    }
    const result = unescapeString(input);
    return { output: result.value, error: result.warning };
  }, [input, mode, flavor]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      error={error}
      downloadFileName={mode === "escape" ? "escaped.txt" : "unescaped.txt"}
      inputLabel={mode === "escape" ? "Raw string" : "Escaped string"}
      outputLabel={mode === "escape" ? "Escaped" : "Unescaped"}
      inputPlaceholder={
        mode === "escape"
          ? 'He said "hello"\nNew line here\tTabbed'
          : 'He said \\"hello\\"\\nNew line here\\tTabbed'
      }
      outputPlaceholder="Output will appear here..."
      extraActions={
        <button
          type="button"
          onClick={() => setInput(SAMPLES[mode])}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
      }
      options={
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            label="Escape or unescape"
            value={mode}
            onChange={setMode}
            segments={[
              { value: "escape", label: "Escape" },
              { value: "unescape", label: "Unescape" },
            ]}
          />
          {mode === "escape" && (
            <SegmentedControl
              label="Escape style"
              value={flavor}
              onChange={setFlavor}
              compact
              segments={[
                { value: "generic", label: "Generic" },
                { value: "json", label: "JSON" },
              ]}
            />
          )}
        </div>
      }
    />
  );
}
