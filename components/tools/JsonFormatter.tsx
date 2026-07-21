"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";
import { HighlightedOutput } from "@/lib/highlight";

const tool = getToolBySlug("json-formatter")!;

const SAMPLE = `{"id":1,"name":"CodingAnthem","tags":["fast","free"],"active":true,"meta":{"stars":2400,"license":"MIT"}}`;

export function JsonFormatter() {
  const [input, setInput] = useState(SAMPLE);
  const [minify, setMinify] = useState(false);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: undefined };
    try {
      const parsed = JSON.parse(input);
      const result = minify
        ? JSON.stringify(parsed)
        : JSON.stringify(parsed, null, 2);
      return { output: result, error: undefined };
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, minify]);

  const isValid = input.trim() !== "" && !error;

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      inputPlaceholder={'Paste your JSON here...\n\n{"name": "codinganthem", "type": "dev tools"}'}
      outputPlaceholder="Formatted JSON will appear here..."
      extraActions={
        <button
          onClick={() => setInput(SAMPLE)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
      }
      options={
        <div className="flex items-center justify-between w-full gap-3 flex-wrap">
          <div className="flex rounded-lg border border-[var(--border)] overflow-hidden text-xs">
            {([["Beautify", false], ["Minify", true]] as const).map(([label, val]) => (
              <button
                key={label}
                onClick={() => setMinify(val)}
                className={`px-3 py-1.5 transition-colors ${
                  minify === val
                    ? "bg-[#6366f1]/15 text-[#6366f1]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {input.trim() !== "" && (
            <span
              className={`flex items-center gap-1.5 text-xs font-medium ${
                isValid ? "text-[#22c55e]" : "text-[#ef4444]"
              }`}
            >
              <span>{isValid ? "●" : "✕"}</span>
              {isValid ? "Valid JSON" : "Invalid JSON"}
            </span>
          )}
        </div>
      }
      outputContent={
        error ? (
          <div className="flex flex-col">
            <div className="flex items-start gap-2 px-4 py-2.5 bg-[#ef4444]/10 border-b border-[#ef4444]/30 text-xs text-[#ef4444] leading-relaxed">
              <span className="shrink-0">⚠</span>
              <span>{error}</span>
            </div>
          </div>
        ) : output ? (
          <HighlightedOutput code={output} />
        ) : (
          <p className="p-4 text-[var(--text-muted)] text-sm">
            Formatted JSON will appear here...
          </p>
        )
      }
    />
  );
}
