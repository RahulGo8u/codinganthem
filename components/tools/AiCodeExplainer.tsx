"use client";

import { useState } from "react";
import { Sparkles, Loader2, AlertCircle, Copy } from "lucide-react";
import { ToolPageHeader } from "@/components/ToolPageHeader";
import { AiDisclaimer } from "@/components/AiDisclaimer";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("ai-code-explainer")!;
const MAX_CODE_CHARS = 8_000;

const SAMPLE_CODE = `function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}`;

interface ExplainResult {
  summary: string;
  breakdown: string;
}

export function AiCodeExplainer() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ExplainResult | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleExplain() {
    setError("");
    setResult(null);

    const trimmed = code.trim();
    if (!trimmed) {
      setError("Please paste some code to explain.");
      return;
    }
    if (trimmed.length > MAX_CODE_CHARS) {
      setError(`Code is too long. Max ${MAX_CODE_CHARS.toLocaleString()} characters.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/code-explainer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed, language: language.trim() || undefined }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setResult(data);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(`${result.summary}\n\n${result.breakdown}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const charCount = code.length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
      <ToolPageHeader
        tool={tool}
        trailing={
          <button
            type="button"
            onClick={() => {
              setCode(SAMPLE_CODE);
              setLanguage("TypeScript");
              setResult(null);
              setError("");
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Load sample
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm">
        <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          Language (optional)
          <input
            type="text"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="auto-detect"
            spellCheck={false}
            className="w-28 h-7 px-2 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
              Paste your code
            </label>
            <span className="text-xs text-[var(--text-muted)]">
              {charCount.toLocaleString()} / {MAX_CODE_CHARS.toLocaleString()}
            </span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste a function, class, or any code snippet..."
            spellCheck={false}
            maxLength={MAX_CODE_CHARS}
            className="mono min-h-[320px] p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none leading-relaxed"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            Explanation
          </label>
          <div className="min-h-[320px] p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] overflow-auto flex flex-col gap-4">
            {result ? (
              <>
                <div className="flex flex-col gap-3 flex-1">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Summary</p>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>{result.summary}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Breakdown</p>
                    <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text-primary)" }}>{result.breakdown}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-[var(--border)]">
                  <AiDisclaimer />
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border shrink-0 transition-all ${
                      copied
                        ? "bg-[#22c55e]/10 border-[#22c55e]/40 text-[#22c55e]"
                        : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                    }`}
                  >
                    <Copy size={12} />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">
                {loading ? "Explaining your code..." : "Your code explanation will appear here."}
              </p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 px-3 py-2.5 rounded-lg border border-[#ef4444]/40 bg-[#ef4444]/10 text-xs text-[#ef4444] leading-relaxed">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={handleExplain}
        disabled={loading || !code.trim()}
        className="flex items-center justify-center gap-2 h-10 rounded-lg bg-[#6366f1] text-white text-sm font-medium hover:bg-[#4f46e5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full max-w-xs mx-auto"
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Explaining...
          </>
        ) : (
          <>
            <Sparkles size={14} />
            Explain Code
          </>
        )}
      </button>
    </div>
  );
}
