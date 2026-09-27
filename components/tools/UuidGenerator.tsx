"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ToolShell } from "@/components/ToolShell";
import { CopyButton } from "@/components/CopyButton";
import { SegmentedControl } from "@/components/SegmentedControl";
import { getToolBySlug } from "@/lib/tools";
import { usePersistedState } from "@/lib/usePersistedState";

const tool = getToolBySlug("uuid-generator")!;

const COUNT_PRESETS = ["1", "5", "10", "25"] as const;

export function UuidGenerator() {
  const [count, setCount] = usePersistedState("ca_pref_uuid_count", 1);
  const [output, setOutput] = useState("");
  const hydrated = useRef(false);

  const generate = useCallback((n?: number) => {
    const total = n ?? count;
    const uuids = Array.from({ length: total }, () => crypto.randomUUID());
    setOutput(uuids.join("\n"));
  }, [count]);

  // Wait one tick so persisted count can hydrate before first generation.
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    void Promise.resolve().then(() => generate());
  }, [generate]);

  const firstUuid = output.split("\n")[0] || "";
  const countKey = String(count) as (typeof COUNT_PRESETS)[number];

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
          <SegmentedControl
            label="Count presets"
            compact
            value={countKey}
            onChange={(v) => {
              const n = Number(v);
              setCount(n);
              generate(n);
            }}
            segments={COUNT_PRESETS.map((c) => ({ value: c, label: c }))}
          />
          <button
            type="button"
            onClick={() => generate()}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#6366f1] text-white hover:bg-[#5558e6] transition-colors"
          >
            Generate
          </button>
        </div>
      }
      extraActions={
        <>
          {count > 1 && firstUuid && (
            <CopyButton value={firstUuid} label="Copy first" compact />
          )}
          <button
            type="button"
            onClick={() => { setOutput(""); setCount(1); }}
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
    />
  );
}
