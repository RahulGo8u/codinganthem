"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { SegmentedControl } from "@/components/SegmentedControl";
import { ToolShell } from "@/components/ToolShell";
import { calculateKeccak, type KeccakInputMode } from "@/lib/ethereum";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("keccak-calculator")!;

const SAMPLES: Record<KeccakInputMode, string> = {
  text: "Hello, Ethereum!",
  hex: "0x48656c6c6f",
  signature: "transfer(address,uint256)",
};

export function KeccakCalculator() {
  const [mode, setMode] = useState<KeccakInputMode>("signature");
  const [input, setInput] = useState(SAMPLES.signature);
  const calculated = useMemo(() => {
    try {
      return { result: calculateKeccak(input, mode), error: "" };
    } catch (error) {
      return {
        result: null,
        error: error instanceof Error ? error.message : "Could not calculate Keccak-256.",
      };
    }
  }, [input, mode]);

  const changeMode = (nextMode: KeccakInputMode) => {
    setMode(nextMode);
    setInput(SAMPLES[nextMode]);
  };

  const output = calculated.result
    ? mode === "signature"
      ? `Keccak-256: ${calculated.result.hash}\nFunction selector: ${calculated.result.selector}\nEvent topic0: ${calculated.result.topic0}`
      : calculated.result.hash
    : "";

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      error={calculated.error || undefined}
      hideFileActions
      showClear
      inputLabel={
        mode === "hex" ? "Hex bytes" : mode === "signature" ? "Canonical Solidity signature" : "UTF-8 text"
      }
      outputLabel="Keccak-256 results"
      inputPlaceholder={
        mode === "hex" ? "0x48656c6c6f" : mode === "signature" ? "transfer(address,uint256)" : "Text to hash"
      }
      options={
        <SegmentedControl
          label="Input type"
          value={mode}
          onChange={changeMode}
          segments={[
            { value: "signature", label: "Solidity signature" },
            { value: "text", label: "UTF-8 text" },
            { value: "hex", label: "Hex bytes" },
          ]}
        />
      }
      outputContent={
        calculated.result ? (
          <div className="flex flex-col gap-3 p-4">
            <p className="text-[10px] text-[var(--text-muted)]">
              {calculated.result.byteLength.toLocaleString()} input bytes
              {mode === "signature" && " · Hash the canonical signature exactly as entered"}
            </p>
            <ResultCard label="Keccak-256 hash" value={calculated.result.hash} />
            {mode === "signature" && (
              <>
                <ResultCard label="Function selector (first 4 bytes)" value={calculated.result.selector} />
                <ResultCard label="Event topic0 (full 32 bytes)" value={calculated.result.topic0} />
                <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                  Use the selector for contract function calldata. Use the full topic0 hash to filter
                  non-anonymous Solidity events.
                </p>
              </>
            )}
          </div>
        ) : (
          <p className="p-4 text-sm text-[var(--text-muted)]">Enter a value to calculate its Keccak-256 hash.</p>
        )
      }
      extraActions={
        <button
          type="button"
          onClick={() => setInput(SAMPLES[mode])}
          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
        >
          Load sample
        </button>
      }
    />
  );
}

function ResultCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="result-card flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
        <p className="mono mt-1 break-all text-sm text-[var(--text-primary)]">{value}</p>
      </div>
      <CopyButton value={value} label={`Copy ${label}`} compact />
    </div>
  );
}
