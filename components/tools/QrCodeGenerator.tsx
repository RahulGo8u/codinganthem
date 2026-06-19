"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import QRCode from "qrcode";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("qr-code-generator")!;

const SIZES = [128, 256, 512] as const;
type Size = typeof SIZES[number];

export function QrCodeGenerator() {
  const [input, setInput] = useState("");
  const [size, setSize] = useState<Size>(256);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();
  const reqRef = useRef(0);

  useEffect(() => {
    if (!input.trim()) { setDataUrl(null); setError(undefined); return; }
    const id = ++reqRef.current;
    QRCode.toDataURL(input, { width: size, margin: 2, color: { dark: "#000000", light: "#ffffff" } })
      .then((url) => { if (id === reqRef.current) { setDataUrl(url); setError(undefined); } })
      .catch(() => { if (id === reqRef.current) { setDataUrl(null); setError("Failed to generate QR code."); } });
  }, [input, size]);

  const handleDownload = useCallback(() => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "qrcode.png";
    a.click();
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
          onClick={handleDownload}
          disabled={!dataUrl}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Download PNG
        </button>
      }
      options={
        <label className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
          Size
          <div className="flex rounded-lg border border-[var(--border)] overflow-hidden text-xs">
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`px-3 py-1.5 transition-colors ${
                  size === s
                    ? "bg-[#6366f1]/15 text-[#6366f1]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                }`}
              >
                {s}px
              </button>
            ))}
          </div>
        </label>
      }
      outputContent={
        dataUrl ? (
          <div className="w-full min-h-[320px] flex items-center justify-center p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={dataUrl}
              alt="Generated QR code"
              width={size}
              height={size}
              className="rounded-lg"
              style={{ imageRendering: "pixelated" }}
            />
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
