"use client";

import { useState, useCallback } from "react";
import { getToolBySlug } from "@/lib/tools";
import { ToolPageHeader } from "@/components/ToolPageHeader";
import { FileDropzone } from "@/components/FileDropzone";
import { CopyButton } from "@/components/CopyButton";
import { DownloadButton } from "@/components/DownloadButton";
import { downloadBlob } from "@/lib/download";

const tool = getToolBySlug("image-to-base64")!;

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"]);

export function ImageToBase64() {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback((file: File) => {
    setError(null);
    if (file.size > MAX_SIZE) {
      setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 5 MB.`);
      return;
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      setError("Only PNG, JPG, GIF, WebP, and SVG images are supported.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setDataUrl(e.target?.result as string);
      setFileName(file.name);
      setFileSize(file.size);
    };
    reader.onerror = () => setError("Failed to read file. Please try again.");
    reader.readAsDataURL(file);
  }, []);

  const base64Only = dataUrl ? dataUrl.split(",")[1] : "";
  const encodedBytes = base64Only ? Math.ceil((base64Only.length * 3) / 4) : 0;
  const inflation =
    fileSize > 0 && encodedBytes > 0
      ? Math.round(((base64Only.length / fileSize) - 1) * 100)
      : null;

  const clear = useCallback(() => {
    setDataUrl(null);
    setFileName("");
    setFileSize(0);
    setError(null);
  }, []);

  const downloadBase64 = useCallback(() => {
    if (!base64Only) return;
    const baseName = fileName ? fileName.replace(/\.[^.]+$/, "") : "image";
    downloadBlob(new Blob([base64Only], { type: "text/plain" }), `${baseName}-base64.txt`);
  }, [base64Only, fileName]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
      <ToolPageHeader tool={tool} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            Image
          </label>
          <FileDropzone
            accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
            onFile={processFile}
            title={
              dataUrl
                ? "Drop another image or click to replace"
                : "Drop an image here or click to upload"
            }
            description="PNG, JPG, GIF, WebP, SVG · Max 5 MB"
          >
            {dataUrl ? (
              <div className="flex flex-col items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={dataUrl}
                  alt="Selected image preview"
                  className="max-h-[220px] max-w-full object-contain rounded p-2"
                />
                <span className="inline-flex rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)]">
                  Replace image
                </span>
              </div>
            ) : undefined}
          </FileDropzone>
          {error && (
            <p role="alert" className="text-xs text-[#ef4444] leading-relaxed">
              {error}
            </p>
          )}
          {dataUrl && (
            <div className="flex items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
              <span className="truncate max-w-[200px]">{fileName}</span>
              <span>
                {(fileSize / 1024).toFixed(1)} KB
                {inflation != null ? ` · +${inflation}% as Base64` : ""}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Data URL
              </label>
              <CopyButton value={dataUrl ?? ""} compact label="Copy" />
            </div>
            <textarea
              readOnly
              value={dataUrl ?? ""}
              placeholder="data:image/png;base64,..."
              spellCheck={false}
              className="mono min-h-[120px] p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none leading-relaxed break-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Base64 only
              </label>
              <div className="flex items-center gap-2">
                <DownloadButton onClick={downloadBase64} disabled={!base64Only} compact>
                  Download
                </DownloadButton>
                <CopyButton value={base64Only} compact label="Copy" />
              </div>
            </div>
            <textarea
              readOnly
              value={base64Only}
              placeholder="iVBORw0KGgo..."
              spellCheck={false}
              className="mono min-h-[120px] p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none leading-relaxed break-all"
            />
          </div>
        </div>
      </div>

      {dataUrl && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={clear}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#ef4444]/40 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 hover:border-[#ef4444]/60 transition-colors"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
