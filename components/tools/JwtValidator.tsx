"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ToolShell } from "@/components/ToolShell";
import { SegmentedControl } from "@/components/SegmentedControl";
import { getToolBySlug } from "@/lib/tools";
import { HighlightedOutput } from "@/lib/highlight";

const tool = getToolBySlug("jwt-validator")!;

type Algo = "HS256" | "HS384" | "HS512";
const ALGO_MAP: Record<Algo, string> = { HS256: "SHA-256", HS384: "SHA-384", HS512: "SHA-512" };

const SAMPLE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
const SAMPLE_SECRET = "your-256-bit-secret";

function base64url(buf: ArrayBuffer): string {
  return btoa(Array.from(new Uint8Array(buf), (b) => String.fromCharCode(b)).join(""))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function base64UrlDecode(str: string): string {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  return atob(b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "="));
}

async function verifyJwt(token: string, secret: string, algo: Algo): Promise<{
  valid: boolean; expired: boolean; payload: Record<string, unknown>; header: Record<string, unknown>;
}> {
  const parts = token.trim().split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT — expected 3 dot-separated parts.");

  const header = JSON.parse(base64UrlDecode(parts[0])) as Record<string, unknown>;
  const payload = JSON.parse(base64UrlDecode(parts[1])) as Record<string, unknown>;

  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: ALGO_MAP[algo] },
    false, ["sign"]
  );
  const expectedSig = base64url(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${parts[0]}.${parts[1]}`))
  );

  const valid = expectedSig === parts[2];
  const exp = typeof payload.exp === "number" ? payload.exp : null;
  const expired = exp !== null && Date.now() > exp * 1000;

  return { valid, expired, payload, header };
}

export function JwtValidator() {
  const [token, setToken] = useState("");
  const [secret, setSecret] = useState("");
  const [algo, setAlgo] = useState<Algo>("HS256");
  const [showSecret, setShowSecret] = useState(false);
  const [output, setOutput] = useState("");
  const [statusLines, setStatusLines] = useState<{ label: string; bad: boolean }[]>([]);
  const [header, setHeader] = useState<Record<string, unknown> | null>(null);
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | undefined>();
  const reqRef = useRef(0);
  const hydratedQuery = useRef(false);

  // Prefill token from ?token= when arriving from JWT Decoder.
  useEffect(() => {
    if (hydratedQuery.current || typeof window === "undefined") return;
    hydratedQuery.current = true;
    const params = new URLSearchParams(window.location.search);
    const q = params.get("token");
    if (q) {
      void Promise.resolve().then(() => setToken(q));
    }
  }, []);

  useEffect(() => {
    const id = ++reqRef.current;
    if (!token.trim() || !secret) {
      void Promise.resolve().then(() => {
        if (id !== reqRef.current) return;
        setOutput("");
        setStatusLines([]);
        setHeader(null);
        setPayload(null);
        setError(undefined);
      });
      return;
    }
    verifyJwt(token, secret, algo)
      .then(({ valid, expired, payload: p, header: h }) => {
        if (id !== reqRef.current) return;
        const status: { label: string; bad: boolean }[] = [
          { label: valid ? "Signature: Valid" : "Signature: Invalid", bad: !valid },
          ...(valid && expired ? [{ label: "Expiry: Token expired", bad: true }] : []),
          ...(valid && !expired && p.exp ? [{ label: "Expiry: Valid", bad: false }] : []),
        ];
        setStatusLines(status);
        setHeader(h);
        setPayload(p);
        setOutput(
          [
            ...status.map((s) => s.label),
            "",
            "Header:",
            JSON.stringify(h, null, 2),
            "",
            "Payload:",
            JSON.stringify(p, null, 2),
          ].join("\n")
        );
        setError(undefined);
      })
      .catch((e: unknown) => {
        if (id !== reqRef.current) return;
        setOutput("");
        setStatusLines([]);
        setHeader(null);
        setPayload(null);
        setError((e as Error).message);
      });
  }, [token, secret, algo]);

  const decoderHref = token.trim()
    ? `/tools/jwt-decoder?token=${encodeURIComponent(token.trim())}`
    : "/tools/jwt-decoder";

  return (
    <ToolShell
      tool={tool}
      input={token}
      output={output}
      onInputChange={setToken}
      error={error}
      hideFileActions
      showClear
      inputLabel="JWT Token"
      outputLabel="Validation Result"
      inputPlaceholder="Paste your JWT here (eyJ...)"
      outputPlaceholder="Validation result will appear here..."
      outputContent={
        header && payload ? (
          <div
            className={`flex flex-col border-l-4 ${
              statusLines.some((s) => s.bad) ? "border-l-[var(--error)]" : "border-l-[#22c55e]"
            }`}
          >
            <div className="px-4 py-3 border-b border-[var(--border)] flex flex-wrap gap-2">
              {statusLines.map((line) => (
                <span
                  key={line.label}
                  className={`badge mono ${line.bad ? "" : "badge-success"}`}
                  style={
                    line.bad
                      ? {
                          color: "var(--error)",
                          background: "color-mix(in srgb, var(--error) 12%, transparent)",
                          borderColor: "color-mix(in srgb, var(--error) 35%, transparent)",
                        }
                      : undefined
                  }
                >
                  {line.label}
                </span>
              ))}
            </div>
            <div className="px-4 pt-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Header</p>
            </div>
            <HighlightedOutput code={JSON.stringify(header, null, 2)} />
            <div className="px-4 pt-1 border-t border-[var(--border)]">
              <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)] pt-2">Payload</p>
            </div>
            <HighlightedOutput code={JSON.stringify(payload, null, 2)} />
          </div>
        ) : token.trim() && !secret ? (
          <p className="p-4 text-sm text-[var(--text-muted)] leading-relaxed" role="status">
            Enter your secret key in the field above to validate the signature.
          </p>
        ) : undefined
      }
      extraActions={
        <>
          <button
            type="button"
            onClick={() => { setToken(SAMPLE_TOKEN); setSecret(SAMPLE_SECRET); }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Load sample
          </button>
          <Link
            href={decoderHref}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Open in JWT Decoder
          </Link>
        </>
      }
      options={
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 w-full">
          <SegmentedControl
            label="HMAC algorithm"
            value={algo}
            onChange={setAlgo}
            segments={(["HS256", "HS384", "HS512"] as Algo[]).map((a) => ({
              value: a,
              label: a,
            }))}
          />
          <div className="flex flex-col gap-1 min-w-0 flex-1 sm:max-w-md">
            <label htmlFor="jwt-validator-secret" className="text-xs text-[var(--text-muted)]">
              Secret
            </label>
            <div className="relative w-full">
              <input
                id="jwt-validator-secret"
                type={showSecret ? "text" : "password"}
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Enter secret key..."
                autoComplete="off"
                className="mono w-full pr-16 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-xs text-[var(--text-primary)] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowSecret((v) => !v)}
                aria-label={showSecret ? "Hide secret" : "Show secret"}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                {showSecret ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        </div>
      }
    />
  );
}
