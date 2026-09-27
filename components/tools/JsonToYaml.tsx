"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";
import { stringify as yamlStringify } from "yaml";
import { HighlightedOutput } from "@/lib/highlight";
import Link from "next/link";

const tool = getToolBySlug("json-to-yaml")!;

const SAMPLE = '{\n  "name": "CodingAnthem",\n  "tools": ["JSON", "YAML"]\n}';

function friendlyJsonError(err: unknown, input: string): string {
  const msg = err instanceof Error ? err.message : "Invalid JSON";
  const match = /position\s+(\d+)/i.exec(msg);
  if (!match) return msg.includes("JSON") ? msg : `Invalid JSON: ${msg}`;
  const pos = Number(match[1]);
  let line = 1;
  let col = 1;
  for (let i = 0; i < pos && i < input.length; i++) {
    if (input[i] === "\n") {
      line++;
      col = 1;
    } else {
      col++;
    }
  }
  return `Invalid JSON at line ${line}, column ${col}. ${msg}`;
}

export function JsonToYaml() {
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: undefined };
    try {
      const parsed = JSON.parse(input);
      return { output: yamlStringify(parsed), error: undefined };
    } catch (e) {
      return { output: "", error: friendlyJsonError(e, input) };
    }
  }, [input]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      error={error}
      downloadFileName="converted.yaml"
      downloadMimeType="application/yaml"
      inputLabel="JSON"
      outputLabel="YAML"
      inputPlaceholder={'{\n  "name": "CodingAnthem",\n  "tools": ["JSON", "YAML"]\n}'}
      outputPlaceholder="YAML output will appear here..."
      outputContent={output ? <HighlightedOutput code={output} lang="yaml" /> : undefined}
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
            href="/tools/yaml-to-json"
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            YAML → JSON
          </Link>
        </>
      }
      options={
        <p className="text-[10px] text-[var(--text-muted)] max-w-xl">
          Conversion runs entirely in your browser. Do not paste secrets you would not store locally.
        </p>
      }
    />
  );
}
