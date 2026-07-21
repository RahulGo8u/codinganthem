"use client";

import { useState, useCallback } from "react";

/** Small inline copy button for a single value inside a result card (e.g. one base, one hash). */
export function CopyChip({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }, [value]);

  return (
    <button
      onClick={handleCopy}
      title={label ? `Copy ${label}` : "Copy"}
      className={`shrink-0 flex items-center gap-1 text-xs font-medium transition-colors ${
        copied ? "text-[var(--success)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      }`}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
