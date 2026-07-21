"use client";

import { useState, useCallback, useEffect } from "react";
import type { Tool } from "@/lib/tools";
import { Breadcrumb } from "@/components/Breadcrumb";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_EXTENSIONS = new Set([
  "txt", "text", "log",
  "json", "jsonl", "ndjson",
  "xml", "html", "htm", "svg",
  "yaml", "yml",
  "csv", "tsv",
  "md", "mdx", "markdown",
  "js", "jsx", "ts", "tsx",
  "css", "scss", "sass", "less",
  "sh", "bash", "zsh",
  "py", "rb", "go", "rs", "java", "c", "cpp", "h", "cs",
  "toml", "ini", "cfg", "conf", "env",
  "graphql", "gql", "sql",
  "mmd", "mermaid",
]);

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
  /** Custom content to replace the standard input pane (e.g. a syntax-highlighted editor) */
  inputContent?: React.ReactNode;
  /** Custom content to replace the standard output pane */
  outputContent?: React.ReactNode;
  /** Extra buttons for the action bar (left side, next to Clear/Upload) */
  extraActions?: React.ReactNode;
  /** Extra buttons for the action bar (right side, next to Download/Copy) */
  extraRightActions?: React.ReactNode;
  /** Right-aligned badges shown in the header next to the title (e.g. "WCAG 2.1 Ready") */
  badges?: React.ReactNode;
  /** Hide Upload file + Download buttons (e.g. generator tools) */
  hideFileActions?: boolean;
  /** Hide only the default (.txt) Download button while keeping Upload — use when a tool provides its own download action via extraActions */
  hideDownload?: boolean;
  /** Show Clear button even when hideFileActions is true (for tools with input but no file I/O) */
  showClear?: boolean;
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
  inputContent,
  outputContent,
  extraActions,
  extraRightActions,
  badges,
  hideFileActions = false,
  hideDownload = false,
  showClear = false,
  hideInputPane = false,
}: ToolShellProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

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

  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 1500);
    } catch {
      setShared(false);
    }
  }, []);

  const handleShareX = useCallback(() => {
    const url = window.location.href;
    const text = `${tool.name} — free online developer tool`;
    const intent = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(intent, "_blank", "noopener,noreferrer");
  }, [tool.name]);

  const handleNativeShare = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.share) return;
    try {
      await navigator.share({
        title: tool.name,
        text: tool.description,
        url: window.location.href,
      });
    } catch {
      // user cancelled or share failed — ignore
    }
  }, [tool.name, tool.description]);

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
    input_el.accept = "text/*,.json,.jsonl,.xml,.yaml,.yml,.csv,.tsv,.md,.mdx,.toml,.ini,.cfg,.conf,.graphql,.gql,.sql,.mmd,.mermaid";
    input_el.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (file.size > MAX_FILE_SIZE) {
        setUploadError(
          `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 5 MB.`
        );
        return;
      }

      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        setUploadError(
          `".${ext}" files are not supported. Only plain-text files are allowed (JSON, YAML, CSV, XML, Markdown, source code, etc.).`
        );
        return;
      }

      const isMimeAllowed =
        ALLOWED_MIME_PREFIXES.some((p) => file.type.startsWith(p)) ||
        ALLOWED_MIME_TYPES.has(file.type) ||
        file.type === "";

      if (!isMimeAllowed) {
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
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6 pb-24">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Breadcrumb current={tool.name} asHeading={false} />

        {/* Title row */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1.5 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              {tool.name}
            </h1>
            {tool.description && (
              <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-2xl">
                {tool.description}
              </p>
            )}
          </div>
          {badges && <div className="flex items-center gap-2 flex-wrap shrink-0">{badges}</div>}
        </div>
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
            {inputContent ? (
              <div className="w-full min-h-[320px] h-full">{inputContent}</div>
            ) : (
              <textarea
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder={inputPlaceholder}
                spellCheck={false}
                className="mono w-full min-h-[320px] h-full p-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-transparent resize-none focus:outline-none leading-relaxed"
              />
            )}
          </div>
          {error && (
            <p className="text-xs text-[#ef4444] leading-relaxed">{error}</p>
          )}
        </div>}

        {/* Output */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
              {outputLabel}
            </label>
            {(!outputContent || output !== "") && (
              <button
                onClick={handleCopy}
                disabled={!output}
                title="Copy to clipboard"
                className="flex items-center gap-1 text-xs text-[#22c55e] hover:text-[#16a34a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>
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

      {/* Sticky action bar */}
      <div className="sticky bottom-0 -mx-6 mt-2 border-t border-[var(--border)] bg-[var(--bg-base)]/90 backdrop-blur-md">
        <div className="px-6 py-3 flex flex-col gap-2">
          {uploadError && (
            <p className="text-xs text-[#ef4444] leading-relaxed">{uploadError}</p>
          )}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              {(!hideFileActions || showClear) && (
                <button
                  onClick={handleClear}
                  disabled={!input}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#ef4444]/40 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 hover:border-[#ef4444]/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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

            <div className="flex items-center gap-2 flex-wrap">
              {extraRightActions}
              <button
                onClick={handleShareX}
                title="Share on X"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.227-8.26L1.99 2.25h7.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="hidden sm:inline">Share</span>
              </button>
              {canNativeShare && (
                <button
                  onClick={handleNativeShare}
                  title="Share via device"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                </button>
              )}
              <button
                onClick={handleCopyUrl}
                title="Copy link to this tool"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  shared
                    ? "border-[#22c55e]/40 text-[#22c55e]"
                    : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                }`}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                {shared ? "Copied!" : "Copy URL"}
              </button>
              <a
                href="https://buymeacoffee.com/codinganthem"
                target="_blank"
                rel="noopener noreferrer"
                title="Support CodingAnthem"
                className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-[var(--text-muted)] hover:text-[#f59e0b] transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                  <line x1="6" y1="1" x2="6" y2="4" />
                  <line x1="10" y1="1" x2="10" y2="4" />
                  <line x1="14" y1="1" x2="14" y2="4" />
                </svg>
                <span className="hidden sm:inline">Coffee</span>
              </a>
              {!hideFileActions && !hideDownload && (
                <button
                  onClick={handleDownload}
                  disabled={!output}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Download
                </button>
              )}
              {(!outputContent || output !== "") && (
                <button
                  onClick={handleCopy}
                  disabled={!output}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium border border-[#22c55e]/40 bg-[#22c55e]/10 text-[#22c55e] hover:bg-[#22c55e]/20 hover:border-[#22c55e]/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {copied ? "Copied ✓" : "Copy"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
