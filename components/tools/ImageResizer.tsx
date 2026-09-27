"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { getToolBySlug } from "@/lib/tools";
import { Breadcrumb } from "@/components/Breadcrumb";
import { DownloadButton } from "@/components/DownloadButton";
import { FileDropzone } from "@/components/FileDropzone";
import { SegmentedControl } from "@/components/SegmentedControl";
import {
  IMAGE_ACCEPT,
  IMAGE_MAX_BYTES,
  IMAGE_TYPES,
  canvasToBlob,
  downloadBlob,
  formatBytes,
  loadImageFromFile,
} from "@/lib/imageCanvas";

const tool = getToolBySlug("image-resizer")!;

const SIZE_PRESETS = [
  { label: "1920×1080", w: 1920, h: 1080 },
  { label: "1200×630", w: 1200, h: 630 },
  { label: "512×512", w: 512, h: 512 },
] as const;

type FitMode = "exact" | "fit";

function fitWithin(srcW: number, srcH: number, boxW: number, boxH: number) {
  const scale = Math.min(boxW / srcW, boxH / srcH);
  return {
    w: Math.max(1, Math.round(srcW * scale)),
    h: Math.max(1, Math.round(srcH * scale)),
  };
}

export function ImageResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lock, setLock] = useState(true);
  const [fitMode, setFitMode] = useState<FitMode>("exact");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const resultBlob = useRef<Blob | null>(null);
  const ratioRef = useRef(1);
  const debounceRef = useRef<number | null>(null);

  const resize = useCallback(async (img: HTMLImageElement, w: number, h: number, source: File) => {
    if (w < 1 || h < 1) return;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(w);
    canvas.height = Math.round(h);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const type = source.type === "image/png" || source.type === "image/webp" ? source.type : "image/jpeg";
    const blob = await canvasToBlob(canvas, type, type === "image/png" ? undefined : 0.92);
    resultBlob.current = blob;
    setResultSize(blob.size);
    setResultUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(blob);
    });
  }, []);

  const scheduleResize = useCallback(
    (img: HTMLImageElement, w: number, h: number, source: File) => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => {
        void resize(img, w, h, source);
      }, 200);
    },
    [resize]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  const processFile = useCallback(
    async (f: File) => {
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
        setFile(f);
        setImgEl(img);
        ratioRef.current = img.naturalWidth / img.naturalHeight;
        setWidth(img.naturalWidth);
        setHeight(img.naturalHeight);
        setPreview((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(f);
        });
        await resize(img, img.naturalWidth, img.naturalHeight, f);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load image.");
      }
    },
    [resize]
  );

  const applyWidth = (w: number) => {
    setWidth(w);
    const h = lock ? Math.max(1, Math.round(w / ratioRef.current)) : height;
    if (lock) setHeight(h);
    if (imgEl && file) scheduleResize(imgEl, w, lock ? h : height, file);
  };

  const applyHeight = (h: number) => {
    setHeight(h);
    const w = lock ? Math.max(1, Math.round(h * ratioRef.current)) : width;
    if (lock) setWidth(w);
    if (imgEl && file) scheduleResize(imgEl, lock ? w : width, h, file);
  };

  const applyPreset = (w: number, h: number) => {
    if (!imgEl || !file) {
      setWidth(w);
      setHeight(h);
      return;
    }
    if (fitMode === "fit") {
      const fitted = fitWithin(imgEl.naturalWidth, imgEl.naturalHeight, w, h);
      setLock(true);
      setWidth(fitted.w);
      setHeight(fitted.h);
      scheduleResize(imgEl, fitted.w, fitted.h, file);
    } else {
      setLock(false);
      setWidth(w);
      setHeight(h);
      scheduleResize(imgEl, w, h, file);
    }
  };

  const isUpscaling =
    !!imgEl && (width > imgEl.naturalWidth || height > imgEl.naturalHeight);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6 pb-24">
      <div className="flex flex-col gap-3">
        <Breadcrumb current={tool.name} asHeading={false} />
        <div className="flex flex-col gap-1.5 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{tool.name}</h1>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-2xl">{tool.description}</p>
        </div>
      </div>

      <FileDropzone
        accept={IMAGE_ACCEPT}
        onFile={(f) => void processFile(f)}
        title="Drop an image here or click to upload"
        description="PNG, JPG, WebP, GIF · max 10 MB"
      />

      {error && <p role="alert" className="text-sm text-[#ef4444]">{error}</p>}

      {file && imgEl && (
        <>
          <div className="flex flex-col gap-3 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)]">
            <div className="flex flex-wrap items-end gap-4">
              <label className="flex flex-col gap-1 text-xs text-[var(--text-muted)]">
                Width (px)
                <input
                  type="number"
                  min={1}
                  max={8000}
                  value={width}
                  onChange={(e) => applyWidth(Number(e.target.value) || 1)}
                  className="mono w-28 rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-1.5 text-sm text-[var(--text-primary)]"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-[var(--text-muted)]">
                Height (px)
                <input
                  type="number"
                  min={1}
                  max={8000}
                  value={height}
                  onChange={(e) => applyHeight(Number(e.target.value) || 1)}
                  className="mono w-28 rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-1.5 text-sm text-[var(--text-primary)]"
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-[var(--text-muted)] pb-1.5">
                <input type="checkbox" checked={lock} onChange={(e) => setLock(e.target.checked)} />
                Lock aspect ratio
              </label>
              <div className="flex flex-col gap-1 pb-1">
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Preset mode</span>
                <SegmentedControl
                  label="Fit mode"
                  compact
                  value={fitMode}
                  onChange={setFitMode}
                  segments={[
                    { value: "exact", label: "Exact" },
                    { value: "fit", label: "Fit within" },
                  ]}
                />
              </div>
              <span className="text-xs text-[var(--text-muted)] pb-1.5">
                Original {imgEl.naturalWidth}×{imgEl.naturalHeight} · {formatBytes(file.size)}
                {file.type ? ` · ${file.type.replace("image/", "").toUpperCase()}` : ""} → {formatBytes(resultSize)}
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              {fitMode === "exact"
                ? "Exact presets stretch to the target size and unlock aspect ratio (may distort)."
                : "Fit within scales down (or up) to fit inside the box while keeping aspect ratio."}
            </p>
            {isUpscaling && (
              <p role="status" className="text-xs text-[#f59e0b] leading-relaxed">
                Upscaling beyond the original {imgEl.naturalWidth}×{imgEl.naturalHeight} — output may look soft or blurry.
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Presets</span>
              {SIZE_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p.w, p.h)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                    width === p.w && height === p.h
                      ? "border-[#6366f1]/50 bg-[#6366f1]/15 text-[#6366f1]"
                      : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-4 flex flex-col gap-2">
              <span className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Original</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {preview && <img src={preview} alt="Original" className="max-h-64 object-contain mx-auto" />}
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-4 flex flex-col gap-2">
              <span className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Resized · {width}×{height}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {resultUrl && <img src={resultUrl} alt="Resized" className="max-h-64 object-contain mx-auto" />}
              <DownloadButton
                disabled={!resultUrl}
                onClick={() => {
                  if (!resultBlob.current || !file) return;
                  const ext = file.name.split(".").pop() || "jpg";
                  downloadBlob(resultBlob.current, `${file.name.replace(/\.[^.]+$/, "")}-${width}x${height}.${ext}`);
                }}
                className="self-end mt-1"
              >
                Download resized image
              </DownloadButton>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
