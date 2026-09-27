"use client";

import { useState, useEffect, useRef } from "react";
import { getToolBySlug } from "@/lib/tools";
import { ToolPageHeader } from "@/components/ToolPageHeader";
import { CopyButton } from "@/components/CopyButton";
import { SegmentedControl } from "@/components/SegmentedControl";

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
  const reqRef = useRef(0);

  useEffect(() => {
    if (!payload.trim() || !secret) {
      const timer = window.setTimeout(() => {
        setOutput("");
        setError(undefined);
      }, 0);
      return () => window.clearTimeout(timer);
    }
    const id = ++reqRef.current;
    const timer = window.setTimeout(() => {
      setError(undefined);
      signJwt(payload, secret, algo)
        .then((token) => {
          if (id === reqRef.current) { setOutput(token); setError(undefined); }
        })
        .catch((e: unknown) => {
          if (id === reqRef.current) { setOutput(""); setError((e as Error).message); }
        });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [payload, secret, algo]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6 pb-24">
      <ToolPageHeader
        tool={tool}
        trailing={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/30">
            <span className="text-xs text-[#f59e0b]">For testing only — do not use real secrets in this tool</span>
          </div>
        }
      />

      {/* Options */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm">
        <SegmentedControl
          label="Algorithm"
          value={algo}
          onChange={setAlgo}
          segments={(["HS256", "HS384", "HS512"] as Algo[]).map((a) => ({
            value: a,
            label: a,
          }))}
          compact
        />
      </div>

      {/* Two panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: payload + secret */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="jwt-payload" className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Payload</label>
            <textarea
              id="jwt-payload"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              spellCheck={false}
              className="mono min-h-[160px] sm:min-h-[200px] p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-y focus:outline-none leading-relaxed"
              placeholder='{"sub": "123", "name": "Alice"}'
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="jwt-secret" className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Secret key</label>
            <div className="relative">
              <input
                id="jwt-secret"
                type={showSecret ? "text" : "password"}
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                autoComplete="off"
                className="mono w-full px-4 py-3 pr-16 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] focus:outline-none"
                placeholder="your-secret-key"
              />
              <button
                type="button"
                onClick={() => setShowSecret((v) => !v)}
                aria-label={showSecret ? "Hide secret key" : "Show secret key"}
                aria-pressed={showSecret}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-xs font-medium"
              >
                {showSecret ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          {error && <p role="alert" className="text-xs text-[#ef4444] leading-relaxed">{error}</p>}
        </div>

        {/* Right: generated token */}
        <div className="flex flex-col gap-2">
          <label htmlFor="jwt-output" className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Generated JWT</label>
          <textarea
            id="jwt-output"
            value={output}
            readOnly
            spellCheck={false}
            className="mono min-h-[200px] sm:min-h-[280px] p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-y focus:outline-none leading-relaxed break-all"
            placeholder="JWT will appear here..."
          />
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 z-20 -mx-6 border-t border-[var(--border)] bg-[var(--bg-base)]/90 backdrop-blur-md px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => { setPayload(DEFAULT_PAYLOAD); setSecret("your-256-bit-secret"); setShowSecret(false); }}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
        <CopyButton value={output} label="Copy JWT" />
      </div>
    </div>
  );
}
