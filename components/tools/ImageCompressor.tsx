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

const tool = getToolBySlug("image-compressor")!;

type OutFormat = "image/jpeg" | "image/webp";

async function encodeImage(
  img: HTMLImageElement,
  fmt: OutFormat,
  quality: number
): Promise<Blob> {
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
  return canvasToBlob(canvas, fmt, quality);
}

/**
 * Encode at the requested quality; if the result is still larger than the
 * source, step quality down until it shrinks (or we hit a floor). Canvas
 * re-encoding of already-optimized JPEGs often grows the file at high quality.
 */
async function compressToSmaller(
  img: HTMLImageElement,
  sourceSize: number,
  fmt: OutFormat,
  startQuality: number
): Promise<{ blob: Blob; quality: number; usedOriginal: boolean }> {
  let q = startQuality;
  let blob = await encodeImage(img, fmt, q);

  while (blob.size >= sourceSize && q > 0.35) {
    q = Math.max(0.35, Math.round((q - 0.1) * 100) / 100);
    blob = await encodeImage(img, fmt, q);
  }

  if (blob.size >= sourceSize) {
    return { blob, quality: q, usedOriginal: true };
  }

  return { blob, quality: q, usedOriginal: false };
}

export function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [quality, setQuality] = useState(0.75);
  const [appliedQuality, setAppliedQuality] = useState<number | null>(null);
  const [format, setFormat] = useState<OutFormat>("image/webp");
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [keptOriginal, setKeptOriginal] = useState(false);
  const resultBlob = useRef<Blob | null>(null);
  const debounceRef = useRef<number | null>(null);

  const compress = useCallback(async (source: File, q: number, fmt: OutFormat) => {
    setBusy(true);
    setError(null);
    setNote(null);
    setKeptOriginal(false);
    try {
      const img = await loadImageFromFile(source);
      setDims({ w: img.naturalWidth, h: img.naturalHeight });
      const { blob, quality: usedQ, usedOriginal } = await compressToSmaller(
        img,
        source.size,
        fmt,
        q
      );

      if (usedOriginal) {
        resultBlob.current = source;
        setResultSize(source.size);
        setAppliedQuality(null);
        setKeptOriginal(true);
        setNote(
          "This image is already well optimized — re-encoding made it larger, so the original is kept. Try a lower quality or a different format."
        );
        setResultUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(source);
        });
      } else {
        resultBlob.current = blob;
        setResultSize(blob.size);
        setAppliedQuality(usedQ);
        if (usedQ < q - 0.01) {
          setNote(
            `Quality was lowered from ${Math.round(q * 100)} to ${Math.round(usedQ * 100)} so the file actually got smaller.`
          );
        }
        setResultUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(blob);
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Compression failed.");
    } finally {
      setBusy(false);
    }
  }, []);

  const scheduleCompress = useCallback(
    (source: File, q: number, fmt: OutFormat) => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => {
        void compress(source, q, fmt);
      }, 280);
    },
    [compress]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
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
      const defaultFmt: OutFormat = "image/webp";
      setFormat(defaultFmt);
      await compress(f, quality, defaultFmt);
    },
    [compress, quality]
  );

  const deltaPct =
    file && resultSize > 0 ? Math.round((1 - resultSize / file.size) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6 pb-24">
      <div className="flex flex-col gap-3">
        <Breadcrumb current={tool.name} asHeading={false} />
        <div className="flex flex-col gap-1.5 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
            {tool.name}
          </h1>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-2xl">{tool.description}</p>
        </div>
      </div>

      <FileDropzone
        accept={IMAGE_ACCEPT}
        onFile={(f) => void processFile(f)}
        title="Drop an image here or click to upload"
        description="PNG, JPG, WebP, GIF · max 10 MB · outputs WebP or JPEG"
      />

      {error && <p role="alert" className="text-sm text-[#ef4444]">{error}</p>}
      {note && <p className="text-sm text-[var(--text-muted)] leading-relaxed">{note}</p>}

      {file && (
        <>
          <div className="flex flex-wrap items-center gap-4 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)]">
            <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              Quality
              <input
                type="range"
                min={0.35}
                max={0.95}
                step={0.05}
                value={quality}
                aria-valuetext={`${Math.round(quality * 100)} percent`}
                onChange={(e) => {
                  const q = Number(e.target.value);
                  setQuality(q);
                  if (file) scheduleCompress(file, q, format);
                }}
                className="w-32"
              />
              <span className="mono text-[var(--text-primary)] w-8">{Math.round(quality * 100)}</span>
            </label>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              Format
              <SegmentedControl
                label="Output format"
                compact
                value={format}
                onChange={(fmt) => {
                  setFormat(fmt);
                  if (file) scheduleCompress(file, quality, fmt);
                }}
                segments={[
                  { value: "image/webp", label: "WebP" },
                  { value: "image/jpeg", label: "JPEG" },
                ]}
              />
            </div>
            {appliedQuality !== null && appliedQuality < quality - 0.01 && (
              <span className="text-xs text-[var(--text-muted)]">
                Applied quality: {Math.round(appliedQuality * 100)}
              </span>
            )}
            {busy && (
              <span className="text-xs text-[var(--text-muted)]" aria-live="polite">
                Compressing…
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-4 flex flex-col gap-2">
              <span className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                Original · {formatBytes(file.size)}
                {dims && ` · ${dims.w}×${dims.h}`}
                {file.type && ` · ${file.type.replace("image/", "").toUpperCase()}`}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {preview && <img src={preview} alt="Original" className="max-h-64 object-contain mx-auto" />}
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-4 flex flex-col gap-2">
              <span className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                {keptOriginal
                  ? `Kept original · ${formatBytes(resultSize)}`
                  : `Compressed · ${formatBytes(resultSize)}${
                      deltaPct > 0 ? ` · −${deltaPct}%` : deltaPct < 0 ? ` · +${Math.abs(deltaPct)}%` : ""
                    }`}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {resultUrl && <img src={resultUrl} alt="Compressed" className="max-h-64 object-contain mx-auto" />}
              <DownloadButton
                disabled={!resultUrl}
                onClick={() => {
                  if (!resultBlob.current || !file) return;
                  if (keptOriginal) {
                    downloadBlob(resultBlob.current, file.name);
                    return;
                  }
                  const ext = format === "image/webp" ? "webp" : "jpg";
                  const base = file.name.replace(/\.[^.]+$/, "");
                  downloadBlob(resultBlob.current, `${base}-compressed.${ext}`);
                }}
                className="self-end mt-1"
              >
                {keptOriginal ? "Download original" : "Download compressed image"}
              </DownloadButton>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
