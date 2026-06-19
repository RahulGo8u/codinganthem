"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";
import { parse as parseYaml } from "yaml";
import { HighlightedOutput } from "@/lib/highlight";

const tool = getToolBySlug("yaml-to-json")!;

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
    />
  );
}
