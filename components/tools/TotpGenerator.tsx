"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getToolBySlug } from "@/lib/tools";
import Link from "next/link";

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
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const counter = Math.floor(now / 1000 / PERIOD);
  const secondsElapsed = Math.floor(now / 1000) % PERIOD;
  const secondsLeft = PERIOD - secondsElapsed;

  useEffect(() => {
    if (!secret.trim()) {
      setCode("");
      setError(undefined);
      return;
    }
    let cancelled = false;
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

  const handleCopy = useCallback(async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }, [code]);

  const ringCircumference = useMemo(() => 2 * Math.PI * 28, []);
  const ringOffset = ringCircumference * (1 - secondsLeft / PERIOD);

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
        <button
          onClick={() => setSecret(SAMPLE_SECRET)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
      </div>

      {/* Secret input */}
      <div className="flex flex-col gap-2 max-w-xl">
        <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
          Base32 Secret Key
        </label>
        <input
          type="text"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          spellCheck={false}
          placeholder="JBSWY3DPEHPK3PXP"
          className={`mono w-full px-4 py-3 rounded-lg border ${error ? "border-[#ef4444]" : "border-[var(--border)]"} bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none`}
        />
        {error && <p className="text-xs text-[#ef4444] leading-relaxed">{error}</p>}
      </div>

      {/* Code display */}
      <div className="flex flex-col items-center gap-6 py-10 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
            <circle cx="32" cy="32" r="28" fill="none" stroke="var(--border)" strokeWidth="4" />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="#6366f1"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={ringCircumference}
              strokeDashoffset={ringOffset}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <span className="absolute text-sm font-semibold text-[var(--text-primary)]">{secondsLeft}s</span>
        </div>

        <button
          onClick={handleCopy}
          disabled={!code}
          className="mono text-5xl font-semibold tracking-[0.2em] text-[var(--text-primary)] hover:text-[#6366f1] disabled:hover:text-[var(--text-primary)] transition-colors disabled:cursor-not-allowed"
          title="Click to copy"
        >
          {code || "------"}
        </button>

        <span className={`text-xs font-medium transition-colors ${copied ? "text-[#22c55e]" : "text-[var(--text-muted)]"}`}>
          {copied ? "Copied ✓" : "Click the code to copy"}
        </span>
      </div>
    </div>
  );
}
