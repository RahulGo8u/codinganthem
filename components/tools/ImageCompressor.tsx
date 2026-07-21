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

const tool = getToolBySlug("image-compressor")!;

type OutFormat = "image/jpeg" | "image/webp" | "image/png";

export function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [quality, setQuality] = useState(0.8);
  const [format, setFormat] = useState<OutFormat>("image/jpeg");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultBlob = useRef<Blob | null>(null);

  const compress = useCallback(async (source: File, q: number, fmt: OutFormat) => {
    setBusy(true);
    setError(null);
    try {
      const img = await loadImageFromFile(source);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported.");
      if (fmt === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      const blob = await canvasToBlob(canvas, fmt, fmt === "image/png" ? undefined : q);
      resultBlob.current = blob;
      setResultSize(blob.size);
      setResultUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Compression failed.");
    } finally {
      setBusy(false);
    }
  }, []);

  const processFile = useCallback(
    async (f: File) => {
      if (f.size > IMAGE_MAX_BYTES) {
        setError(`File too large (${formatBytes(f.size)}). Maximum is 10 MB.`);
        return;
      }
      if (!IMAGE_TYPES.has(f.type)) {
        setError("Only PNG, JPG, WebP, and GIF are supported.");
        return;
      }
      setFile(f);
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(f);
      });
      const defaultFmt: OutFormat =
        f.type === "image/png" ? "image/png" : f.type === "image/webp" ? "image/webp" : "image/jpeg";
      setFormat(defaultFmt);
      await compress(f, quality, defaultFmt);
    },
    [compress, quality]
  );

  const savings =
    file && resultSize > 0 ? Math.max(0, Math.round((1 - resultSize / file.size) * 100)) : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6 pb-24">
      <div className="flex flex-col gap-3">
        <Breadcrumb current={tool.name} asHeading={false} />
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1.5 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              {tool.name}
            </h1>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-2xl">{tool.description}</p>
          </div>
          <span className="badge badge-neutral">Client-side</span>
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void processFile(f);
        }}
        onClick={() => inputRef.current?.click()}
        className={`rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors ${
          dragging
            ? "border-[#6366f1] bg-[#6366f1]/10"
            : "border-[var(--border)] bg-[var(--bg-surface)] hover:border-[#6366f1]/40"
        }`}
      >
        <p className="text-sm text-[var(--text-primary)] font-medium">Drop an image here or click to upload</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">PNG, JPG, WebP, GIF · max 10 MB</p>
        <input ref={inputRef} type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void processFile(f);
        }} />
      </div>

      {error && <p className="text-sm text-[#ef4444]">{error}</p>}

      {file && (
        <>
          <div className="flex flex-wrap items-center gap-4 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)]">
            <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              Quality
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={quality}
                disabled={format === "image/png"}
                onChange={(e) => {
                  const q = Number(e.target.value);
                  setQuality(q);
                  if (file) void compress(file, q, format);
                }}
                className="w-32"
              />
              <span className="mono text-[var(--text-primary)] w-8">{Math.round(quality * 100)}</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              Format
              <select
                value={format}
                onChange={(e) => {
                  const fmt = e.target.value as OutFormat;
                  setFormat(fmt);
                  if (file) void compress(file, quality, fmt);
                }}
                className="rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-1 text-[var(--text-primary)]"
              >
                <option value="image/jpeg">JPEG</option>
                <option value="image/webp">WebP</option>
                <option value="image/png">PNG</option>
              </select>
            </label>
            {busy && <span className="text-xs text-[var(--text-muted)]">Compressing…</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-4 flex flex-col gap-2">
              <span className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Original · {formatBytes(file.size)}</span>
              {preview && <img src={preview} alt="Original" className="max-h-64 object-contain mx-auto" />}
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-4 flex flex-col gap-2">
              <span className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                Compressed · {formatBytes(resultSize)}{savings > 0 ? ` · −${savings}%` : ""}
              </span>
              {resultUrl && <img src={resultUrl} alt="Compressed" className="max-h-64 object-contain mx-auto" />}
            </div>
          </div>

          <button
            disabled={!resultBlob.current}
            onClick={() => {
              if (!resultBlob.current || !file) return;
              const ext = format === "image/png" ? "png" : format === "image/webp" ? "webp" : "jpg";
              const base = file.name.replace(/\.[^.]+$/, "");
              downloadBlob(resultBlob.current, `${base}-compressed.${ext}`);
            }}
            className="self-start px-4 py-2 rounded-lg text-sm font-medium border border-[#6366f1]/40 bg-[#6366f1]/10 text-[#6366f1] hover:bg-[#6366f1]/20 disabled:opacity-40"
          >
            Download compressed image
          </button>
        </>
      )}
    </div>
  );
}
