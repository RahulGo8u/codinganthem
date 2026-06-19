"use client";

import { useState, useEffect, useRef } from "react";
import { getToolBySlug } from "@/lib/tools";
import Link from "next/link";

const tool = getToolBySlug("jwt-generator")!;

type Algo = "HS256" | "HS384" | "HS512";
const ALGO_MAP: Record<Algo, string> = {
  HS256: "SHA-256",
  HS384: "SHA-384",
  HS512: "SHA-512",
};

function base64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
  let str = "";
  bytes.forEach((b) => (str += String.fromCharCode(b)));
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function encodeSegment(obj: unknown): string {
  return base64url(new TextEncoder().encode(JSON.stringify(obj)));
}

async function signJwt(payload: string, secret: string, algo: Algo): Promise<string> {
  const parsedPayload = JSON.parse(payload);
  const header = { alg: algo, typ: "JWT" };
  const headerEnc = encodeSegment(header);
  const payloadEnc = encodeSegment(parsedPayload);
  const signingInput = `${headerEnc}.${payloadEnc}`;

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: ALGO_MAP[algo] },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", keyMaterial, new TextEncoder().encode(signingInput));
  return `${signingInput}.${base64url(signature)}`;
}

const DEFAULT_PAYLOAD = JSON.stringify(
  { sub: "1234567890", name: "John Doe", iat: Math.floor(Date.now() / 1000) },
  null,
  2
);

export function JwtGenerator() {
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD);
  const [secret, setSecret] = useState("your-256-bit-secret");
  const [algo, setAlgo] = useState<Algo>("HS256");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);
  const reqRef = useRef(0);

  useEffect(() => {
    if (!payload.trim() || !secret) { setOutput(""); setError(undefined); return; }
    const id = ++reqRef.current;
    setError(undefined);
    signJwt(payload, secret, algo)
      .then((token) => {
        if (id === reqRef.current) { setOutput(token); setError(undefined); }
      })
      .catch((e: unknown) => {
        if (id === reqRef.current) { setOutput(""); setError((e as Error).message); }
      });
  }, [payload, secret, algo]);

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { setCopied(false); }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            All tools
          </Link>
          <span className="text-[var(--border)]">/</span>
          <h1 className="text-sm font-medium text-[var(--text-primary)]">{tool.name}</h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/30">
          <span className="text-xs text-[#f59e0b]">For testing only — do not use real secrets in this tool</span>
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm">
        <label className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
          Algorithm
          <div className="flex rounded-lg border border-[var(--border)] overflow-hidden text-xs">
            {(["HS256", "HS384", "HS512"] as Algo[]).map((a) => (
              <button
                key={a}
                onClick={() => setAlgo(a)}
                className={`px-3 py-1.5 transition-colors ${
                  algo === a
                    ? "bg-[#6366f1]/15 text-[#6366f1]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </label>
      </div>

      {/* Two panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: payload + secret */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Payload</label>
            <textarea
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              spellCheck={false}
              className="mono min-h-[200px] p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none leading-relaxed"
              placeholder='{"sub": "123", "name": "Alice"}'
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Secret key</label>
            <div className="relative">
              <input
                type={showSecret ? "text" : "password"}
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="mono w-full px-4 py-3 pr-12 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] focus:outline-none"
                placeholder="your-secret-key"
              />
              <button
                onClick={() => setShowSecret((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-xs"
              >
                {showSecret ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          {error && <p className="text-xs text-[#ef4444] leading-relaxed">{error}</p>}
        </div>

        {/* Right: generated token */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Generated JWT</label>
          <textarea
            value={output}
            readOnly
            spellCheck={false}
            className="mono min-h-[280px] p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none leading-relaxed break-all"
            placeholder="JWT will appear here..."
          />
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-end gap-2">
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

      {/* Explainer */}
      {tool.explainer && (
        <div className="border-t border-[var(--border)] pt-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
            About {tool.name}
          </h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-3xl whitespace-pre-line">
            {tool.explainer}
          </p>
        </div>
      )}
    </div>
  );
}
