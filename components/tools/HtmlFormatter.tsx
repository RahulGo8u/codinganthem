"use client";

import { useState, useMemo } from "react";
import { html as beautifyHtml } from "js-beautify";
import { ToolShell } from "@/components/ToolShell";
import { SegmentedControl } from "@/components/SegmentedControl";
import { getToolBySlug } from "@/lib/tools";
import { HighlightedOutput } from "@/lib/highlight";

const tool = getToolBySlug("html-formatter")!;

const SAMPLE = `<!DOCTYPE html><html><head><title>Demo</title></head><body><div class="container"><h1>Hello</h1><p>This is <strong>HTML</strong>.</p><ul><li>One</li><li>Two</li></ul></div></body></html>`;

function minifyHtml(input: string): string {
  return input
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function HtmlFormatter() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"beautify" | "minify">("beautify");
  const [indent, setIndent] = useState<"2" | "4">("2");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: undefined };
    try {
      const result =
        mode === "minify"
          ? minifyHtml(input)
          : beautifyHtml(input, { indent_size: Number(indent), wrap_line_length: 0 });
      return { output: result, error: undefined };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not format HTML.";
      return { output: "", error: `Could not format HTML: ${msg}` };
    }
  }, [input, mode, indent]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      error={error}
      downloadFileName="formatted.html"
      downloadMimeType="text/html"
      inputLabel="HTML"
      outputLabel="Formatted"
      inputPlaceholder="Paste minified or messy HTML here..."
      outputPlaceholder="Formatted HTML will appear here..."
      outputContent={
        output ? (
          <div className="overflow-x-auto">
            <HighlightedOutput code={output} lang="xml" />
          </div>
        ) : (
          <p className="p-4 text-[var(--text-muted)] text-sm">Formatted HTML will appear here...</p>
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
