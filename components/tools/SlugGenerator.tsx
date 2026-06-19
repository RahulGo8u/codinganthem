"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("slug-generator")!;

function toSlug(text: string, separator: "-" | "_"): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")    // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, "")      // remove non-alphanumeric
    .trim()
    .replace(/[\s_-]+/g, separator)     // collapse whitespace/dashes
    .replace(new RegExp(`^${separator}|${separator}$`, "g"), ""); // trim edges
}

export function SlugGenerator() {
  const [input, setInput] = useState("");
  const [separator, setSeparator] = useState<"-" | "_">("-");

  const output = useMemo(() => {
    if (!input.trim()) return "";
    return input
      .split("\n")
      .map((line) => toSlug(line, separator))
      .join("\n");
  }, [input, separator]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      inputLabel="Text"
      outputLabel="Slug"
      inputPlaceholder={"Hello World!\nMy Blog Post Title\nThe Quick Brown Fox"}
      outputPlaceholder="Slugs will appear here..."
      options={
        <div className="flex rounded-lg border border-[var(--border)] overflow-hidden text-xs">
          {(["-", "_"] as const).map((sep) => (
            <button
              key={sep}
              onClick={() => setSeparator(sep)}
              className={`px-3 py-1.5 transition-colors ${
                separator === sep
                  ? "bg-[#6366f1]/15 text-[#6366f1]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
              }`}
            >
              {sep === "-" ? "kebab-case" : "snake_case"}
            </button>
          ))}
        </div>
      }
    />
  );
}
