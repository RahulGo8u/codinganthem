"use client";

import { useState, useEffect, useRef } from "react";
import { ToolShell } from "@/components/ToolShell";
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
  const [statusLines, setStatusLines] = useState<string[]>([]);
  const [header, setHeader] = useState<Record<string, unknown> | null>(null);
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | undefined>();
  const reqRef = useRef(0);

  useEffect(() => {
    if (!token.trim() || !secret) {
      setOutput("");
      setStatusLines([]);
      setHeader(null);
      setPayload(null);
      setError(undefined);
      return;
    }
    const id = ++reqRef.current;
    verifyJwt(token, secret, algo)
      .then(({ valid, expired, payload: p, header: h }) => {
        if (id !== reqRef.current) return;
        const status = [
          `Signature: ${valid ? "✓ VALID" : "✕ INVALID"}`,
          ...(valid && expired ? ["Expiry:    ✕ TOKEN EXPIRED"] : []),
          ...(valid && !expired && p.exp ? ["Expiry:    ✓ valid"] : []),
        ];
        setStatusLines(status);
        setHeader(h);
        setPayload(p);
        setOutput(
          [...status, "", "Header:", JSON.stringify(h, null, 2), "", "Payload:", JSON.stringify(p, null, 2)].join("\n")
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
          <div className="flex flex-col">
            <div className="px-4 py-2 border-b border-[var(--border)] flex flex-col gap-0.5">
              {statusLines.map((line) => (
                <p key={line} className={`text-xs mono ${line.includes("INVALID") || line.includes("EXPIRED") ? "text-[#ef4444]" : "text-[#22c55e]"}`}>
                  {line}
                </p>
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
        ) : undefined
      }
      extraActions={
        <button
          onClick={() => { setToken(SAMPLE_TOKEN); setSecret(SAMPLE_SECRET); }}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
      }
      options={
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex rounded-lg border border-[var(--border)] overflow-hidden text-xs">
            {(["HS256", "HS384", "HS512"] as Algo[]).map((a) => (
              <button
                key={a}
                onClick={() => setAlgo(a)}
                className={`px-3 py-1.5 transition-colors ${
                  algo === a ? "bg-[#6366f1]/15 text-[#6366f1]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-[var(--text-muted)]">Secret</label>
            <div className="relative">
              <input
                type={showSecret ? "text" : "password"}
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Enter secret key..."
                className="mono pr-14 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-xs text-[var(--text-primary)] focus:outline-none w-48"
              />
              <button
                onClick={() => setShowSecret((v) => !v)}
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
