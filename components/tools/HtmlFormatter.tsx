"use client";

import { useState, useMemo } from "react";
import { html as beautifyHtml } from "js-beautify";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";
import { HighlightedOutput } from "@/lib/highlight";

const tool = getToolBySlug("html-formatter")!;

const SAMPLE = `<!DOCTYPE html><html><head><title>Demo</title></head><body><div class="container"><h1>Hello</h1><p>This is <strong>HTML</strong>.</p><ul><li>One</li><li>Two</li></ul></div></body></html>`;

export function HtmlFormatter() {
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: undefined };
    try {
      return { output: beautifyHtml(input, { indent_size: 2, wrap_line_length: 0 }), error: undefined };
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
      inputLabel="HTML"
      outputLabel="Formatted"
      inputPlaceholder="Paste minified or messy HTML here..."
      outputPlaceholder="Formatted HTML will appear here..."
      outputContent={
        output ? (
          <HighlightedOutput code={output} lang="xml" />
        ) : (
          <p className="p-4 text-[var(--text-muted)] text-sm">Formatted HTML will appear here...</p>
        )
      }
      extraActions={
        <button
          onClick={() => setInput(SAMPLE)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
      }
    />
  );
}
