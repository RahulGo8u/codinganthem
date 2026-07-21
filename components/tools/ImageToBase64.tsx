"use client";

import { useState, useCallback, useRef } from "react";
import { getToolBySlug } from "@/lib/tools";
import { Breadcrumb } from "@/components/Breadcrumb";

const tool = getToolBySlug("image-to-base64")!;

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"]);

export function ImageToBase64() {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copiedDataUrl, setCopiedDataUrl] = useState(false);
  const [copiedBase64, setCopiedBase64] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const base64Only = dataUrl ? dataUrl.split(",")[1] : "";

  const copy = useCallback(async (text: string, setCopied: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* silent */ }
  }, []);

  const clear = useCallback(() => {
    setDataUrl(null);
    setFileName("");
    setFileSize(0);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const downloadBase64 = useCallback(() => {
    if (!base64Only) return;
    const blob = new Blob([base64Only], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const baseName = fileName ? fileName.replace(/\.[^.]+$/, "") : "image";
    a.href = url;
    a.download = `${baseName}-base64.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [base64Only, fileName]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
      {/* Header */}
      <Breadcrumb current={tool.name} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upload area */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Image</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex flex-col items-center justify-center min-h-[280px] rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
              isDragging
                ? "border-[#6366f1] bg-[#6366f1]/10"
                : "border-[var(--border)] bg-[var(--bg-surface)] hover:border-[#6366f1]/50 hover:bg-[var(--bg-elevated)]"
            }`}
          >
            {dataUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={dataUrl} alt="Preview" className="max-h-[260px] max-w-full object-contain rounded p-2" />
            ) : (
              <div className="flex flex-col items-center gap-3 p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-[#6366f1]/10 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <p className="text-sm text-[var(--text-muted)]">Drop an image here or click to upload</p>
                <p className="text-xs text-[var(--text-muted)] opacity-60">PNG, JPG, GIF, WebP, SVG · Max 5 MB</p>
              </div>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
          {error && <p className="text-xs text-[#ef4444] leading-relaxed">{error}</p>}
          {dataUrl && (
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span className="truncate max-w-[200px]">{fileName}</span>
              <span>{(fileSize / 1024).toFixed(1)} KB</span>
            </div>
          )}
        </div>

        {/* Output */}
        <div className="flex flex-col gap-4">
          {/* Data URL */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Data URL</label>
              <button
                onClick={() => copy(dataUrl ?? "", setCopiedDataUrl)}
                disabled={!dataUrl}
                className={`text-xs px-2.5 py-1 rounded border transition-colors ${copiedDataUrl ? "text-[#22c55e] border-[#22c55e]/40" : "text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed"}`}
              >
                {copiedDataUrl ? "Copied ✓" : "Copy"}
              </button>
            </div>
            <textarea
              readOnly
              value={dataUrl ?? ""}
              placeholder="data:image/png;base64,..."
              spellCheck={false}
              className="mono min-h-[120px] p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none leading-relaxed break-all"
            />
          </div>

          {/* Base64 only */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Base64 only</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadBase64}
                  disabled={!base64Only}
                  className="text-xs px-2.5 py-1 rounded border transition-colors text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Download
                </button>
                <button
                  onClick={() => copy(base64Only, setCopiedBase64)}
                  disabled={!base64Only}
                  className={`text-xs px-2.5 py-1 rounded border transition-colors ${copiedBase64 ? "text-[#22c55e] border-[#22c55e]/40" : "text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed"}`}
                >
                  {copiedBase64 ? "Copied ✓" : "Copy"}
                </button>
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

      {/* Actions */}
      {dataUrl && (
        <div className="flex gap-2">
          <button
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
