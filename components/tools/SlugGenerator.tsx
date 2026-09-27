"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { SegmentedControl } from "@/components/SegmentedControl";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("slug-generator")!;

const SAMPLE = "Hello World!\nMy Blog Post Title\nThe Quick Brown Fox";

function toSlug(text: string, separator: "-" | "_"): { slug: string; removed: string } {
  const removedChars = new Set<string>();
  const normalized = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // strip accents (transliteration guidance: accents removed)

  const cleaned = normalized
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, (ch) => {
      if (ch.trim()) removedChars.add(ch);
      return "";
    })
    .trim()
    .replace(/[\s_-]+/g, separator)
    .replace(new RegExp(`^${separator}|${separator}$`, "g"), "");

  return {
    slug: cleaned,
    removed: [...removedChars].join(" "),
  };
}

export function SlugGenerator() {
  const [input, setInput] = useState("");
  const [separator, setSeparator] = useState<"-" | "_">("-");
  const [maxLength, setMaxLength] = useState("");

  const { output, removedPreview, truncated } = useMemo(() => {
    if (!input.trim()) {
      return { output: "", removedPreview: "", truncated: false };
    }
    const max = maxLength.trim() ? Number(maxLength) : null;
    const removedAll = new Set<string>();
    let anyTruncated = false;
    const lines = input.split("\n").map((line) => {
      if (!line.trim()) return "";
      const { slug, removed } = toSlug(line, separator);
      removed.split(" ").filter(Boolean).forEach((c) => removedAll.add(c));
      if (max && max > 0 && slug.length > max) {
        anyTruncated = true;
        return slug.slice(0, max).replace(new RegExp(`${separator}+$`), "");
      }
      return slug;
    });
    return {
      output: lines.join("\n"),
      removedPreview: [...removedAll].join(" "),
      truncated: anyTruncated,
    };
  }, [input, separator, maxLength]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      downloadFileName="slugs.txt"
      inputLabel="Text"
      outputLabel="Slug"
      inputPlaceholder={"Hello World!\nMy Blog Post Title\nThe Quick Brown Fox"}
      outputPlaceholder="Slugs will appear here..."
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
          <SegmentedControl
            label="Slug separator"
            value={separator}
            onChange={setSeparator}
            segments={[
              { value: "-", label: "kebab-case" },
              { value: "_", label: "snake_case" },
            ]}
          />
          <label className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
            Max length
            <input
              type="number"
              min={1}
              placeholder="none"
              value={maxLength}
              onChange={(e) => setMaxLength(e.target.value)}
              className="mono w-20 bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--text-primary)]"
            />
          </label>
          {(removedPreview || truncated) && (
            <p className="text-[10px] text-[var(--text-muted)] w-full">
              {removedPreview ? `Removed characters: ${removedPreview}` : ""}
              {removedPreview && truncated ? " · " : ""}
              {truncated ? "Some slugs were truncated to max length." : ""}
              {" · Accents are stripped (é → e)."}
            </p>
          )}
        </div>
      }
    />
  );
}
