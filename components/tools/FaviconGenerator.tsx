"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { getToolBySlug } from "@/lib/tools";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  IMAGE_ACCEPT,
  IMAGE_MAX_BYTES,
  IMAGE_TYPES,
  downloadBlob,
  drawCover,
  formatBytes,
  loadImageFromFile,
} from "@/lib/imageCanvas";

const tool = getToolBySlug("favicon-generator")!;
const SIZES = [16, 32, 48, 180] as const;

export function FaviconGenerator() {
  const [mode, setMode] = useState<"image" | "text">("text");
  const [text, setText] = useState("CA");
  const [bg, setBg] = useState("#6366f1");
  const [fg, setFg] = useState("#ffffff");
  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null);
  const [previews, setPreviews] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const renderSizes = useCallback(async (draw: (ctx: CanvasRenderingContext2D, size: number) => void) => {
    const next: Record<number, string> = {};
    for (const size of SIZES) {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      draw(ctx, size);
      next[size] = canvas.toDataURL("image/png");
    }
    setPreviews((prev) => {
      Object.values(prev).forEach((u) => {
        if (u.startsWith("blob:")) URL.revokeObjectURL(u);
      });
      return next;
    });
  }, []);

  useEffect(() => {
    if (mode === "text") {
      void renderSizes((ctx, size) => {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = fg;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `bold ${Math.round(size * 0.45)}px system-ui, sans-serif`;
        ctx.fillText(text.slice(0, 3) || "?", size / 2, size / 2 + size * 0.02);
      });
    } else if (sourceImg) {
      void renderSizes((ctx, size) => drawCover(ctx, sourceImg, size));
    }
  }, [mode, text, bg, fg, sourceImg, renderSizes]);

  const processFile = async (f: File) => {
    setError(null);
    if (f.size > IMAGE_MAX_BYTES) {
      setError(`File too large (${formatBytes(f.size)}). Maximum is 10 MB.`);
      return;
    }
    if (!IMAGE_TYPES.has(f.type)) {
      setError("Only PNG, JPG, WebP, and GIF are supported.");
      return;
    }
    try {
      const img = await loadImageFromFile(f);
      setSourceImg(img);
      setMode("image");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load image.");
    }
  };

  const downloadSize = async (size: number) => {
    const dataUrl = previews[size];
    if (!dataUrl) return;
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    downloadBlob(blob, size === 180 ? "apple-touch-icon.png" : `favicon-${size}x${size}.png`);
  };

  const downloadAll = async () => {
    for (const size of SIZES) {
      await downloadSize(size);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6 pb-24">
      <div className="flex flex-col gap-3">
        <Breadcrumb current={tool.name} asHeading={false} />
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1.5 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{tool.name}</h1>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-2xl">{tool.description}</p>
          </div>
          <span className="badge badge-neutral">Client-side</span>
        </div>
      </div>

      <div className="flex gap-2">
        {(["text", "image"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              mode === m
                ? "border-[#6366f1]/40 bg-[#6366f1]/15 text-[#6366f1]"
                : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {m === "text" ? "From text" : "From image"}
          </button>
        ))}
      </div>

      {mode === "text" ? (
        <div className="flex flex-wrap gap-4 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)]">
          <label className="flex flex-col gap-1 text-xs text-[var(--text-muted)]">
            Text (1–3 chars)
            <input
              value={text}
              maxLength={3}
              onChange={(e) => setText(e.target.value)}
              className="w-24 rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-1.5 text-sm text-[var(--text-primary)]"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[var(--text-muted)]">
            Background
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-9 w-14 cursor-pointer" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[var(--text-muted)]">
            Text color
            <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-9 w-14 cursor-pointer" />
          </label>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => inputRef.current?.click()}
            className="px-4 py-3 rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-surface)] text-sm text-[var(--text-muted)] hover:border-[#6366f1]/40"
          >
            {sourceImg ? "Replace image" : "Upload square image (PNG/JPG/WebP)"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void processFile(f);
            }}
          />
        </div>
      )}

      {error && <p className="text-sm text-[#ef4444]">{error}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {SIZES.map((size) => (
          <div key={size} className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-4 flex flex-col items-center gap-3">
            {previews[size] ? (
              <img src={previews[size]} alt={`${size}x${size}`} width={size} height={size} className="border border-[var(--border)]" style={{ imageRendering: size <= 32 ? "pixelated" : "auto" }} />
            ) : (
              <div className="w-12 h-12 bg-[var(--bg-elevated)]" />
            )}
            <span className="text-xs text-[var(--text-muted)]">{size === 180 ? "Apple Touch 180" : `${size}×${size}`}</span>
            <button
              onClick={() => void downloadSize(size)}
              className="text-xs text-[#6366f1] hover:underline"
            >
              Download
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs text-[var(--text-muted)]">
          Tip: use <code className="mono">favicon-32x32.png</code> as <code className="mono">favicon.ico</code> replacement, and{" "}
          <code className="mono">apple-touch-icon.png</code> for iOS home screens.
        </p>
        <button
          onClick={() => void downloadAll()}
          disabled={Object.keys(previews).length === 0}
          className="self-end shrink-0 px-4 py-2 rounded-lg text-sm font-medium border border-[#6366f1]/40 bg-[#6366f1]/10 text-[#6366f1] hover:bg-[#6366f1]/20 disabled:opacity-40"
        >
          Download all sizes
        </button>
      </div>
    </div>
  );
}
