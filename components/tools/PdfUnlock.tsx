"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { getToolBySlug } from "@/lib/tools";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FileDropzone } from "@/components/FileDropzone";
import { DownloadButton } from "@/components/DownloadButton";
import { downloadBlob } from "@/lib/download";
import {
  PDF_ACCEPT,
  PDF_MAX_BYTES,
  formatBytes,
  inspectPdf,
  unlockPdf,
  unlockedFileName,
  type PdfLockStatus,
} from "@/lib/pdfUnlock";

const tool = getToolBySlug("pdf-unlock")!;

function safeFileName(name: string | undefined): string {
  if (!name) return "";
  return name
    .replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, "")
    .slice(0, 180);
}

export function PdfUnlock() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<PdfLockStatus | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [inspecting, setInspecting] = useState(false);
  const [unlockedBytes, setUnlockedBytes] = useState<Uint8Array | null>(null);
  const [unlockedPages, setUnlockedPages] = useState<number | null>(null);

  const resetResult = useCallback(() => {
    setUnlockedBytes(null);
    setUnlockedPages(null);
  }, []);

  const processFile = useCallback(
    async (f: File) => {
      setError(null);
      setNote(null);
      setPassword("");
      resetResult();
      setStatus(null);
      setFile(null);
      setInspecting(true);
      try {
        const info = await inspectPdf(f);
        setFile(f);
        setStatus(info);
        if (!info.encrypted) {
          setNote("This PDF is not password-protected — nothing to unlock.");
        } else if (!info.requiresPassword) {
          setNote(
            "This PDF has owner restrictions but opens without a password. Click Unlock to remove them."
          );
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to read PDF.");
      } finally {
        setInspecting(false);
      }
    },
    [resetResult]
  );

  const handleUnlock = useCallback(async () => {
    if (!file || !status?.encrypted) return;
    setBusy(true);
    setError(null);
    resetResult();
    try {
      const { bytes, pageCount } = await unlockPdf(file, password);
      setUnlockedBytes(bytes);
      setUnlockedPages(pageCount);
      setNote("PDF unlocked successfully. Download the unprotected copy below.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unlock failed.";
      const looksWrongPassword =
        /password|authenticate|decrypt|incorrect|invalid/i.test(msg);
      setError(
        looksWrongPassword
          ? "Wrong password — double-check and try again. Passwords are case-sensitive."
          : msg
      );
    } finally {
      setBusy(false);
    }
  }, [file, status, password, resetResult]);

  const handleClear = useCallback(() => {
    setFile(null);
    setStatus(null);
    setPassword("");
    setError(null);
    setNote(null);
    resetResult();
  }, [resetResult]);

  const canUnlock = Boolean(file && status?.encrypted && !busy && !inspecting);
  const unlockNeedsPassword = Boolean(status?.requiresPassword);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6 pb-24">
      <div className="flex flex-col gap-3">
        <Breadcrumb current={tool.name} asHeading={false} />
        <div className="flex flex-col gap-1.5 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
            {tool.name}
          </h1>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-2xl">
            {tool.description}
          </p>
        </div>
      </div>

      <div aria-busy={inspecting || busy}>
        <FileDropzone
          accept={PDF_ACCEPT}
          onFile={(f) => void processFile(f)}
          disabled={busy}
          title={
            file
              ? "Drop another PDF or click to replace"
              : "Drop a password-protected PDF here or click to upload"
          }
          description={`Max ${formatBytes(PDF_MAX_BYTES)} · processed entirely in your browser`}
        >
          {file ? (
            <div className="flex flex-col items-center gap-1">
              <p className="text-sm text-[var(--text-primary)] font-medium truncate max-w-full">
                {safeFileName(file.name)}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {formatBytes(file.size)}
                {status?.pageCount != null
                  ? ` · ${status.pageCount} page${status.pageCount === 1 ? "" : "s"}`
                  : ""}
                {status?.encrypted
                  ? status.requiresPassword
                    ? " · password required"
                    : " · encrypted (no open password)"
                  : status
                    ? " · not encrypted"
                    : ""}
                {inspecting ? " · checking…" : ""}
              </p>
              <span className="mt-2 inline-flex rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)]">
                Replace PDF
              </span>
            </div>
          ) : undefined}
        </FileDropzone>
      </div>

      {error && (
        <p role="alert" className="text-sm text-[#ef4444]">
          {error}
        </p>
      )}
      {note && !error && (
        <p role="status" aria-live="polite" className="text-sm text-[var(--text-muted)] leading-relaxed">
          {note}
        </p>
      )}

      {file && status?.encrypted && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 max-w-md">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
              {unlockNeedsPassword ? "PDF password" : "Password (optional)"}
            </span>
            <div className="flex gap-2">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  resetResult();
                  setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canUnlock) void handleUnlock();
                }}
                placeholder={
                  unlockNeedsPassword ? "Enter the PDF password" : "Leave blank if none"
                }
                autoComplete="off"
                aria-invalid={Boolean(error)}
                className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/40"
              />
              <button
                type="button"
                aria-pressed={showPassword}
                onClick={() => setShowPassword((v) => !v)}
                className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition-colors"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={!canUnlock || (unlockNeedsPassword && !password)}
              aria-busy={busy}
              onClick={() => void handleUnlock()}
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold border border-[#6366f1]/60 bg-[#6366f1] text-white shadow-sm shadow-[#6366f1]/20 hover:bg-[#4f46e5] hover:border-[#4f46e5] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all"
            >
              {busy ? "Unlocking…" : "Unlock PDF"}
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={busy}
              className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-40 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {file && status && !status.encrypted && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            Clear
          </button>
          <Link
            href="/tools/pdf-compare"
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            Compare PDFs instead →
          </Link>
        </div>
      )}

      {unlockedBytes && file && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Unlocked PDF ready
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {formatBytes(unlockedBytes.byteLength)}
              {unlockedPages != null
                ? ` · ${unlockedPages} page${unlockedPages === 1 ? "" : "s"}`
                : ""}
              {" · "}
              {unlockedFileName(file.name)}
            </p>
          </div>
          <DownloadButton
            onClick={() => {
              downloadBlob(
                new Blob([new Uint8Array(unlockedBytes)], { type: "application/pdf" }),
                unlockedFileName(file.name)
              );
            }}
            className="self-end sm:self-auto shrink-0"
          >
            Download unlocked PDF
          </DownloadButton>
        </div>
      )}
    </div>
  );
}
