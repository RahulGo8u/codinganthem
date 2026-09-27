"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("word-counter")!;

const SAMPLE =
  "CodingAnthem offers dozens of free developer tools built for everyday use. Paste any text here to see live word and character counts.";

const LIMITS = [
  { id: "x", label: "X / Twitter", max: 280 },
  { id: "meta", label: "Meta title", max: 60 },
  { id: "sms", label: "SMS", max: 160 },
] as const;

interface Stats {
  words: number;
  charsWithSpaces: number;
  charsNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTime: string;
  speakingTime: string;
}

function countStats(text: string): Stats {
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const charsWithSpaces = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const sentences = text.trim() === "" ? 0 : (text.match(/[^.!?]*[.!?]+/g) ?? []).length;
  const paragraphs =
    text.trim() === "" ? 0 : text.split(/\n\s*\n/).filter((p) => p.trim()).length;
  const readMinutes = Math.ceil(words / 200);
  const speakMinutes = Math.ceil(words / 130);
  const readingTime = words === 0 ? "—" : readMinutes < 1 ? "< 1 min" : `${readMinutes} min`;
  const speakingTime = words === 0 ? "—" : speakMinutes < 1 ? "< 1 min" : `${speakMinutes} min`;
  return {
    words,
    charsWithSpaces,
    charsNoSpaces,
    sentences,
    paragraphs,
    readingTime,
    speakingTime,
  };
}

const STATS: { label: string; key: keyof Stats }[] = [
  { label: "Words", key: "words" },
  { label: "Characters", key: "charsWithSpaces" },
  { label: "Characters (no spaces)", key: "charsNoSpaces" },
  { label: "Sentences", key: "sentences" },
  { label: "Paragraphs", key: "paragraphs" },
  { label: "Reading time", key: "readingTime" },
  { label: "Speaking time", key: "speakingTime" },
];

export function WordCounter() {
  const [input, setInput] = useState("");
  const stats = useMemo(() => countStats(input), [input]);

  const summary = useMemo(
    () =>
      STATS.map(({ label, key }) => `${label}: ${stats[key]}`).join("\n"),
    [stats]
  );

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={summary}
      onInputChange={setInput}
      downloadFileName="word-count.txt"
      inputLabel="Text"
      outputLabel="Stats"
      inputPlaceholder="Paste or type your text here..."
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
        <div className="flex flex-wrap gap-3 w-full" role="status" aria-live="polite">
          <span className="text-sm font-semibold text-[var(--text-primary)] mono">
            {stats.words.toLocaleString()} words · {stats.charsWithSpaces.toLocaleString()} chars
          </span>
          {LIMITS.map(({ id, label, max }) => {
            const over = stats.charsWithSpaces > max;
            const remaining = max - stats.charsWithSpaces;
            return (
              <span
                key={id}
                className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded border ${
                  over
                    ? "border-[#ef4444]/40 bg-[#ef4444]/10 text-[#ef4444]"
                    : "border-[var(--border)] text-[var(--text-muted)]"
                }`}
              >
                {label}: {over ? `${Math.abs(remaining)} over` : `${remaining} left`}
              </span>
            );
          })}
        </div>
      }
      outputContent={
        <div className="p-4">
          <div className="result-card flex flex-col divide-y divide-[var(--border)]">
            {STATS.map(({ label, key }) => (
              <div
                key={key}
                className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
              >
                <span className="text-xs text-[var(--text-muted)]">{label}</span>
                <span className="text-sm font-semibold text-[var(--text-primary)] mono">
                  {typeof stats[key] === "number"
                    ? (stats[key] as number).toLocaleString()
                    : stats[key]}
                </span>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}
