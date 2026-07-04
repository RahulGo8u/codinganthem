"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";
import { stringify as yamlStringify } from "yaml";
import { HighlightedOutput } from "@/lib/highlight";

const tool = getToolBySlug("json-to-yaml")!;

const SAMPLE = '{\n  "name": "CodingAnthem",\n  "tools": ["JSON", "YAML"]\n}';

export function JsonToYaml() {
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: undefined };
    try {
      const parsed = JSON.parse(input);
      return { output: yamlStringify(parsed), error: undefined };
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
      inputLabel="JSON"
      outputLabel="YAML"
      inputPlaceholder={'{\n  "name": "CodingAnthem",\n  "tools": ["JSON", "YAML"]\n}'}
      outputPlaceholder="YAML output will appear here..."
      outputContent={output ? <HighlightedOutput code={output} lang="yaml" /> : undefined}
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
