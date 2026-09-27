"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";
import { parse as parseYaml, YAMLParseError } from "yaml";
import { HighlightedOutput } from "@/lib/highlight";
import Link from "next/link";

const tool = getToolBySlug("yaml-to-json")!;

const SAMPLE = "name: CodingAnthem\ntools:\n  - JSON Formatter\n  - Base64";

function friendlyYamlError(err: unknown): string {
  if (err instanceof YAMLParseError) {
    const line = err.linePos?.[0]?.line;
    const col = err.linePos?.[0]?.col;
    const loc =
      line != null && col != null ? ` at line ${line}, column ${col}` : "";
    return `YAML parse error${loc}: ${err.message.split("\n")[0]}`;
  }
  const msg = err instanceof Error ? err.message : "Invalid YAML";
  return msg.includes("YAML") ? msg : `YAML parse error: ${msg}`;
}

export function YamlToJson() {
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: undefined };
    try {
      const parsed = parseYaml(input);
      return { output: JSON.stringify(parsed, null, 2), error: undefined };
    } catch (e) {
      return { output: "", error: friendlyYamlError(e) };
    }
  }, [input]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      error={error}
      downloadFileName="converted.json"
      downloadMimeType="application/json"
      inputLabel="YAML"
      outputLabel="JSON"
      inputPlaceholder={"name: CodingAnthem\ntools:\n  - JSON Formatter\n  - Base64"}
      outputPlaceholder="JSON output will appear here..."
      outputContent={output ? <HighlightedOutput code={output} /> : undefined}
      extraActions={
        <>
          <button
            type="button"
            onClick={() => setInput(SAMPLE)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Load sample
          </button>
          <Link
            href="/tools/json-to-yaml"
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            JSON → YAML
          </Link>
        </>
      }
    />
  );
}
