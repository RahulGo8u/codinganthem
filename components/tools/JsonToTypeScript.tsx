"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";
import { HighlightedOutput } from "@/lib/highlight";

const tool = getToolBySlug("json-to-typescript")!;

const SAMPLE = `{
  "id": 1,
  "name": "Alice",
  "active": true,
  "roles": ["admin", "user"],
  "profile": { "age": 30, "city": "London" }
}`;

function pascalCase(str: string): string {
  const cleaned = str.replace(/[^a-zA-Z0-9]+/g, " ").trim();
  return cleaned
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("") || "Item";
}

function singularize(name: string): string {
  return name.endsWith("s") ? name.slice(0, -1) : name;
}

function safeKey(key: string): string {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
}

function generate(root: unknown, rootName = "Root"): string {
  const interfaces: string[] = [];

  function tsType(value: unknown, name: string): string {
    if (value === null) return "null";
    if (Array.isArray(value)) {
      if (value.length === 0) return "unknown[]";
      const elemTypes = new Set(value.map((v) => tsType(v, singularize(name))));
      return elemTypes.size === 1
        ? `${[...elemTypes][0]}[]`
        : `(${[...elemTypes].join(" | ")})[]`;
    }
    if (typeof value === "object") {
      const ifaceName = pascalCase(name);
      buildInterface(value as Record<string, unknown>, ifaceName);
      return ifaceName;
    }
    if (typeof value === "string") return "string";
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    return "unknown";
  }

  function buildInterface(obj: Record<string, unknown>, name: string) {
    const lines = [`interface ${name} {`];
    for (const [key, value] of Object.entries(obj)) {
      lines.push(`  ${safeKey(key)}: ${tsType(value, key)};`);
    }
    lines.push("}");
    interfaces.push(lines.join("\n"));
  }

  if (Array.isArray(root)) {
    const elemType = tsType(root, rootName);
    interfaces.push(`type ${rootName} = ${elemType};`);
  } else if (root !== null && typeof root === "object") {
    buildInterface(root as Record<string, unknown>, rootName);
  } else {
    interfaces.push(`type ${rootName} = ${tsType(root, rootName)};`);
  }

  // Reverse so nested interfaces are defined before the root that uses them
  return interfaces.reverse().join("\n\n");
}

export function JsonToTypeScript() {
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: undefined };
    try {
      const parsed = JSON.parse(input);
      return { output: generate(parsed), error: undefined };
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
      outputLabel="TypeScript"
      inputPlaceholder="Paste your JSON here..."
      outputPlaceholder="TypeScript interfaces will appear here..."
      outputContent={
        output ? (
          <HighlightedOutput code={output} lang="js" />
        ) : (
          <p className="p-4 text-[var(--text-muted)] text-sm">TypeScript interfaces will appear here...</p>
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
