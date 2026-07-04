"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("html-entities")!;

const ENCODE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const DECODE_MAP: Record<string, string> = {
  "&amp;":  "&",
  "&lt;":   "<",
  "&gt;":   ">",
  "&quot;": '"',
  "&#39;":  "'",
  "&apos;": "'",
  "&nbsp;": " ",
  "&copy;": "©",
  "&reg;":  "®",
  "&trade;":"™",
  "&mdash;":"—",
  "&ndash;":"–",
  "&laquo;":"«",
  "&raquo;":"»",
};

const SAMPLES = {
  encode: `<div class="box">Tom & Jerry's "Great" Adventure</div>`,
  decode: "&lt;div&gt; Tom &amp; Jerry&#39;s &quot;Great&quot; Adventure &lt;/div&gt;",
};

function encodeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (ch) => ENCODE_MAP[ch] ?? ch);
}

function decodeHtml(str: string): string {
  return str
    .replace(/&[a-zA-Z]+;/g, (entity) => DECODE_MAP[entity] ?? entity)
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

export function HtmlEntities() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const output = useMemo(() => {
    if (!input) return "";
    return mode === "encode" ? encodeHtml(input) : decodeHtml(input);
  }, [input, mode]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
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
          onClick={() => setInput(SAMPLES[mode])}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
      }
      options={
        <div className="flex rounded-lg border border-[var(--border)] overflow-hidden text-xs">
          {(["encode", "decode"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 capitalize transition-colors ${
                mode === m
                  ? "bg-[#6366f1]/15 text-[#6366f1]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      }
    />
  );
}
