"use client";

import { useState } from "react";
import { Link, Loader2, CheckCircle, Copy, ExternalLink, AlertCircle } from "lucide-react";
import { validateUrl } from "@/lib/urlValidation";

const EXPIRY_OPTIONS = [
  { value: "never", label: "Never expires" },
  { value: "1h", label: "1 hour" },
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
];

interface ShortenResult {
  shortUrl: string;
  slug: string;
  expiresAt: string | null;
}

export function UrlShortener() {
  const [url, setUrl] = useState("");
  const [expiry, setExpiry] = useState("never");
  const [loading, setLoading] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ShortenResult | null>(null);
  const [copied, setCopied] = useState(false);

  function handleUrlBlur() {
    const trimmed = url.trim();
    if (!trimmed) {
      setUrlError("");
      return;
    }
    const res = validateUrl(trimmed);
    setUrlError(res.valid ? "" : (res.error ?? ""));
  }

  async function handleShorten() {
    setError("");
    setResult(null);

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setUrlError("Please enter a URL.");
      return;
    }

    // Run the same validation the server will run, up front — avoids a
    // wasted network round-trip for input that's already known to be invalid.
    const urlCheck = validateUrl(trimmedUrl);
    if (!urlCheck.valid) {
      setUrlError(urlCheck.error ?? "Invalid URL.");
      return;
    }

    setUrlError("");
    setLoading(true);
    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: trimmedUrl,
          expiry,
        }),
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
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleReset() {
    setUrl("");
    setExpiry("never");
    setUrlError("");
    setError("");
    setResult(null);
    setCopied(false);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <a
          href="/"
          className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          All tools
        </a>
        <span className="text-[var(--border)]">/</span>
        <h1 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          URL Shortener
        </h1>
      </div>

      <div className="max-w-xl flex flex-col gap-6">
        {/* Input form — hidden once a result exists */}
        {!result && (
          <div className="flex flex-col gap-4">
            {/* URL to shorten */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Paste the URL to be shortened
              </label>
              <div className={`flex items-center gap-2 rounded-lg border ${urlError ? "border-[#ef4444]" : "border-[var(--border)]"} bg-[var(--bg-surface)] px-3`}>
                <Link size={14} className="text-[var(--text-muted)] shrink-0" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setUrlError(""); }}
                  onBlur={handleUrlBlur}
                  onKeyDown={(e) => e.key === "Enter" && handleShorten()}
                  placeholder="https://example.com/very/long/url"
                  spellCheck={false}
                  autoFocus
                  className="flex-1 h-11 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
                />
              </div>
              {urlError && (
                <p className="text-xs text-[#ef4444] leading-relaxed">{urlError}</p>
              )}
            </div>

            {/* Expiry */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Expires
              </label>
              <div className="flex flex-wrap gap-1.5">
                {EXPIRY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setExpiry(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                      expiry === opt.value
                        ? "bg-[#6366f1]/15 text-[#6366f1] border-[#6366f1]/40"
                        : "bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submission error banner */}
            {error && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg border border-[#ef4444]/40 bg-[#ef4444]/10 text-xs text-[#ef4444] leading-relaxed">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Shorten button */}
            <button
              onClick={handleShorten}
              disabled={loading || !url.trim()}
              className="flex items-center justify-center gap-2 h-10 rounded-lg bg-[#6366f1] text-white text-sm font-medium hover:bg-[#4f46e5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Shortening...
                </>
              ) : (
                <>
                  <Link size={14} />
                  Shorten URL
                </>
              )}
            </button>
          </div>
        )}

        {/* Result panel — only shown after a successful shorten */}
        {result && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
              Short URL
            </label>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] flex flex-col items-center justify-center gap-4 p-8">
              <CheckCircle size={32} className="text-[#22c55e]" />
              <div className="text-center flex flex-col gap-1">
                <p className="mono text-base font-medium" style={{ color: "var(--text-primary)" }}>
                  {result.shortUrl}
                </p>
                {result.expiresAt && (
                  <p className="text-xs text-[var(--text-muted)]">
                    Expires {new Date(result.expiresAt).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium border transition-all ${
                    copied
                      ? "bg-[#22c55e]/10 border-[#22c55e]/40 text-[#22c55e]"
                      : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                  }`}
                >
                  <Copy size={13} />
                  {copied ? "Copied!" : "Copy"}
                </button>
                <a
                  href={result.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                >
                  <ExternalLink size={13} />
                  Open
                </a>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#6366f1] text-white hover:bg-[#4f46e5] transition-colors"
              >
                <Link size={14} />
                Shorten another URL
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
