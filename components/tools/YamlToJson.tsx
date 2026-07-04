"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";
import { parse as parseYaml } from "yaml";
import { HighlightedOutput } from "@/lib/highlight";

const tool = getToolBySlug("yaml-to-json")!;

const SAMPLE = "name: CodingAnthem\ntools:\n  - JSON Formatter\n  - Base64";

export function YamlToJson() {
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: undefined };
    try {
      const parsed = parseYaml(input);
      return { output: JSON.stringify(parsed, null, 2), error: undefined };
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
      inputLabel="YAML"
      outputLabel="JSON"
      inputPlaceholder={"name: CodingAnthem\ntools:\n  - JSON Formatter\n  - Base64"}
      outputPlaceholder="JSON output will appear here..."
      outputContent={output ? <HighlightedOutput code={output} /> : undefined}
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
