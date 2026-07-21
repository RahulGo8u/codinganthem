"use client";

import { useState, useCallback, useRef } from "react";
import { getToolBySlug } from "@/lib/tools";
import { Breadcrumb } from "@/components/Breadcrumb";
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

export function ImageResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lock, setLock] = useState(true);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultBlob = useRef<Blob | null>(null);
  const ratioRef = useRef(1);

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
    if (imgEl && file) void resize(imgEl, w, lock ? h : height, file);
  };

  const applyHeight = (h: number) => {
    setHeight(h);
    const w = lock ? Math.max(1, Math.round(h * ratioRef.current)) : width;
    if (lock) setWidth(w);
    if (imgEl && file) void resize(imgEl, lock ? w : width, h, file);
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

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void processFile(f);
        }}
        onClick={() => inputRef.current?.click()}
        className={`rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors ${
          dragging ? "border-[#6366f1] bg-[#6366f1]/10" : "border-[var(--border)] bg-[var(--bg-surface)] hover:border-[#6366f1]/40"
        }`}
      >
        <p className="text-sm font-medium text-[var(--text-primary)]">Drop an image here or click to upload</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">PNG, JPG, WebP, GIF · max 10 MB</p>
        <input ref={inputRef} type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void processFile(f);
        }} />
      </div>

      {error && <p className="text-sm text-[#ef4444]">{error}</p>}

      {file && imgEl && (
        <>
          <div className="flex flex-wrap items-end gap-4 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)]">
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
            <span className="text-xs text-[var(--text-muted)] pb-1.5">
              Original {imgEl.naturalWidth}×{imgEl.naturalHeight} · {formatBytes(file.size)} → {formatBytes(resultSize)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-4">
              <span className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Original</span>
              {preview && <img src={preview} alt="Original" className="max-h-64 object-contain mx-auto mt-2" />}
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-4">
              <span className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Resized · {width}×{height}</span>
              {resultUrl && <img src={resultUrl} alt="Resized" className="max-h-64 object-contain mx-auto mt-2" />}
            </div>
          </div>

          <button
            disabled={!resultBlob.current}
            onClick={() => {
              if (!resultBlob.current || !file) return;
              const ext = file.name.split(".").pop() || "jpg";
              downloadBlob(resultBlob.current, `${file.name.replace(/\.[^.]+$/, "")}-${width}x${height}.${ext}`);
            }}
            className="self-start px-4 py-2 rounded-lg text-sm font-medium border border-[#6366f1]/40 bg-[#6366f1]/10 text-[#6366f1] hover:bg-[#6366f1]/20 disabled:opacity-40"
          >
            Download resized image
          </button>
        </>
      )}
    </div>
  );
}
