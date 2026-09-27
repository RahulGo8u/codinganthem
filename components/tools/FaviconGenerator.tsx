"use client";

import { useState, useCallback, useEffect } from "react";
import { getToolBySlug } from "@/lib/tools";
import { Breadcrumb } from "@/components/Breadcrumb";
import { DownloadButton } from "@/components/DownloadButton";
import { CopyButton } from "@/components/CopyButton";
import { FileDropzone } from "@/components/FileDropzone";
import { SegmentedControl } from "@/components/SegmentedControl";
import { downloadUrl } from "@/lib/download";
import {
  IMAGE_ACCEPT,
  IMAGE_MAX_BYTES,
  IMAGE_TYPES,
  drawCover,
  formatBytes,
  loadImageFromFile,
} from "@/lib/imageCanvas";

const tool = getToolBySlug("favicon-generator")!;
const SIZES = [16, 32, 48, 180] as const;

function relativeLuminance(hex: string): number {
  const raw = hex.replace("#", "");
  if (raw.length !== 6) return 0;
  const rgb = [0, 2, 4].map((i) => {
    const c = parseInt(raw.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contrastRatio(a: string, b: string): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const LINK_SNIPPET = `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">`;

export function FaviconGenerator() {
  const [mode, setMode] = useState<"image" | "text">("text");
  const [text, setText] = useState("CA");
  const [bg, setBg] = useState("#6366f1");
  const [fg, setFg] = useState("#ffffff");
  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null);
  const [previews, setPreviews] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [downloadNote, setDownloadNote] = useState<string | null>(null);

  const contrast = contrastRatio(fg, bg);

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
    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      if (mode === "text") {
        await renderSizes((ctx, size) => {
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, size, size);
          ctx.fillStyle = fg;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = `bold ${Math.round(size * 0.45)}px system-ui, sans-serif`;
          ctx.fillText(text.slice(0, 3) || "?", size / 2, size / 2 + size * 0.02);
        });
      } else if (sourceImg) {
        await renderSizes((ctx, size) => drawCover(ctx, sourceImg, size));
      }
    })();
    return () => {
      cancelled = true;
    };
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

  const downloadSize = (size: number) => {
    const dataUrl = previews[size];
    if (!dataUrl) return;
    downloadUrl(dataUrl, size === 180 ? "apple-touch-icon.png" : `favicon-${size}x${size}.png`);
  };

  const downloadAll = async () => {
    setDownloadNote("Downloading sizes one at a time — allow multiple downloads if your browser asks.");
    for (let i = 0; i < SIZES.length; i++) {
      downloadSize(SIZES[i]);
      // Stagger so browsers don't coalesce / block rapid downloads.
      await new Promise((r) => setTimeout(r, 350));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6 pb-24">
      <div className="flex flex-col gap-3">
        <Breadcrumb current={tool.name} asHeading={false} />
        <div className="flex flex-col gap-1.5 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{tool.name}</h1>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-2xl">{tool.description}</p>
        </div>
      </div>

      <SegmentedControl
        label="Favicon source"
        value={mode}
        onChange={setMode}
        segments={[
          { value: "text", label: "From text" },
          { value: "image", label: "From image" },
        ]}
      />

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
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-9 w-14 cursor-pointer" aria-label="Background color" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[var(--text-muted)]">
            Text color
            <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-9 w-14 cursor-pointer" aria-label="Text color" />
          </label>
          <p
            className={`self-end text-xs ${contrast < 3 ? "text-[#f59e0b]" : "text-[var(--text-muted)]"}`}
            role="status"
          >
            Contrast {contrast.toFixed(1)}:1
            {contrast < 3 ? " — low for small icons" : contrast >= 4.5 ? " — good" : " — fair"}
          </p>
        </div>
      ) : (
        <FileDropzone
          accept={IMAGE_ACCEPT}
          onFile={(f) => void processFile(f)}
          title={sourceImg ? "Replace image" : "Upload square image"}
          description="PNG, JPG, WebP, GIF · max 10 MB · cropped to cover"
        />
      )}

      {error && <p role="alert" className="text-sm text-[#ef4444]">{error}</p>}
      {downloadNote && <p className="text-xs text-[var(--text-muted)]" role="status">{downloadNote}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {SIZES.map((size) => (
          <div key={size} className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-4 flex flex-col items-center gap-3">
            {previews[size] ? (
              // eslint-disable-next-line @next/next/no-img-element -- pixel-perfect favicon preview
              <img src={previews[size]} alt={`${size}x${size}`} width={size} height={size} className="border border-[var(--border)]" style={{ imageRendering: size <= 32 ? "pixelated" : "auto" }} />
            ) : (
              <div className="w-12 h-12 bg-[var(--bg-elevated)]" />
            )}
            <span className="text-xs text-[var(--text-muted)]">{size === 180 ? "Apple Touch 180" : `${size}×${size}`}</span>
            <DownloadButton
              onClick={() => downloadSize(size)}
              compact
            >
              Download
            </DownloadButton>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs uppercase tracking-wider text-[var(--text-muted)]">HTML link tags</span>
          <CopyButton value={LINK_SNIPPET} label="Copy snippet" compact />
        </div>
        <pre className="mono text-xs text-[var(--text-primary)] whitespace-pre-wrap break-all leading-relaxed">
          {LINK_SNIPPET}
        </pre>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs text-[var(--text-muted)]">
          Tip: use <code className="mono">favicon-32x32.png</code> as a modern favicon, and{" "}
          <code className="mono">apple-touch-icon.png</code> for iOS home screens. ZIP packaging deferred — download sizes individually if “Download all” is blocked.
        </p>
        <DownloadButton
          onClick={() => void downloadAll()}
          disabled={Object.keys(previews).length === 0}
          className="self-end shrink-0"
        >
          Download all sizes
        </DownloadButton>
      </div>
    </div>
  );
}
