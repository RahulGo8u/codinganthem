"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("word-counter")!;

const SAMPLE =
  "CodingAnthem offers 43 free developer tools that run entirely in your browser. Nothing you type is ever sent to a server.";

interface Stats {
  words: number;
  charsWithSpaces: number;
  charsNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTime: string;
}

function countStats(text: string): Stats {
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const charsWithSpaces = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const sentences = text.trim() === "" ? 0 : (text.match(/[^.!?]*[.!?]+/g) ?? []).length;
  const paragraphs = text.trim() === "" ? 0 : text.split(/\n\s*\n/).filter((p) => p.trim()).length;
  const minutes = Math.ceil(words / 200);
  const readingTime = words === 0 ? "—" : minutes < 1 ? "< 1 min" : `${minutes} min`;
  return { words, charsWithSpaces, charsNoSpaces, sentences, paragraphs, readingTime };
}

const STATS: { label: string; key: keyof Stats }[] = [
  { label: "Words", key: "words" },
  { label: "Characters", key: "charsWithSpaces" },
  { label: "Characters (no spaces)", key: "charsNoSpaces" },
  { label: "Sentences", key: "sentences" },
  { label: "Paragraphs", key: "paragraphs" },
  { label: "Reading time", key: "readingTime" },
];

export function WordCounter() {
  const [input, setInput] = useState("");
  const stats = useMemo(() => countStats(input), [input]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output=""
      onInputChange={setInput}
      inputLabel="Text"
      outputLabel="Stats"
      inputPlaceholder="Paste or type your text here..."
      extraActions={
        <button
          onClick={() => setInput(SAMPLE)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
      }
      outputContent={
        <div className="p-4 flex flex-col gap-2">
          {STATS.map(({ label, key }) => (
            <div
              key={key}
              className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0"
            >
              <span className="text-xs text-[var(--text-muted)]">{label}</span>
              <span className="text-sm font-semibold text-[var(--text-primary)] mono">
                {stats[key].toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      }
    />
  );
}
