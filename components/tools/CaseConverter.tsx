"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("case-converter")!;

type CaseType = "camel" | "pascal" | "snake" | "kebab" | "upper" | "lower" | "title" | "dot";

const SAMPLE = "hello world example\nmy variable name";

const CASES: { id: CaseType; label: string; example: string }[] = [
  { id: "camel", label: "camelCase", example: "helloWorld" },
  { id: "pascal", label: "PascalCase", example: "HelloWorld" },
  { id: "snake", label: "snake_case", example: "hello_world" },
  { id: "kebab", label: "kebab-case", example: "hello-world" },
  { id: "upper", label: "UPPER_CASE", example: "HELLO_WORLD" },
  { id: "lower", label: "lowercase", example: "hello world" },
  { id: "title", label: "Title Case", example: "Hello World" },
  { id: "dot", label: "dot.case", example: "hello.world" },
];

function toWords(str: string): string[] {
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/[-_.\s]+/g, " ")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

function convert(input: string, type: CaseType): string {
  if (!input.trim()) return "";
  const lines = input.split("\n");
  return lines
    .map((line) => {
      if (!line.trim()) return "";
      const words = toWords(line);
      switch (type) {
        case "camel": return words.map((w, i) => i === 0 ? w : w[0].toUpperCase() + w.slice(1)).join("");
        case "pascal": return words.map((w) => w[0].toUpperCase() + w.slice(1)).join("");
        case "snake": return words.join("_");
        case "kebab": return words.join("-");
        case "upper": return words.join("_").toUpperCase();
        case "lower": return words.join(" ").toLowerCase();
        case "title": return words.map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
        case "dot": return words.join(".");
      }
    })
    .join("\n");
}

export function CaseConverter() {
  const [input, setInput] = useState("");
  const [targetCase, setTargetCase] = useState<CaseType>("camel");

  const output = useMemo(() => convert(input, targetCase), [input, targetCase]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      inputPlaceholder={"Enter text to convert...\nSupports multiple lines."}
      outputPlaceholder="Converted text will appear here..."
      extraActions={
        <button
          onClick={() => setInput(SAMPLE)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
      }
      options={
        <div className="flex flex-wrap gap-1.5">
          {CASES.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTargetCase(id)}
              className={`px-2.5 py-1 rounded-full text-xs border transition-colors font-mono ${
                targetCase === id
                  ? "bg-[#6366f1]/15 text-[#6366f1] border-[#6366f1]/40"
                  : "text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      }
    />
  );
}
