"use client";

import { useEffect, useState } from "react";
import { ToolShell } from "@/components/ToolShell";
import { CopyButton } from "@/components/CopyButton";
import { SegmentedControl } from "@/components/SegmentedControl";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("hmac-generator")!;

type Algo = "SHA-256" | "SHA-512";
type Encoding = "hex" | "base64";

export function HmacGenerator() {
  const [message, setMessage] = useState("{\"id\":123}");
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [algo, setAlgo] = useState<Algo>("SHA-256");
  const [encoding, setEncoding] = useState<Encoding>("hex");
  const [signed, setSigned] = useState<{ key: string; signature: string; error: string } | null>(null);
  const requestKey = `${algo}\0${encoding}\0${secret}\0${message}`;
  const ready = secret && signed?.key === requestKey ? signed : null;
  const signature = ready?.signature ?? "";
  const error = ready?.error ?? "";

  useEffect(() => {
    if (!secret) return;
    let cancelled = false;
    const key = `${algo}\0${encoding}\0${secret}\0${message}`;
    void sign(message, secret, algo, encoding)
      .then((value) => {
        if (!cancelled) setSigned({ key, signature: value, error: "" });
      })
      .catch(() => {
        if (!cancelled) {
          setSigned({ key, signature: "", error: "Could not sign this message in the browser." });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [message, secret, algo, encoding]);

  return (
    <ToolShell
      tool={tool}
      input={message}
      output={signature}
      onInputChange={setMessage}
      error={error}
      hideFileActions
      showClear
      inputLabel="Message"
      outputLabel="HMAC signature"
      inputPlaceholder="Payload to sign"
      outputContent={
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-muted)]">
            Secret
            <div className="flex gap-2">
              <input
                type={showSecret ? "text" : "password"}
                value={secret}
                onChange={(event) => setSecret(event.target.value)}
                autoComplete="off"
                spellCheck={false}
                aria-label="HMAC secret"
                placeholder="Webhook signing secret"
                className="mono h-10 min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-primary)]"
              />
              <button
                type="button"
                onClick={() => setShowSecret((current) => !current)}
                className="rounded-lg border border-[var(--border)] px-3 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                {showSecret ? "Hide" : "Show"}
              </button>
            </div>
          </label>
          <div className="flex flex-wrap gap-3">
            <SegmentedControl
              label="Hash algorithm"
              value={algo}
              onChange={setAlgo}
              compact
              segments={[
                { value: "SHA-256", label: "SHA-256" },
                { value: "SHA-512", label: "SHA-512" },
              ]}
            />
            <SegmentedControl
              label="Output encoding"
              value={encoding}
              onChange={setEncoding}
              compact
              segments={[
                { value: "hex", label: "Hex" },
                { value: "base64", label: "Base64" },
              ]}
            />
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Signature</p>
            {signature ? (
              <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
                <p className="mono min-w-0 break-all text-sm text-[var(--text-primary)]">{signature}</p>
                <CopyButton value={signature} label="Copy signature" compact />
              </div>
            ) : (
              <p className="mt-2 text-sm text-[var(--text-muted)]">Enter a secret to generate the signature locally.</p>
            )}
          </div>
          <p className="text-xs leading-relaxed text-[var(--text-muted)]">
            Signing uses the Web Crypto API in your browser. The secret is not sent anywhere. Do not leave a production secret on a shared computer.
          </p>
        </div>
      }
    />
  );
}

async function sign(message: string, secret: string, algo: Algo, encoding: Encoding): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: algo },
    false,
    ["sign"]
  );
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(message)));
  if (encoding === "hex") return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
