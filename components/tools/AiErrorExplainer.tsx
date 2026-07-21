"use client";

import { useState } from "react";
import { Sparkles, Loader2, AlertCircle, AlertTriangle } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AiDisclaimer } from "@/components/AiDisclaimer";

const MAX_ERROR_CHARS = 6_000;

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

  const charCount = errorText.length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
      <Breadcrumb current="AI Error Message Explainer" />

      {/* Options bar */}
      <div className="flex flex-wrap items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm">
        {ENVIRONMENTS.map((env) => (
          <button
            key={env.value}
            onClick={() => setEnvironment(env.value)}
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
          className="mono min-h-[200px] p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none leading-relaxed"
        />
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg border border-[#ef4444]/40 bg-[#ef4444]/10 text-xs text-[#ef4444] leading-relaxed">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Explain button */}
      <button
        onClick={handleExplain}
        disabled={loading || !errorText.trim()}
        className="flex items-center justify-center gap-2 h-10 rounded-lg bg-[#6366f1] text-white text-sm font-medium hover:bg-[#4f46e5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full max-w-xs mx-auto"
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Diagnosing...
          </>
        ) : (
          <>
            <Sparkles size={14} />
            Explain Error
          </>
        )}
      </button>

      {/* Result */}
      {result && (
        <div className="flex flex-col gap-4 p-5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)]">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="text-[#f59e0b] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Diagnosis</p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>{result.diagnosis}</p>
            </div>
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
  );
}
