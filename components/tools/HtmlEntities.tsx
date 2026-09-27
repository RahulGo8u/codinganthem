"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { SegmentedControl } from "@/components/SegmentedControl";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("html-entities")!;

const ESSENTIAL_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const DECODE_MAP: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
  "&copy;": "©",
  "&reg;": "®",
  "&trade;": "™",
  "&mdash;": "—",
  "&ndash;": "–",
  "&laquo;": "«",
  "&raquo;": "»",
};

const SAMPLES = {
  encode: `<div class="box">Tom & Jerry's "Great" Adventure</div>`,
  decode: "&lt;div&gt; Tom &amp; Jerry&#39;s &quot;Great&quot; Adventure &lt;/div&gt;",
};

function encodeEssential(str: string): string {
  return str.replace(/[&<>"']/g, (ch) => ESSENTIAL_MAP[ch] ?? ch);
}

function encodeAll(str: string): string {
  return Array.from(str)
    .map((ch) => {
      if (ESSENTIAL_MAP[ch]) return ESSENTIAL_MAP[ch];
      const code = ch.codePointAt(0)!;
      return code > 127 ? `&#${code};` : ch;
    })
    .join("");
}

function decodeHtml(str: string): { value: string; unknown: string[] } {
  const unknown: string[] = [];
  const value = str
    .replace(/&[a-zA-Z]+;/g, (entity) => {
      if (DECODE_MAP[entity]) return DECODE_MAP[entity];
      unknown.push(entity);
      return entity;
    })
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );
  return { value, unknown: [...new Set(unknown)] };
}

export function HtmlEntities() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [encodeLevel, setEncodeLevel] = useState<"essential" | "all">("essential");

  const { output, warning, preview } = useMemo(() => {
    if (!input) return { output: "", warning: undefined as string | undefined, preview: "" };
    if (mode === "encode") {
      const encoded = encodeLevel === "all" ? encodeAll(input) : encodeEssential(input);
      return { output: encoded, warning: undefined, preview: "" };
    }
    const { value, unknown } = decodeHtml(input);
    return {
      output: value,
      warning:
        unknown.length > 0
          ? `Unknown named entit${unknown.length === 1 ? "y" : "ies"} left unchanged: ${unknown.slice(0, 5).join(", ")}`
          : undefined,
      preview: value,
    };
  }, [input, mode, encodeLevel]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      error={warning}
      downloadFileName={mode === "encode" ? "encoded.html.txt" : "decoded.txt"}
      inputLabel={mode === "encode" ? "Plain HTML" : "HTML with entities"}
      outputLabel={mode === "encode" ? "Encoded" : "Decoded"}
      inputPlaceholder={
        mode === "encode"
          ? "Enter text with <tags> & special characters..."
          : "Enter text with &lt;entities&gt; to decode..."
      }
      outputPlaceholder="Output will appear here..."
      extraActions={
        <button
          type="button"
          onClick={() => setInput(SAMPLES[mode])}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
      }
      options={
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            label="Encode or decode"
            value={mode}
            onChange={setMode}
            segments={[
              { value: "encode", label: "Encode" },
              { value: "decode", label: "Decode" },
            ]}
          />
          {mode === "encode" && (
            <SegmentedControl
              label="Encoding level"
              value={encodeLevel}
              onChange={setEncodeLevel}
              compact
              segments={[
                { value: "essential", label: "Essential" },
                { value: "all", label: "All non-ASCII" },
              ]}
            />
          )}
        </div>
      }
      outputContent={
        mode === "decode" && preview ? (
          <div className="flex flex-col">
            <div className="px-4 py-3 border-b border-[var(--border)]">
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Rendered preview
              </p>
              <div className="text-sm text-[var(--text-primary)] break-words">{preview}</div>
            </div>
            <pre className="p-4 mono text-sm text-[var(--text-primary)] whitespace-pre-wrap break-all">
              {output}
            </pre>
          </div>
        ) : undefined
      }
    />
  );
}
