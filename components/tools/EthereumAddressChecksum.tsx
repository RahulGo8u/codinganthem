"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { ToolShell } from "@/components/ToolShell";
import { inspectEthereumAddress } from "@/lib/ethereum";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("ethereum-address-checksum")!;
const SAMPLE = "0x52908400098527886e0f7030069857d2e4169ee7";

export function EthereumAddressChecksum() {
  const [input, setInput] = useState(SAMPLE);
  const inspected = useMemo(() => {
    if (!input.trim()) return { result: null, error: "" };
    try {
      return { result: inspectEthereumAddress(input), error: "" };
    } catch (error) {
      return {
        result: null,
        error: error instanceof Error ? error.message : "Invalid Ethereum address.",
      };
    }
  }, [input]);

  const status = inspected.result?.status;
  const statusText =
    status === "checksummed"
      ? "Valid EIP-55 checksum"
      : status === "invalid-checksum"
        ? "Address format is valid, but the mixed-case checksum is incorrect"
        : "Valid address without an EIP-55 checksum";

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={inspected.result?.checksumAddress ?? ""}
      onInputChange={setInput}
      error={inspected.error || undefined}
      hideFileActions
      showClear
      inputLabel="Ethereum address"
      outputLabel="EIP-55 checksum address"
      inputPlaceholder="0x..."
      outputContent={
        inspected.result ? (
          <div className="flex flex-col gap-4 p-4">
            <div
              role="status"
              className={`rounded-lg border px-3 py-2 text-xs leading-relaxed ${
                status === "checksummed"
                  ? "border-[var(--success)]/40 bg-[var(--success)]/10 text-[var(--success)]"
                  : status === "invalid-checksum"
                    ? "border-[#ef4444]/40 bg-[#ef4444]/10 text-[#ef4444]"
                    : "border-[#f59e0b]/40 bg-[#f59e0b]/10 text-[#f59e0b]"
              }`}
            >
              {statusText}
            </div>

            <div className="result-card flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Checksummed address
                </p>
                <p className="mono mt-1 break-all text-sm text-[var(--text-primary)]">
                  {inspected.result.checksumAddress}
                </p>
              </div>
              <CopyButton value={inspected.result.checksumAddress} label="Copy address" compact />
            </div>

            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              EIP-55 encodes a checksum in letter casing to catch common typing errors. Always verify the
              destination independently before sending funds.
            </p>
          </div>
        ) : (
          <p className="p-4 text-sm text-[var(--text-muted)]">
            Enter an Ethereum address to validate it and generate its EIP-55 checksum.
          </p>
        )
      }
      extraActions={
        <button
          type="button"
          onClick={() => setInput(SAMPLE)}
          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
        >
          Load sample
        </button>
      }
    />
  );
}
