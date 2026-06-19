"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import type { Tool } from "@/lib/tools";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_PREFIXES = ["text/"];
const ALLOWED_MIME_TYPES = new Set([
  "application/json",
  "application/xml",
  "application/x-yaml",
  "application/yaml",
]);

interface ToolShellProps {
  tool: Tool;
  input: string;
  output: string;
  onInputChange: (value: string) => void;
  error?: string;
  options?: React.ReactNode;
  inputLabel?: string;
  outputLabel?: string;
  inputPlaceholder?: string;
  outputPlaceholder?: string;
  onClear?: () => void;
  /** Custom content to replace the standard output pane */
  outputContent?: React.ReactNode;
  /** Extra buttons for the action bar */
  extraActions?: React.ReactNode;
  /** Hide Upload file + Download buttons (e.g. generator tools) */
  hideFileActions?: boolean;
  /** Hide the input pane entirely — output takes full width (e.g. UUID / password generators) */
  hideInputPane?: boolean;
}

export function ToolShell({
  tool,
  input,
  output,
  onInputChange,
  error,
  options,
  inputLabel = "Input",
  outputLabel = "Output",
  inputPlaceholder = "Paste your input here...",
  outputPlaceholder = "Output will appear here...",
  onClear,
  outputContent,
  extraActions,
  hideFileActions = false,
  hideInputPane = false,
}: ToolShellProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }, [output]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tool.slug}-output.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [output, tool.slug]);

  const handleUpload = useCallback(() => {
    const input_el = document.createElement("input");
    input_el.type = "file";
    input_el.accept = "text/*,.json,.xml,.yaml,.yml,.csv,.md,.txt";
    input_el.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (file.size > MAX_FILE_SIZE) {
        setUploadError(
          `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 5 MB.`
        );
        return;
      }

      const isAllowed =
        ALLOWED_MIME_PREFIXES.some((p) => file.type.startsWith(p)) ||
        ALLOWED_MIME_TYPES.has(file.type) ||
        file.type === "";

      if (!isAllowed) {
        setUploadError(
          "Only text-based files are supported (JSON, XML, CSV, YAML, TXT, etc.)."
        );
        return;
      }

      setUploadError(null);
      const reader = new FileReader();
      reader.onload = (ev) => onInputChange((ev.target?.result as string) ?? "");
      reader.onerror = () => setUploadError("Failed to read file. Please try again.");
      reader.readAsText(file);
    };
    input_el.click();
  }, [onInputChange]);

  const handleClear = useCallback(() => {
    onInputChange("");
    setUploadError(null);
    onClear?.();
  }, [onInputChange, onClear]);

  const charCount = input.length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            All tools
          </Link>
          <span className="text-[var(--border)]">/</span>
          <h1 className="text-sm font-medium text-[var(--text-primary)]">{tool.name}</h1>
        </div>

        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(window.location.href);
              setShared(true);
              setTimeout(() => setShared(false), 1500);
            } catch {
              setShared(false);
            }
          }}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            shared
              ? "text-[#22c55e]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
          title="Copy link to this tool"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          {shared ? "Copied!" : "Share"}
        </button>
      </div>

      {/* Options bar */}
      {options && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm">
          {options}
        </div>
      )}

      {/* Panes */}
      <div className={`grid grid-cols-1 gap-4 ${hideInputPane ? "" : "lg:grid-cols-2"}`}>
        {/* Input */}
        {!hideInputPane && <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
              {inputLabel}
            </label>
            {charCount > 0 && (
              <span className="text-xs text-[var(--text-muted)]">
                {charCount.toLocaleString()} chars
              </span>
            )}
          </div>
          <div className={`relative flex-1 rounded-lg border ${error ? "border-[#ef4444]" : "border-[var(--border)]"} bg-[var(--bg-surface)] overflow-hidden`}>
            <textarea
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={inputPlaceholder}
              spellCheck={false}
              className="mono w-full min-h-[320px] h-full p-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-transparent resize-none focus:outline-none leading-relaxed"
            />
          </div>
          {error && (
            <p className="text-xs text-[#ef4444] leading-relaxed">{error}</p>
          )}
        </div>}

        {/* Output */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            {outputLabel}
          </label>
          <div className="relative flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
            {outputContent ? (
              <div className="w-full min-h-[320px] p-4">{outputContent}</div>
            ) : (
              <textarea
                value={output}
                readOnly
                placeholder={outputPlaceholder}
                spellCheck={false}
                className="mono w-full min-h-[320px] h-full p-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-transparent resize-none focus:outline-none leading-relaxed"
              />
            )}
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-col gap-2">
        {uploadError && (
          <p className="text-xs text-[#ef4444] leading-relaxed">{uploadError}</p>
        )}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {!hideFileActions && (
            <button
              onClick={handleClear}
              disabled={!input}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Clear
            </button>
          )}
          {!hideFileActions && (
            <button
              onClick={handleUpload}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              Upload file
            </button>
          )}
          {extraActions}
        </div>

        <div className="flex items-center gap-2">
          {!hideFileActions && (
            <button
              onClick={handleDownload}
              disabled={!output}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Download
            </button>
          )}
          <button
            onClick={handleCopy}
            disabled={!output}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              copied
                ? "bg-[#22c55e]/10 border-[#22c55e]/40 text-[#22c55e]"
                : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] disabled:opacity-40 disabled:cursor-not-allowed"
            }`}
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
