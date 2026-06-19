"use client";

import { useState, useCallback } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("uuid-generator")!;

export function UuidGenerator() {
  const [count, setCount] = useState(1);
  const [output, setOutput] = useState("");

  const generate = useCallback(() => {
    const uuids = Array.from({ length: count }, () => crypto.randomUUID());
    setOutput(uuids.join("\n"));
  }, [count]);

  return (
    <ToolShell
      tool={tool}
      input=""
      output={output}
      onInputChange={() => {}}
      hideFileActions
      hideInputPane
      outputLabel="Generated UUIDs"
      outputPlaceholder="Click Generate to create UUIDs..."
      options={
        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
            Count
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value))))}
              className="w-16 bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--text-primary)]"
            />
          </label>
          <button
            onClick={generate}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-[#6366f1]/15 border border-[#6366f1]/40 text-[#6366f1] hover:bg-[#6366f1]/25 transition-colors"
          >
            Generate
          </button>
        </div>
      }
      extraActions={
        <>
          <button
            onClick={() => { setOutput(""); setCount(1); }}
            disabled={!output}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Clear
          </button>
          <button
            onClick={generate}
            disabled={!output}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Regenerate
          </button>
        </>
      }
    />
  );
}
