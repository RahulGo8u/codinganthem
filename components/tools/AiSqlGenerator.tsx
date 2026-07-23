"use client";

import { useState } from "react";
import { Sparkles, Loader2, AlertCircle, Copy } from "lucide-react";
import { ToolPageHeader } from "@/components/ToolPageHeader";
import { AiDisclaimer } from "@/components/AiDisclaimer";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("ai-sql-generator")!;
const MAX_DESCRIPTION_CHARS = 500;

const SAMPLE_DESCRIPTION =
  "List the top 5 customers by total order value in the last 90 days, including email and order count.";

const DIALECTS = [
  { value: "", label: "Standard SQL" },
  { value: "mysql", label: "MySQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "sqlite", label: "SQLite" },
];

interface SqlResult {
  sql: string;
  explanation: string;
}

export function AiSqlGenerator() {
  const [description, setDescription] = useState("");
  const [dialect, setDialect] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SqlResult | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setError("");
    setResult(null);

    const trimmed = description.trim();
    if (!trimmed) {
      setError("Please describe the query you need.");
      return;
    }
    if (trimmed.length > MAX_DESCRIPTION_CHARS) {
      setError(`Description is too long. Max ${MAX_DESCRIPTION_CHARS} characters.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/sql-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: trimmed, dialect: dialect || undefined }),
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
    navigator.clipboard.writeText(result.sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const charCount = description.length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
      <ToolPageHeader
        tool={tool}
        trailing={
          <button
            type="button"
            onClick={() => {
              setDescription(SAMPLE_DESCRIPTION);
              setResult(null);
              setError("");
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Load sample
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm">
        {DIALECTS.map((d) => (
          <button
            key={d.value}
            onClick={() => setDialect(d.value)}
            className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
              dialect === d.value
                ? "bg-[#6366f1]/15 text-[#6366f1] border-[#6366f1]/40"
                : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-primary)]"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            Describe the query you need
          </label>
          <span className="text-xs text-[var(--text-muted)]">
            {charCount} / {MAX_DESCRIPTION_CHARS}
          </span>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder='e.g. "top 5 customers by total order value this year"'
          spellCheck={false}
          maxLength={MAX_DESCRIPTION_CHARS}
          className="min-h-[100px] p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none leading-relaxed"
        />
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 px-3 py-2.5 rounded-lg border border-[#ef4444]/40 bg-[#ef4444]/10 text-xs text-[#ef4444] leading-relaxed">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading || !description.trim()}
        className="flex items-center justify-center gap-2 h-10 rounded-lg bg-[#6366f1] text-white text-sm font-medium hover:bg-[#4f46e5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full max-w-xs mx-auto"
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles size={14} />
            Generate SQL
          </>
        )}
      </button>

      {result && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
              Generated SQL
            </label>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                copied
                  ? "bg-[#22c55e]/10 border-[#22c55e]/40 text-[#22c55e]"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
              }`}
            >
              <Copy size={12} />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="mono text-sm p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] overflow-auto whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>
            {result.sql}
          </pre>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">{result.explanation}</p>
          <AiDisclaimer />
        </div>
      )}
    </div>
  );
}
