"use client";

import { useState, useCallback, useId } from "react";
import type { Tool } from "@/lib/tools";
import { Breadcrumb } from "@/components/Breadcrumb";
import { DataFlowNotice } from "@/components/DataFlowNotice";
import { DownloadButton } from "@/components/DownloadButton";
import { downloadBlob } from "@/lib/download";

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
  /** Optional actions rendered beside the title, keeping samples above the fold. */
  headerActions?: React.ReactNode;
  /** Override the text download name and MIME type. */
  downloadFileName?: string;
  downloadMimeType?: string;
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
  headerActions,
  downloadFileName,
  downloadMimeType = "text/plain",
}: ToolShellProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [canNativeShare] = useState(
    () => typeof navigator !== "undefined" && typeof navigator.share === "function"
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [mobilePane, setMobilePane] = useState<"input" | "output">("input");
  const [dragging, setDragging] = useState(false);
  const inputId = useId();
  const outputId = useId();

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
    downloadBlob(
      new Blob([output], { type: downloadMimeType }),
      downloadFileName ?? `${tool.slug}-output.txt`
    );
  }, [downloadFileName, downloadMimeType, output, tool.slug]);

  const readTextFile = useCallback((file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(
        `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 5 MB.`
      );
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      setUploadError(
        `".${ext}" files are not supported. Choose a plain-text file such as JSON, YAML, CSV, XML, Markdown, or source code.`
      );
      return;
    }

    const isMimeAllowed =
      ALLOWED_MIME_PREFIXES.some((prefix) => file.type.startsWith(prefix)) ||
      ALLOWED_MIME_TYPES.has(file.type) ||
      file.type === "";
    if (!isMimeAllowed) {
      setUploadError("Only text-based files are supported.");
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => onInputChange((event.target?.result as string) ?? "");
    reader.onerror = () => setUploadError("Failed to read file. Please try again.");
    reader.readAsText(file);
  }, [onInputChange]);

  const handleUpload = useCallback(() => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "text/*,.json,.jsonl,.xml,.yaml,.yml,.csv,.tsv,.md,.mdx,.toml,.ini,.cfg,.conf,.graphql,.gql,.sql,.mmd,.mermaid";
    fileInput.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) readTextFile(file);
    };
    fileInput.click();
  }, [readTextFile]);

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
        <Breadcrumb current={tool.name} category={tool.category} asHeading={false} />

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
          {(badges || headerActions) && (
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {badges}
              {headerActions}
            </div>
          )}
        </div>
      </div>

      {tool.dataFlow === "server" && <DataFlowNotice destination="our server or the configured AI provider" />}

      {/* Options bar */}
      {options && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm">
          {options}
        </div>
      )}

      {!hideInputPane && (
        <div
          role="tablist"
          aria-label="Tool panes"
          className="grid grid-cols-2 gap-1 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-1 lg:hidden"
        >
          {(["input", "output"] as const).map((pane) => (
            <button
              key={pane}
              type="button"
              role="tab"
              aria-selected={mobilePane === pane}
              onClick={() => setMobilePane(pane)}
              className={`rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                mobilePane === pane
                  ? "bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                  : "text-[var(--text-muted)]"
              }`}
            >
              {pane === "input" ? inputLabel : outputLabel}
            </button>
          ))}
        </div>
      )}

      {/* Panes */}
      <div className={`grid grid-cols-1 gap-4 ${hideInputPane ? "" : "lg:grid-cols-2"}`}>
        {/* Input */}
        {!hideInputPane && <div className={`${mobilePane === "input" ? "flex" : "hidden"} lg:flex flex-col gap-2`}>
          <div className="flex items-center justify-between">
            <label htmlFor={inputId} className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
              {inputLabel}
            </label>
            {charCount > 0 && (
              <span className="text-xs text-[var(--text-muted)]">
                {charCount.toLocaleString()} chars
              </span>
            )}
          </div>
          <div
            onDragOver={(event) => {
              if (hideFileActions) return;
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              if (hideFileActions) return;
              event.preventDefault();
              setDragging(false);
              const file = event.dataTransfer.files?.[0];
              if (file) readTextFile(file);
            }}
            className={`relative flex-1 rounded-lg border ${
              error
                ? "border-[#ef4444]"
                : dragging
                  ? "border-[#6366f1]"
                  : "border-[var(--border)]"
            } bg-[var(--bg-surface)] overflow-hidden`}
          >
            {inputContent ? (
              <div className="w-full min-h-[320px] h-full">{inputContent}</div>
            ) : (
              <textarea
                id={inputId}
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder={inputPlaceholder}
                spellCheck={false}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${inputId}-error` : undefined}
                className="mono w-full min-h-[240px] sm:min-h-[320px] h-full p-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-transparent resize-y focus:outline-none leading-relaxed"
              />
            )}
            {dragging && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center bg-[var(--bg-surface)]/90 text-sm font-medium text-[var(--accent-text)]">
                Drop file to load
              </div>
            )}
          </div>
          {error && (
            <p id={`${inputId}-error`} role="alert" className="text-xs text-[#ef4444] leading-relaxed">{error}</p>
          )}
          {uploadError && (
            <p role="alert" className="text-xs text-[#ef4444] leading-relaxed">{uploadError}</p>
          )}
        </div>}

        {/* Output */}
        <div className={`${hideInputPane || mobilePane === "output" ? "flex" : "hidden"} lg:flex flex-col gap-2`}>
          <div className="flex items-center justify-between">
            <label htmlFor={outputId} className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
              {outputLabel}
            </label>
          </div>
          <div className="relative flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
            {outputContent ? (
              <div className="w-full min-h-[320px] p-4">{outputContent}</div>
            ) : (
              <textarea
                id={outputId}
                value={output}
                readOnly
                placeholder={outputPlaceholder}
                spellCheck={false}
                className="mono w-full min-h-[240px] sm:min-h-[320px] h-full p-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-transparent resize-y focus:outline-none leading-relaxed"
              />
            )}
          </div>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 z-20 -mx-6 mt-2 border-t border-[var(--border)] bg-[var(--bg-base)]/90 backdrop-blur-md">
        <div className="px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2" role="group" aria-label="Input actions">
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

            <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Output actions">
              {extraRightActions}
              {!hideFileActions && !hideDownload && (
                <DownloadButton
                  onClick={handleDownload}
                  disabled={!output}
                  compact
                >
                  Download
                </DownloadButton>
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
              <details className="relative">
                <summary className="list-none cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]">
                  More
                </summary>
                <div className="absolute bottom-full right-0 mb-2 min-w-40 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-1.5 flex flex-col z-30">
                  <button type="button" onClick={handleCopyUrl} className="text-left rounded px-2 py-1.5 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]">
                    {shared ? "Link copied" : "Copy tool link"}
                  </button>
                  <button type="button" onClick={handleShareX} className="text-left rounded px-2 py-1.5 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]">
                    Share on X
                  </button>
                  {canNativeShare && (
                    <button type="button" onClick={() => void handleNativeShare()} className="text-left rounded px-2 py-1.5 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]">
                      Share via device
                    </button>
                  )}
                  <a href="https://buymeacoffee.com/codinganthem" target="_blank" rel="noopener noreferrer" className="rounded px-2 py-1.5 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[#f59e0b]">
                    Buy me a coffee
                  </a>
                </div>
              </details>
            </div>
          </div>
          <span className="sr-only" aria-live="polite">
            {copied ? "Output copied to clipboard" : shared ? "Tool link copied" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
