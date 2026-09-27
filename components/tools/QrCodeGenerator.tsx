"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import QRCode from "qrcode";
import { ToolShell } from "@/components/ToolShell";
import { DownloadButton } from "@/components/DownloadButton";
import { SegmentedControl } from "@/components/SegmentedControl";
import { getToolBySlug } from "@/lib/tools";
import { downloadUrl } from "@/lib/download";

const tool = getToolBySlug("qr-code-generator")!;

const SIZES = [128, 256, 512] as const;
type Size = (typeof SIZES)[number];
type Correction = "L" | "M" | "Q" | "H";

const SAMPLE = "https://www.codinganthem.com";

const CORRECTION_HINT: Record<Correction, string> = {
  L: "~7% recovery — denser code, fine for clean prints",
  M: "~15% recovery — good default for most URLs",
  Q: "~25% recovery — better if the code may be scuffed",
  H: "~30% recovery — best for logos/damage; larger modules",
};

export function QrCodeGenerator() {
  const [input, setInput] = useState("");
  const [size, setSize] = useState<Size>(256);
  const [correction, setCorrection] = useState<Correction>("M");
  const [dark, setDark] = useState("#000000");
  const [light, setLight] = useState("#ffffff");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();
  const reqRef = useRef(0);

  const lowContrast = dark.toLowerCase() === light.toLowerCase();

  useEffect(() => {
    const id = ++reqRef.current;
    if (!input.trim()) {
      void Promise.resolve().then(() => {
        if (id !== reqRef.current) return;
        setDataUrl(null);
        setError(undefined);
      });
      return;
    }
    QRCode.toDataURL(input, {
      width: size,
      margin: 2,
      errorCorrectionLevel: correction,
      color: { dark, light },
    })
      .then((url) => {
        if (id === reqRef.current) {
          setDataUrl(url);
          setError(undefined);
        }
      })
      .catch(() => {
        if (id === reqRef.current) {
          setDataUrl(null);
          setError("Failed to generate QR code.");
        }
      });
  }, [input, size, correction, dark, light]);

  const handleDownload = useCallback(() => {
    if (!dataUrl) return;
    downloadUrl(dataUrl, "qrcode.png");
  }, [dataUrl]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output=""
      onInputChange={setInput}
      error={error}
      hideFileActions
      showClear
      inputLabel="Text or URL"
      outputLabel="QR Code"
      inputPlaceholder={"Enter any text or URL...\n\nhttps://www.codinganthem.com"}
      extraActions={
        <button
          type="button"
          onClick={() => setInput(SAMPLE)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
      }
      extraRightActions={
        <DownloadButton onClick={handleDownload} disabled={!dataUrl} compact>
          Download PNG
        </DownloadButton>
      }
      options={
        <div className="flex flex-col gap-3 w-full">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
              <span>Size</span>
              <SegmentedControl
                label="QR size"
                compact
                value={String(size)}
                onChange={(v) => setSize(Number(v) as Size)}
                segments={SIZES.map((s) => ({ value: String(s), label: `${s}px` }))}
              />
            </div>
            <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
              <span>Correction</span>
              <SegmentedControl
                label="Error correction"
                compact
                value={correction}
                onChange={setCorrection}
                segments={(["L", "M", "Q", "H"] as Correction[]).map((c) => ({
                  value: c,
                  label: c,
                }))}
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              Dark
              <input
                type="color"
                value={dark}
                onChange={(e) => setDark(e.target.value)}
                className="h-8 w-10 cursor-pointer"
                aria-label="QR dark modules color"
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              Light
              <input
                type="color"
                value={light}
                onChange={(e) => setLight(e.target.value)}
                className="h-8 w-10 cursor-pointer"
                aria-label="QR light background color"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                setDark("#000000");
                setLight("#ffffff");
              }}
              className="text-xs text-[#6366f1] hover:underline"
            >
              Reset colors
            </button>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            {CORRECTION_HINT[correction]}. Keep high contrast (dark on light) and a quiet zone — scanners need margin around the code.
            {lowContrast && (
              <span className="text-[#f59e0b]"> Low contrast may fail to scan.</span>
            )}
          </p>
        </div>
      }
      outputContent={
        dataUrl ? (
          <div className="w-full min-h-[320px] flex flex-col items-center justify-center gap-3 p-4 overflow-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={dataUrl}
              alt="Generated QR code"
              width={size}
              height={size}
              className="rounded-lg max-w-full h-auto"
              style={{ imageRendering: "pixelated", background: light }}
            />
            <p className="text-[11px] text-[var(--text-muted)] text-center max-w-sm">
              Tip: scan with your phone camera to verify before printing. Prefer black modules on a white background for reliability.
            </p>
          </div>
        ) : (
          <div className="w-full min-h-[320px] flex items-center justify-center p-4">
            <p className="text-[var(--text-muted)] text-sm">QR code will appear here...</p>
          </div>
        )
      }
    />
  );
}
