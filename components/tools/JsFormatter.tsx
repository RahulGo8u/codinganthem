"use client";

import { useState, useMemo } from "react";
import { js as beautifyJs } from "js-beautify";
import { ToolShell } from "@/components/ToolShell";
import { SegmentedControl } from "@/components/SegmentedControl";
import { getToolBySlug } from "@/lib/tools";
import { HighlightedOutput } from "@/lib/highlight";

const tool = getToolBySlug("js-formatter")!;

const SAMPLE = `const add=(a,b)=>{return a+b};function greet(name){if(!name){return"Hello"}return"Hello, "+name}const data={id:1,items:[1,2,3],active:true};`;

export function JsFormatter() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"beautify" | "compact">("beautify");
  const [indent, setIndent] = useState<"2" | "4">("2");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: undefined };
    try {
      const result = beautifyJs(input, {
        indent_size: mode === "compact" ? 0 : Number(indent),
        space_in_empty_paren: true,
      });
      return { output: result, error: undefined };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not format JavaScript.";
      return { output: "", error: `Could not format JavaScript: ${msg}` };
    }
  }, [input, mode, indent]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      error={error}
      downloadFileName="formatted.js"
      downloadMimeType="text/javascript"
      inputLabel="JavaScript"
      outputLabel="Formatted"
      inputPlaceholder="Paste minified or messy JavaScript here..."
      outputPlaceholder="Formatted JavaScript will appear here..."
      outputContent={
        output ? (
          <div className="overflow-x-auto">
            <HighlightedOutput code={output} lang="js" />
          </div>
        ) : (
          <p className="p-4 text-[var(--text-muted)] text-sm">Formatted JavaScript will appear here...</p>
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
              { value: "compact", label: "Compact" },
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
