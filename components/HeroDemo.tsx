"use client";

import { useEffect, useState } from "react";

const RAW = `{"id":1,"name":"CodingAnthem","tags":["fast","free","private"],"active":true}`;
const FORMATTED = JSON.stringify(JSON.parse(RAW), null, 2);

const TYPE_SPEED_MS = 35;
const HOLD_MS = 2200;
const ERASE_SPEED_MS = 12;
const PAUSE_MS = 500;

type Phase = "typing" | "holding" | "erasing";

/**
 * Self-contained looping animation that types raw JSON into a mock "input"
 * pane and reveals the formatted result — visually proves the "results as
 * you type" claim without needing a recorded video/GIF asset.
 */
export function HeroDemo() {
  const [charCount, setCharCount] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (charCount < RAW.length) {
        timer = setTimeout(() => setCharCount((c) => c + 1), TYPE_SPEED_MS);
      } else {
        timer = setTimeout(() => setPhase("holding"), 300);
      }
    } else if (phase === "holding") {
      timer = setTimeout(() => setPhase("erasing"), HOLD_MS);
    } else {
      if (charCount > 0) {
        timer = setTimeout(() => setCharCount((c) => c - 1), ERASE_SPEED_MS);
      } else {
        timer = setTimeout(() => setPhase("typing"), PAUSE_MS);
      }
    }

    return () => clearTimeout(timer);
  }, [phase, charCount]);

  const inputText = RAW.slice(0, charCount);
  const isComplete = charCount === RAW.length && phase !== "typing";
  const showCursor = phase === "typing" || phase === "erasing";

  return (
    <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-left" aria-hidden="true">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
        <div className="px-3 py-2 border-b border-[var(--border)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
          Input
        </div>
        <pre className="mono text-xs p-3 h-36 overflow-hidden text-[var(--text-primary)] whitespace-pre-wrap break-words leading-relaxed">
          {inputText}
          {showCursor && <span className="inline-block w-1.5 h-3.5 -mb-0.5 bg-[#6366f1] animate-pulse" />}
        </pre>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
        <div className="px-3 py-2 border-b border-[var(--border)] flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Output</span>
          {isComplete && <span className="text-[10px] text-[#22c55e]">● Valid JSON</span>}
        </div>
        <pre className="mono text-xs p-3 h-36 overflow-hidden text-[var(--text-primary)] whitespace-pre-wrap break-words leading-relaxed">
          {isComplete ? FORMATTED : ""}
        </pre>
      </div>
    </div>
  );
}
