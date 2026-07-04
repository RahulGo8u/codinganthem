"use client";

import { useState, useMemo } from "react";
import { css as beautifyCss } from "js-beautify";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";
import { HighlightedOutput } from "@/lib/highlight";

const tool = getToolBySlug("css-formatter")!;

const SAMPLE = `body{margin:0;font-family:sans-serif}.container{max-width:1200px;margin:0 auto;padding:1rem}.btn{background:#6366f1;color:#fff;border:none;border-radius:8px;padding:8px 16px}`;

export function CssFormatter() {
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: undefined };
    try {
      return { output: beautifyCss(input, { indent_size: 2 }), error: undefined };
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
      inputLabel="CSS"
      outputLabel="Formatted"
      inputPlaceholder="Paste minified or messy CSS here..."
      outputPlaceholder="Formatted CSS will appear here..."
      outputContent={
        output ? (
          <HighlightedOutput code={output} lang="css" />
        ) : (
          <p className="p-4 text-[var(--text-muted)] text-sm">Formatted CSS will appear here...</p>
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
