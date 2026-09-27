"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { SegmentedControl } from "@/components/SegmentedControl";
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
  return (
    cleaned
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("") || "Item"
  );
}

function singularize(name: string): string {
  return name.endsWith("s") ? name.slice(0, -1) : name;
}

function safeKey(key: string): string {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
}

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

function generate(
  root: unknown,
  rootName: string,
  style: "interface" | "type",
  exported: boolean,
  nullable: boolean
): string {
  const interfaces: string[] = [];
  const prefix = exported ? "export " : "";

  function tsType(value: unknown, name: string): string {
    if (value === null) return nullable ? "null" : "null";
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
    const keyword = style === "interface" ? "interface" : "type";
    const open = style === "interface" ? "{" : "= {";
    const close = style === "interface" ? "}" : "};";
    const lines = [`${prefix}${keyword} ${name} ${open}`];
    for (const [key, value] of Object.entries(obj)) {
      const t = tsType(value, key);
      const finalType = nullable && t !== "null" ? `${t} | null` : t;
      lines.push(`  ${safeKey(key)}: ${finalType};`);
    }
    lines.push(close);
    interfaces.push(lines.join("\n"));
  }

  const name = pascalCase(rootName || "Root") || "Root";

  if (Array.isArray(root)) {
    const elemType = tsType(root, name);
    interfaces.push(`${prefix}type ${name} = ${elemType};`);
  } else if (root !== null && typeof root === "object") {
    buildInterface(root as Record<string, unknown>, name);
  } else {
    interfaces.push(`${prefix}type ${name} = ${tsType(root, name)};`);
  }

  return interfaces.reverse().join("\n\n");
}

export function JsonToTypeScript() {
  const [input, setInput] = useState("");
  const [rootName, setRootName] = useState("Root");
  const [style, setStyle] = useState<"interface" | "type">("interface");
  const [exported, setExported] = useState(true);
  const [nullable, setNullable] = useState(false);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: undefined };
    try {
      const parsed = JSON.parse(input);
      return {
        output: generate(parsed, rootName, style, exported, nullable),
        error: undefined,
      };
    } catch (e) {
      return { output: "", error: friendlyJsonError(e, input) };
    }
  }, [input, rootName, style, exported, nullable]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      error={error}
      downloadFileName={`${(rootName || "types").replace(/[^a-zA-Z0-9_-]/g, "") || "types"}.ts`}
      downloadMimeType="text/typescript"
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
          type="button"
          onClick={() => setInput(SAMPLE)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
      }
      options={
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
            Root name
            <input
              type="text"
              value={rootName}
              onChange={(e) => setRootName(e.target.value)}
              className="mono w-28 bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--text-primary)]"
            />
          </label>
          <SegmentedControl
            label="Declaration style"
            value={style}
            onChange={setStyle}
            compact
            segments={[
              { value: "interface", label: "interface" },
              { value: "type", label: "type" },
            ]}
          />
          <label className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={exported}
              onChange={(e) => setExported(e.target.checked)}
              className="accent-[#6366f1]"
            />
            export
          </label>
          <label className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={nullable}
              onChange={(e) => setNullable(e.target.checked)}
              className="accent-[#6366f1]"
            />
            Fields nullable
          </label>
        </div>
      }
    />
  );
}
