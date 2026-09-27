"use client";

import { useState, useEffect, useMemo } from "react";
import { getToolBySlug } from "@/lib/tools";
import { ToolPageHeader } from "@/components/ToolPageHeader";
import { CopyButton } from "@/components/CopyButton";

const tool = getToolBySlug("totp-generator")!;

const PERIOD = 30;
const DIGITS = 6;
const SAMPLE_SECRET = "JBSWY3DPEHPK3PXP";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Decode(input: string): Uint8Array<ArrayBuffer> {
  const clean = input.replace(/=+$/, "").toUpperCase().replace(/\s+/g, "");
  if (!clean) throw new Error("Secret key is empty.");
  let bits = "";
  for (const char of clean) {
    const val = BASE32_ALPHABET.indexOf(char);
    if (val === -1) throw new Error(`Invalid Base32 character: "${char}"`);
    bits += val.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  if (bytes.length === 0) throw new Error("Secret key is too short.");
  return new Uint8Array(bytes);
}

function counterToBuffer(counter: number): Uint8Array<ArrayBuffer> {
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  const high = Math.floor(counter / 2 ** 32);
  const low = counter >>> 0;
  view.setUint32(0, high);
  view.setUint32(4, low);
  return new Uint8Array(buf);
}

async function generateTotp(secret: string, counter: number): Promise<string> {
  const keyBytes = base32Decode(secret);
  const counterBuffer = counterToBuffer(counter);

  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const signatureBuf = await crypto.subtle.sign("HMAC", key, counterBuffer);
  const signature = new Uint8Array(signatureBuf);

  const offset = signature[signature.length - 1] & 0x0f;
  const binary =
    ((signature[offset] & 0x7f) << 24) |
    ((signature[offset + 1] & 0xff) << 16) |
    ((signature[offset + 2] & 0xff) << 8) |
    (signature[offset + 3] & 0xff);

  return (binary % 10 ** DIGITS).toString().padStart(DIGITS, "0");
}

export function TotpGenerator() {
  const [secret, setSecret] = useState(SAMPLE_SECRET);
  const [issuer, setIssuer] = useState("CodingAnthem");
  const [account, setAccount] = useState("user@example.com");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const counter = Math.floor(now / 1000 / PERIOD);
  const secondsElapsed = Math.floor(now / 1000) % PERIOD;
  const secondsLeft = PERIOD - secondsElapsed;

  useEffect(() => {
    let cancelled = false;
    if (!secret.trim()) {
      void Promise.resolve().then(() => {
        if (cancelled) return;
        setCode("");
        setError(undefined);
      });
      return () => {
        cancelled = true;
      };
    }
    generateTotp(secret, counter)
      .then((otp) => {
        if (!cancelled) {
          setCode(otp);
          setError(undefined);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setCode("");
          setError((e as Error).message);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [secret, counter]);

  const otpauthUri = useMemo(() => {
    if (!secret.trim()) return "";
    const label = encodeURIComponent(`${issuer || "App"}:${account || "account"}`);
    const params = new URLSearchParams({
      secret: secret.replace(/\s+/g, "").toUpperCase(),
      issuer: issuer || "App",
      algorithm: "SHA1",
      digits: String(DIGITS),
      period: String(PERIOD),
    });
    return `otpauth://totp/${label}?${params.toString()}`;
  }, [secret, issuer, account]);

  const ringCircumference = useMemo(() => 2 * Math.PI * 28, []);
  const ringOffset = ringCircumference * (1 - secondsLeft / PERIOD);
  const urgent = secondsLeft <= 5;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
      <ToolPageHeader
        tool={tool}
        trailing={
          <button
            type="button"
            onClick={() => {
              setSecret(SAMPLE_SECRET);
              setIssuer("CodingAnthem");
              setAccount("user@example.com");
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Load sample
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <div className="flex flex-col gap-2 sm:col-span-2">
          <label htmlFor="totp-secret" className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            Base32 Secret Key
          </label>
          <input
            id="totp-secret"
            type="text"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            spellCheck={false}
            placeholder="JBSWY3DPEHPK3PXP"
            className={`mono w-full px-4 py-3 rounded-lg border ${error ? "border-[#ef4444]" : "border-[var(--border)]"} bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none`}
          />
          {error && <p role="alert" className="text-xs text-[#ef4444] leading-relaxed">{error}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="totp-issuer" className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            Issuer
          </label>
          <input
            id="totp-issuer"
            type="text"
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            placeholder="My App"
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="totp-account" className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            Account name
          </label>
          <input
            id="totp-account"
            type="text"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            placeholder="user@example.com"
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 py-10 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]">
        <div
          className="relative w-20 h-20 flex items-center justify-center"
          role="timer"
          aria-live="polite"
          aria-atomic="true"
          aria-label={`${secondsLeft} seconds remaining in this code period`}
        >
          <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90" aria-hidden="true">
            <circle cx="32" cy="32" r="28" fill="none" stroke="var(--border)" strokeWidth="4" />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke={urgent ? "#ef4444" : "#6366f1"}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={ringCircumference}
              strokeDashoffset={ringOffset}
              style={{ transition: "stroke-dashoffset 1s linear, stroke 0.2s" }}
            />
          </svg>
          <span className={`absolute text-sm font-semibold ${urgent ? "text-[#ef4444]" : "text-[var(--text-primary)]"}`}>
            {secondsLeft}s
          </span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (!code) return;
              void navigator.clipboard.writeText(code);
            }}
            disabled={!code}
            title="Click to copy code"
            className={`mono text-5xl font-semibold tracking-[0.2em] text-[var(--text-primary)] hover:text-[#6366f1] disabled:hover:text-[var(--text-primary)] transition-colors disabled:cursor-not-allowed ${
              urgent ? "animate-pulse" : ""
            }`}
          >
            {code || "------"}
          </button>
          <span id="totp-copy-hint" className="sr-only">
            Click the code or use Copy code to copy the one-time password
          </span>
          <CopyButton
            value={code}
            label="Copy code"
            copiedLabel="Copied"
            className="min-w-[7rem]"
          />
        </div>
      </div>

      {otpauthUri && !error && (
        <div className="max-w-2xl rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Authenticator setup URI
            </span>
            <CopyButton value={otpauthUri} label="Copy URI" compact />
          </div>
          <code className="mono text-xs text-[var(--text-primary)] break-all leading-relaxed">{otpauthUri}</code>
          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            SHA-1 · {DIGITS} digits · {PERIOD}s period (RFC 6238). Paste this URI into an authenticator app or QR generator.
          </p>
        </div>
      )}
    </div>
  );
}
