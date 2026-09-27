"use client";

import { useCallback, useState } from "react";

export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  compact = false,
  className = "",
}: {
  value: string;
  label?: string;
  copiedLabel?: string;
  compact?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1_500);
    } catch {
      setCopied(false);
    }
  }, [value]);

  return (
    <>
      <button
        type="button"
        onClick={() => void copy()}
        disabled={!value}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium border border-[#22c55e]/40 bg-[#22c55e]/10 text-[#22c55e] hover:bg-[#22c55e]/20 hover:border-[#22c55e]/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${
          compact ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm"
        } ${className}`}
      >
        {copied ? copiedLabel : label}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? `${label} successful` : ""}
      </span>
    </>
  );
}
