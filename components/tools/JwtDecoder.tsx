"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
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

type MetaItem = { key: string; label: string; bad?: boolean };

function decodeJwt(token: string): { header: unknown; payload: unknown; signature: string; meta: MetaItem[] } {
  const parts = token.trim().split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT — expected 3 dot-separated parts (header.payload.signature).");
  const header = JSON.parse(base64UrlDecode(parts[0]));
  const payload = JSON.parse(base64UrlDecode(parts[1])) as Record<string, unknown>;

  const meta: MetaItem[] = [];
  const expDate = tsToDate(payload.exp);
  if (expDate) {
    const expired = Date.now() > (payload.exp as number) * 1000;
    meta.push({
      key: "exp",
      label: expired ? `exp → ${expDate} · Expired` : `exp → ${expDate} · Valid`,
      bad: expired,
    });
  }
  const iatDate = tsToDate(payload.iat);
  if (iatDate) meta.push({ key: "iat", label: `iat → ${iatDate}` });
  const nbfDate = tsToDate(payload.nbf);
  if (nbfDate) meta.push({ key: "nbf", label: `nbf → ${nbfDate}` });

  return { header, payload, signature: parts[2], meta };
}

export function JwtDecoder() {
  const [input, setInput] = useState(SAMPLE);
  const hydratedQuery = useRef(false);

  useEffect(() => {
    if (hydratedQuery.current || typeof window === "undefined") return;
    hydratedQuery.current = true;
    const q = new URLSearchParams(window.location.search).get("token");
    if (q) {
      void Promise.resolve().then(() => setInput(q));
    }
  }, []);

  const { output, meta, error } = useMemo(() => {
    if (!input.trim()) return { output: "", meta: [] as MetaItem[], error: undefined };
    try {
      const { header, payload, signature, meta } = decodeJwt(input);
      const result = {
        header,
        payload,
        signature: `${signature.slice(0, 16)}… (not verified)`,
      };
      return { output: JSON.stringify(result, null, 2), meta, error: undefined };
    } catch (e) {
      return { output: "", meta: [] as MetaItem[], error: (e as Error).message };
    }
  }, [input]);

  const validatorHref = `/tools/jwt-validator?token=${encodeURIComponent(input.trim())}`;

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
        <>
          <button
            type="button"
            onClick={() => setInput(SAMPLE)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Load sample
          </button>
          {input.trim() && (
            <Link
              href={validatorHref}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#6366f1]/40 bg-[#6366f1]/10 text-[#6366f1] hover:bg-[#6366f1]/20 transition-colors"
            >
              Open in JWT Validator
            </Link>
          )}
        </>
      }
      outputContent={
        output ? (
          <div className="flex flex-col">
            <p className="px-4 pt-3 text-xs text-[var(--text-muted)] leading-relaxed">
              Signature is shown truncated and is not verified here.{" "}
              <Link href={validatorHref} className="text-[#6366f1] hover:underline">
                Verify with JWT Validator
              </Link>
              .
            </p>
            {meta.length > 0 && (
              <div className="px-4 py-3 border-b border-[var(--border)] flex flex-wrap gap-2">
                {meta.map((m) => (
                  <span
                    key={m.key}
                    className={`badge mono ${m.bad ? "" : "badge-success"}`}
                    style={
                      m.bad
                        ? {
                            color: "var(--error)",
                            background: "color-mix(in srgb, var(--error) 12%, transparent)",
                            borderColor: "color-mix(in srgb, var(--error) 35%, transparent)",
                          }
                        : undefined
                    }
                  >
                    {m.label}
                  </span>
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
