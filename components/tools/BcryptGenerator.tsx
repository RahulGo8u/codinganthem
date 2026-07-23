"use client";

import { useState, useCallback } from "react";
import bcrypt from "bcryptjs";
import { getToolBySlug } from "@/lib/tools";
import { ToolShell } from "@/components/ToolShell";
import { CopyChip } from "@/components/CopyChip";

const tool = getToolBySlug("bcrypt-generator")!;

export function BcryptGenerator() {
  const [plain, setPlain] = useState("");
  const [rounds, setRounds] = useState(10);
  const [hash, setHash] = useState("");
  const [hashBusy, setHashBusy] = useState(false);
  const [hashError, setHashError] = useState<string | null>(null);

  const [verifyPlain, setVerifyPlain] = useState("");
  const [verifyHash, setVerifyHash] = useState("");
  const [verifyResult, setVerifyResult] = useState<"match" | "mismatch" | null>(null);
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    if (!plain) {
      setHashError("Enter text to hash.");
      return;
    }
    setHashBusy(true);
    setHashError(null);
    try {
      // Yield so the UI can show "Hashing…" before the sync-ish work blocks.
      await new Promise((r) => setTimeout(r, 10));
      const salt = await bcrypt.genSalt(rounds);
      const result = await bcrypt.hash(plain, salt);
      setHash(result);
    } catch {
      setHashError("Failed to generate hash.");
    } finally {
      setHashBusy(false);
    }
  }, [plain, rounds]);

  const verify = useCallback(async () => {
    if (!verifyPlain || !verifyHash) {
      setVerifyError("Enter both the plain text and a bcrypt hash.");
      setVerifyResult(null);
      return;
    }
    setVerifyBusy(true);
    setVerifyError(null);
    setVerifyResult(null);
    try {
      await new Promise((r) => setTimeout(r, 10));
      const ok = await bcrypt.compare(verifyPlain, verifyHash.trim());
      setVerifyResult(ok ? "match" : "mismatch");
    } catch {
      setVerifyError("Invalid bcrypt hash or verification failed.");
    } finally {
      setVerifyBusy(false);
    }
  }, [verifyPlain, verifyHash]);

  const clearAll = useCallback(() => {
    setPlain("");
    setHash("");
    setHashError(null);
    setVerifyPlain("");
    setVerifyHash("");
    setVerifyResult(null);
    setVerifyError(null);
  }, []);

  const loadSample = useCallback(async () => {
    const sample = "password";
    setPlain(sample);
    setRounds(10);
    setHashBusy(true);
    setHashError(null);
    setVerifyResult(null);
    setVerifyError(null);
    try {
      await new Promise((r) => setTimeout(r, 10));
      const salt = await bcrypt.genSalt(10);
      const result = await bcrypt.hash(sample, salt);
      setHash(result);
      setVerifyPlain(sample);
      setVerifyHash(result);
    } catch {
      setHashError("Failed to generate sample hash.");
    } finally {
      setHashBusy(false);
    }
  }, []);

  return (
    <ToolShell
      tool={tool}
      input={plain || verifyPlain || hash || verifyHash}
      output={hash}
      onInputChange={(v) => {
        if (v === "") clearAll();
      }}
      hideInputPane
      hideFileActions
      showClear
      outputLabel="Bcrypt hash & verify"
      extraActions={
        <button
          type="button"
          onClick={() => void loadSample()}
          disabled={hashBusy}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] disabled:opacity-40 transition-colors"
        >
          Load sample
        </button>
      }
      outputContent={
        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Generate hash</h2>
            <label className="flex flex-col gap-1.5 text-xs text-[var(--text-muted)]">
              Plain text / password
              <input
                type="text"
                value={plain}
                onChange={(e) => setPlain(e.target.value)}
                placeholder="Enter text to hash"
                className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]"
              />
            </label>
            <label className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
              Cost factor (rounds)
              <input
                type="range"
                min={4}
                max={14}
                value={rounds}
                onChange={(e) => setRounds(Number(e.target.value))}
                className="flex-1 max-w-xs"
              />
              <span className="mono text-[var(--text-primary)] w-6">{rounds}</span>
            </label>
            <p className="text-[11px] text-[var(--text-muted)]">
              10–12 is typical for production. Higher rounds are slower but harder to brute-force.
            </p>
            <button
              onClick={() => void generate()}
              disabled={hashBusy || !plain}
              className="self-start px-4 py-2 rounded-lg text-sm font-medium border border-[#6366f1]/40 bg-[#6366f1]/10 text-[#6366f1] hover:bg-[#6366f1]/20 disabled:opacity-40"
            >
              {hashBusy ? "Hashing…" : "Generate bcrypt hash"}
            </button>
            {hashError && <p className="text-xs text-[#ef4444]">{hashError}</p>}
            {hash && (
              <div className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                <code className="mono text-xs text-[var(--text-primary)] break-all flex-1">{hash}</code>
                <CopyChip value={hash} label="hash" />
              </div>
            )}
          </section>

          <section className="flex flex-col gap-3 border-t border-[var(--border)] pt-6">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Verify hash</h2>
            <label className="flex flex-col gap-1.5 text-xs text-[var(--text-muted)]">
              Plain text
              <input
                type="text"
                value={verifyPlain}
                onChange={(e) => {
                  setVerifyPlain(e.target.value);
                  setVerifyResult(null);
                }}
                placeholder="Original text"
                className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs text-[var(--text-muted)]">
              Bcrypt hash
              <input
                type="text"
                value={verifyHash}
                onChange={(e) => {
                  setVerifyHash(e.target.value);
                  setVerifyResult(null);
                }}
                placeholder="$2a$10$..."
                className="mono rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]"
              />
            </label>
            <button
              onClick={() => void verify()}
              disabled={verifyBusy || !verifyPlain || !verifyHash}
              className="self-start px-4 py-2 rounded-lg text-sm font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] disabled:opacity-40"
            >
              {verifyBusy ? "Checking…" : "Verify"}
            </button>
            {verifyError && <p className="text-xs text-[#ef4444]">{verifyError}</p>}
            {verifyResult === "match" && (
              <p className="text-sm text-[#22c55e] font-medium">Match — the hash corresponds to this text.</p>
            )}
            {verifyResult === "mismatch" && (
              <p className="text-sm text-[#ef4444] font-medium">No match — text does not match this hash.</p>
            )}
          </section>
        </div>
      }
    />
  );
}
