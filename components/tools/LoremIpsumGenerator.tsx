"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { SegmentedControl } from "@/components/SegmentedControl";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("lorem-ipsum")!;

const WORDS = [
  "lorem","ipsum","dolor","sit","amet","consectetur","adipiscing","elit","sed","do",
  "eiusmod","tempor","incididunt","ut","labore","et","dolore","magna","aliqua","enim",
  "ad","minim","veniam","quis","nostrud","exercitation","ullamco","laboris","nisi",
  "aliquip","ex","ea","commodo","consequat","duis","aute","irure","in","reprehenderit",
  "voluptate","velit","esse","cillum","fugiat","nulla","pariatur","excepteur","sint",
  "occaecat","cupidatat","non","proident","sunt","culpa","qui","officia","deserunt",
  "mollit","anim","id","est","laborum","at","vero","eos","accusamus","iusto","odio",
  "dignissimos","ducimus","blanditiis","praesentium","voluptatum","deleniti","atque",
  "corrupti","quos","dolores","quas","molestias","excepturi","occaecati","perspiciatis",
  "unde","omnis","iste","natus","error","voluptatem","accusantium","doloremque",
  "laudantium","totam","rem","aperiam","eaque","ipsa","quae","ab","illo","inventore",
];

const PARA_PRESETS = ["1", "3", "5"] as const;

function randomWord(exclude?: string): string {
  let w: string;
  do { w = WORDS[Math.floor(Math.random() * WORDS.length)]; } while (w === exclude);
  return w;
}

function generateSentence(wordCount: number): string {
  const words = Array.from({ length: wordCount }, (_, i) => {
    const w = randomWord();
    return i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w;
  });
  return words.join(" ") + ".";
}

function generateParagraph(sentenceCount: number): string {
  const sentenceLengths = Array.from({ length: sentenceCount }, () => 8 + Math.floor(Math.random() * 8));
  return sentenceLengths.map(generateSentence).join(" ");
}

export function LoremIpsumGenerator() {
  const [paragraphs, setParagraphs] = useState(3);
  const [output, setOutput] = useState("");

  const generate = useCallback((n?: number) => {
    const count = n ?? paragraphs;
    const result = Array.from({ length: count }, () => generateParagraph(4 + Math.floor(Math.random() * 3)));
    setOutput(result.join("\n\n"));
  }, [paragraphs]);

  useEffect(() => {
    // Intentionally mount-only so changing paragraph count doesn't surprise-overwrite.
    void Promise.resolve().then(() => generate());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    if (!output) return null;
    const words = output.trim() ? output.trim().split(/\s+/).length : 0;
    return { words, chars: output.length };
  }, [output]);

  const paraKey = String(paragraphs) as (typeof PARA_PRESETS)[number];

  return (
    <ToolShell
      tool={tool}
      input=""
      output={output}
      onInputChange={() => {}}
      hideFileActions
      hideInputPane
      outputLabel="Generated text"
      outputPlaceholder="Click Generate to create lorem ipsum text..."
      extraActions={
        <>
          <button
            type="button"
            onClick={() => setOutput("")}
            disabled={!output}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#ef4444]/40 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 hover:border-[#ef4444]/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => generate()}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Regenerate
          </button>
        </>
      }
      options={
        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
            Paragraphs
            <input
              type="number"
              min={1}
              max={10}
              value={paragraphs}
              onChange={(e) => setParagraphs(Math.min(10, Math.max(1, Number(e.target.value))))}
              className="w-14 bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--text-primary)]"
            />
          </label>
          <SegmentedControl
            label="Paragraph presets"
            compact
            value={paraKey}
            onChange={(v) => {
              const n = Number(v);
              setParagraphs(n);
              generate(n);
            }}
            segments={PARA_PRESETS.map((p) => ({ value: p, label: `${p}` }))}
          />
          <button
            type="button"
            onClick={() => generate()}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#6366f1] text-white hover:bg-[#5558e6] transition-colors"
          >
            Generate
          </button>
          {stats && (
            <span className="text-xs text-[var(--text-muted)]">
              {stats.words.toLocaleString()} words · {stats.chars.toLocaleString()} characters
            </span>
          )}
          <span className="text-[11px] text-[var(--text-muted)]">
            Count changes apply on Generate (or preset)
          </span>
        </div>
      }
    />
  );
}
