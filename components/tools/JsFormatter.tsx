"use client";

import { useState, useMemo } from "react";
import { js as beautifyJs } from "js-beautify";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("js-formatter")!;

const SAMPLE = `const add=(a,b)=>{return a+b};function greet(name){if(!name){return"Hello"}return"Hello, "+name}const data={id:1,items:[1,2,3],active:true};`;

export function JsFormatter() {
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: undefined };
    try {
      return { output: beautifyJs(input, { indent_size: 2, space_in_empty_paren: true }), error: undefined };
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
      inputLabel="JavaScript"
      outputLabel="Formatted"
      inputPlaceholder="Paste minified or messy JavaScript here..."
      outputPlaceholder="Formatted JavaScript will appear here..."
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
