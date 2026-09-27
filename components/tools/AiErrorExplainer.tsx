"use client";

import { useState } from "react";
import { Sparkles, Loader2, AlertCircle, AlertTriangle, Copy } from "lucide-react";
import { ToolPageHeader } from "@/components/ToolPageHeader";
import { AiDisclaimer } from "@/components/AiDisclaimer";
import { DataFlowNotice } from "@/components/DataFlowNotice";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("ai-error-explainer")!;
const MAX_ERROR_CHARS = 6_000;

const SAMPLE_ERROR = `TypeError: Cannot read properties of undefined (reading 'name')
    at renderUser (app.js:42:18)
    at processQueue (app.js:88:5)
    at HTMLButtonElement.<anonymous> (app.js:101:3)`;

const ENVIRONMENTS = [
  { value: "", label: "Auto-detect" },
  { value: "JavaScript / Node.js", label: "JavaScript / Node" },
  { value: "Python", label: "Python" },
  { value: "Java", label: "Java" },
  { value: "Go", label: "Go" },
  { value: "Docker / DevOps", label: "Docker / DevOps" },
];

interface ErrorResult {
  diagnosis: string;
  likelyCause: string;
  suggestedFix: string;
}

export function AiErrorExplainer() {
  const [errorText, setErrorText] = useState("");
  const [environment, setEnvironment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ErrorResult | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleExplain() {
    setError("");
    setResult(null);

    const trimmed = errorText.trim();
    if (!trimmed) {
      setError("Please paste an error message or stack trace.");
      return;
    }
    if (trimmed.length > MAX_ERROR_CHARS) {
      setError(`Error message is too long. Max ${MAX_ERROR_CHARS.toLocaleString()} characters.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/error-explainer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: trimmed, environment: environment || undefined }),
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
    navigator.clipboard.writeText(
      `Diagnosis: ${result.diagnosis}\n\nLikely cause: ${result.likelyCause}\n\nSuggested fix: ${result.suggestedFix}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const charCount = errorText.length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6 pb-24">
      <ToolPageHeader
        tool={tool}
        trailing={
          <button
            type="button"
            onClick={() => {
              setErrorText(SAMPLE_ERROR);
              setEnvironment("JavaScript / Node.js");
              setResult(null);
              setError("");
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Load sample
          </button>
        }
      />

      <DataFlowNotice destination="Google Gemini (via our server)" />

      <div className="px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)]">
        <label className="flex flex-col gap-1.5 sm:hidden text-xs text-[var(--text-muted)]">
          Environment
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]"
          >
            {ENVIRONMENTS.map((env) => (
              <option key={env.value} value={env.value}>
                {env.label}
              </option>
            ))}
          </select>
        </label>
        <div
          className="hidden sm:flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Environment"
        >
          {ENVIRONMENTS.map((env) => (
            <button
              key={env.value}
              type="button"
              onClick={() => setEnvironment(env.value)}
              aria-pressed={environment === env.value}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                environment === env.value
                  ? "bg-[#6366f1]/15 text-[#6366f1] border-[#6366f1]/40"
                  : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-primary)]"
              }`}
            >
              {env.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            Paste the error message or stack trace
          </label>
          <span className="text-xs text-[var(--text-muted)]">
            {charCount.toLocaleString()} / {MAX_ERROR_CHARS.toLocaleString()}
          </span>
        </div>
        <textarea
          value={errorText}
          onChange={(e) => setErrorText(e.target.value)}
          placeholder="Paste the full error message or stack trace here..."
          spellCheck={false}
          maxLength={MAX_ERROR_CHARS}
          className="mono min-h-[160px] sm:min-h-[200px] p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-y focus:outline-none leading-relaxed"
        />
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 px-3 py-2.5 rounded-lg border border-[#ef4444]/40 bg-[#ef4444]/10 text-xs text-[#ef4444] leading-relaxed">
          <AlertCircle size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div aria-busy={loading} aria-live="polite">
        {loading && !result && (
          <p className="text-sm text-[var(--text-muted)]">Diagnosing error…</p>
        )}
        {result && (
          <div className="flex flex-col gap-4 p-5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)]">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <AlertTriangle size={16} className="text-[#f59e0b] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Diagnosis</p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>{result.diagnosis}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border shrink-0 self-start transition-all ${
                  copied
                    ? "bg-[#22c55e]/10 border-[#22c55e]/40 text-[#22c55e]"
                    : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                }`}
              >
                <Copy size={12} aria-hidden="true" />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Likely cause</p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>{result.likelyCause}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Suggested fix</p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>{result.suggestedFix}</p>
            </div>
            <div className="pt-2 border-t border-[var(--border)]">
              <AiDisclaimer />
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 z-20 -mx-6 border-t border-[var(--border)] bg-[var(--bg-base)]/90 backdrop-blur-md px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={handleExplain}
          disabled={loading || !errorText.trim()}
          aria-busy={loading}
          className="flex items-center justify-center gap-2 h-11 w-full sm:max-w-xs sm:mx-auto rounded-lg bg-[#6366f1] text-white text-sm font-medium hover:bg-[#4f46e5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" aria-hidden="true" />
              Diagnosing...
            </>
          ) : (
            <>
              <Sparkles size={14} aria-hidden="true" />
              Explain Error
            </>
          )}
        </button>
      </div>
    </div>
  );
}
