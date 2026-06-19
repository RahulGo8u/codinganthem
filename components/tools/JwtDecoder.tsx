"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";
import { HighlightedOutput } from "@/lib/highlight";

const tool = getToolBySlug("jwt-decoder")!;

const SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return atob(padded);
}

function tsToDate(ts: unknown): string | null {
  if (typeof ts !== "number") return null;
  const ms = ts > 1e10 ? ts : ts * 1000;
  try { return new Date(ms).toISOString(); } catch { return null; }
}

function decodeJwt(token: string): { header: unknown; payload: unknown; signature: string; meta: string[] } {
  const parts = token.trim().split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT — expected 3 dot-separated parts (header.payload.signature).");
  const header = JSON.parse(base64UrlDecode(parts[0]));
  const payload = JSON.parse(base64UrlDecode(parts[1])) as Record<string, unknown>;

  const meta: string[] = [];
  const expDate = tsToDate(payload.exp);
  if (expDate) {
    const expired = Date.now() > (payload.exp as number) * 1000;
    meta.push(`exp → ${expDate}${expired ? "  ⚠ EXPIRED" : "  ✓ valid"}`);
  }
  const iatDate = tsToDate(payload.iat);
  if (iatDate) meta.push(`iat → ${iatDate}`);
  const nbfDate = tsToDate(payload.nbf);
  if (nbfDate) meta.push(`nbf → ${nbfDate}`);

  return { header, payload, signature: parts[2], meta };
}

export function JwtDecoder() {
  const [input, setInput] = useState("");

  const { output, meta, error } = useMemo(() => {
    if (!input.trim()) return { output: "", meta: [], error: undefined };
    try {
      const { header, payload, signature, meta } = decodeJwt(input);
      const result = {
        header,
        payload,
        signature: `${signature.slice(0, 16)}… (not verified)`,
      };
      return { output: JSON.stringify(result, null, 2), meta, error: undefined };
    } catch (e) {
      return { output: "", meta: [], error: (e as Error).message };
    }
  }, [input]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      error={error}
      hideFileActions
      showClear
      inputLabel="JWT Token"
      outputLabel="Decoded"
      inputPlaceholder="Paste your JWT here (eyJ...)"
      outputPlaceholder="Decoded header and payload will appear here..."
      extraActions={
        <button
          onClick={() => setInput(SAMPLE)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
      }
      outputContent={
        output ? (
          <div className="flex flex-col">
            {meta.length > 0 && (
              <div className="px-4 py-2 border-b border-[var(--border)] flex flex-col gap-0.5">
                {meta.map((m) => (
                  <p key={m} className={`text-xs mono ${m.includes("EXPIRED") ? "text-[#ef4444]" : "text-[#22c55e]"}`}>
                    {m}
                  </p>
                ))}
              </div>
            )}
            <HighlightedOutput code={output} />
          </div>
        ) : undefined
      }
    />
  );
}
