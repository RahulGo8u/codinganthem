"use client";

import { useState, useMemo } from "react";
import { css as beautifyCss } from "js-beautify";
import { ToolShell } from "@/components/ToolShell";
import { SegmentedControl } from "@/components/SegmentedControl";
import { getToolBySlug } from "@/lib/tools";
import { HighlightedOutput } from "@/lib/highlight";

const tool = getToolBySlug("css-formatter")!;

const SAMPLE = `body{margin:0;font-family:sans-serif}.container{max-width:1200px;margin:0 auto;padding:1rem}.btn{background:#6366f1;color:#fff;border:none;border-radius:8px;padding:8px 16px}`;

function minifyCss(input: string): string {
  return input
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

export function CssFormatter() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"beautify" | "minify">("beautify");
  const [indent, setIndent] = useState<"2" | "4">("2");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: undefined };
    try {
      const result =
        mode === "minify"
          ? minifyCss(input)
          : beautifyCss(input, { indent_size: Number(indent) });
      return { output: result, error: undefined };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not format CSS.";
      return { output: "", error: `Could not format CSS: ${msg}` };
    }
  }, [input, mode, indent]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      error={error}
      downloadFileName="formatted.css"
      downloadMimeType="text/css"
      inputLabel="CSS"
      outputLabel="Formatted"
      inputPlaceholder="Paste minified or messy CSS here..."
      outputPlaceholder="Formatted CSS will appear here..."
      outputContent={
        output ? (
          <div className="overflow-x-auto">
            <HighlightedOutput code={output} lang="css" />
          </div>
        ) : (
          <p className="p-4 text-[var(--text-muted)] text-sm">Formatted CSS will appear here...</p>
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
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            label="Format mode"
            value={mode}
            onChange={setMode}
            segments={[
              { value: "beautify", label: "Beautify" },
              { value: "minify", label: "Minify" },
            ]}
          />
          {mode === "beautify" && (
            <SegmentedControl
              label="Indent size"
              value={indent}
              onChange={setIndent}
              compact
              segments={[
                { value: "2", label: "2 spaces" },
                { value: "4", label: "4 spaces" },
              ]}
            />
          )}
        </div>
      }
    />
  );
}
