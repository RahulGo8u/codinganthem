"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { diffLines, type Change } from "diff";
import { getToolBySlug } from "@/lib/tools";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  PDF_ACCEPT,
  PDF_MAX_BYTES,
  PDF_MAX_PAGES,
  type LoadedPdf,
  type PageCompareResult,
  compareRenderedPages,
  extractPdfText,
  formatBytes,
  loadPdf,
  renderPdfPage,
  yieldToMain,
} from "@/lib/pdfCompare";

const tool = getToolBySlug("pdf-compare")!;

type Slot = {
  file: File | null;
  loaded: LoadedPdf | null;
  error: string | null;
  dragging: boolean;
  loading: boolean;
};

const emptySlot = (): Slot => ({
  file: null,
  loaded: null,
  error: null,
  dragging: false,
  loading: false,
});

type TextRow = {
  left: string | null;
  right: string | null;
  kind: "same" | "change";
};

function buildTextRows(diff: Change[]): TextRow[] {
  const rows: TextRow[] = [];
  let dels: string[] = [];
  let adds: string[] = [];

  const split = (value: string) => {
    const lines = value.split("\n");
    if (lines.length && lines[lines.length - 1] === "") lines.pop();
    return lines;
  };

  const flush = () => {
    const n = Math.max(dels.length, adds.length);
    for (let i = 0; i < n; i++) {
      rows.push({
        left: i < dels.length ? dels[i] : null,
        right: i < adds.length ? adds[i] : null,
        kind: "change",
      });
    }
    dels = [];
    adds = [];
  };

  for (const part of diff) {
    const lines = split(part.value);
    if (part.added) adds.push(...lines);
    else if (part.removed) dels.push(...lines);
    else {
      flush();
      for (const line of lines) rows.push({ left: line, right: line, kind: "same" });
    }
  }
  flush();
  return rows;
}

function PdfDropzone({
  label,
  slot,
  disabled,
  onFile,
  onClear,
  onDrag,
}: {
  label: string;
  slot: Slot;
  disabled?: boolean;
  onFile: (f: File) => void;
  onClear: () => void;
  onDrag: (dragging: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const openPicker = () => {
    if (disabled || slot.loading) return;
    inputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-2 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
          {label}
        </span>
        {(slot.file || slot.error) && !slot.loading && (
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className="text-xs text-[var(--text-muted)] hover:text-[#ef4444] transition-colors disabled:opacity-40"
          >
            Remove
          </button>
        )}
      </div>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={`${label}: drop a PDF or click to upload`}
        aria-busy={slot.loading}
        aria-disabled={disabled || slot.loading}
        onDragOver={(e) => {
          e.preventDefault();
          if (disabled || slot.loading) return;
          onDrag(true);
        }}
        onDragLeave={() => onDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          onDrag(false);
          if (disabled || slot.loading) return;
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors min-h-[140px] flex flex-col items-center justify-center gap-1 ${
          disabled || slot.loading ? "cursor-not-allowed opacity-70" : "cursor-pointer"
        } ${
          slot.dragging
            ? "border-[#6366f1] bg-[#6366f1]/10"
            : "border-[var(--border)] bg-[var(--bg-surface)] hover:border-[#6366f1]/40"
        }`}
      >
        {slot.loading ? (
          <>
            <p className="text-sm font-medium text-[var(--text-primary)] truncate max-w-full px-2">
              {slot.file?.name ?? "Opening PDF…"}
            </p>
            <p className="text-xs text-[var(--text-muted)]">Opening PDF…</p>
          </>
        ) : slot.file && slot.loaded ? (
          <>
            <p className="text-sm font-medium text-[var(--text-primary)] truncate max-w-full px-2">
              {slot.file.name}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {slot.loaded.pageCount} page{slot.loaded.pageCount === 1 ? "" : "s"} ·{" "}
              {formatBytes(slot.file.size)}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Drop a PDF here or click to upload
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Max {formatBytes(PDF_MAX_BYTES)} · up to {PDF_MAX_PAGES} pages
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={PDF_ACCEPT}
          className="hidden"
          disabled={disabled || slot.loading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
      </div>
      {slot.error && (
        <p className="text-xs text-[#ef4444]" role="alert">
          {slot.error}
        </p>
      )}
    </div>
  );
}

export function PdfCompare() {
  const [pdf1, setPdf1] = useState<Slot>(emptySlot);
  const [pdf2, setPdf2] = useState<Slot>(emptySlot);
  const [comparing, setComparing] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<PageCompareResult[] | null>(null);
  const [activePage, setActivePage] = useState(1);
  const [textRows, setTextRows] = useState<TextRow[] | null>(null);
  const [textStats, setTextStats] = useState<{ added: number; removed: number } | null>(null);
  const [hasTextLayer, setHasTextLayer] = useState(false);
  const [view, setView] = useState<"overlay" | "side">("overlay");
  const runId = useRef(0);
  const loadGen = useRef({ 1: 0, 2: 0 });
  const pdf1Ref = useRef(pdf1);
  const pdf2Ref = useRef(pdf2);

  useEffect(() => {
    pdf1Ref.current = pdf1;
  }, [pdf1]);

  useEffect(() => {
    pdf2Ref.current = pdf2;
  }, [pdf2]);

  const resetResults = useCallback(() => {
    setPages(null);
    setTextRows(null);
    setTextStats(null);
    setHasTextLayer(false);
    setError(null);
  }, []);

  const cancelCompare = useCallback(() => {
    runId.current += 1;
    setComparing(false);
    setProgress("");
  }, []);

  const assignFile = useCallback(
    async (which: 1 | 2, file: File) => {
      const setSlot = which === 1 ? setPdf1 : setPdf2;
      const gen = ++loadGen.current[which];
      cancelCompare();
      resetResults();

      setSlot((s) => {
        void s.loaded?.doc.destroy();
        return {
          file,
          loaded: null,
          error: null,
          dragging: false,
          loading: true,
        };
      });

      try {
        const loaded = await loadPdf(file);
        if (gen !== loadGen.current[which]) {
          void loaded.doc.destroy();
          return;
        }
        setSlot({ file, loaded, error: null, dragging: false, loading: false });
      } catch (e) {
        if (gen !== loadGen.current[which]) return;
        setSlot({
          file: null,
          loaded: null,
          error: e instanceof Error ? e.message : "Failed to load PDF.",
          dragging: false,
          loading: false,
        });
      }
    },
    [cancelCompare, resetResults]
  );

  const clearSlot = useCallback(
    (which: 1 | 2) => {
      loadGen.current[which] += 1;
      cancelCompare();
      const setSlot = which === 1 ? setPdf1 : setPdf2;
      setSlot((s) => {
        void s.loaded?.doc.destroy();
        return emptySlot();
      });
      resetResults();
    },
    [cancelCompare, resetResults]
  );

  const swap = useCallback(() => {
    if (pdf1.loading || pdf2.loading || comparing) return;
    cancelCompare();
    const a = pdf1;
    const b = pdf2;
    setPdf1(b);
    setPdf2(a);
    resetResults();
  }, [pdf1, pdf2, comparing, cancelCompare, resetResults]);

  const clearAll = useCallback(() => {
    loadGen.current[1] += 1;
    loadGen.current[2] += 1;
    cancelCompare();
    void pdf1.loaded?.doc.destroy();
    void pdf2.loaded?.doc.destroy();
    setPdf1(emptySlot());
    setPdf2(emptySlot());
    resetResults();
    setProgress("");
  }, [pdf1.loaded, pdf2.loaded, cancelCompare, resetResults]);

  useEffect(() => {
    return () => {
      runId.current += 1;
      void pdf1Ref.current.loaded?.doc.destroy();
      void pdf2Ref.current.loaded?.doc.destroy();
    };
  }, []);

  const canCompare =
    Boolean(pdf1.loaded && pdf2.loaded) &&
    !comparing &&
    !pdf1.loading &&
    !pdf2.loading;

  const runCompare = useCallback(async () => {
    if (!pdf1.loaded || !pdf2.loaded) return;
    const id = ++runId.current;
    setComparing(true);
    setError(null);
    setPages(null);
    setTextRows(null);
    setTextStats(null);
    setHasTextLayer(false);
    setProgress("Preparing…");

    try {
      const docA = pdf1.loaded.doc;
      const docB = pdf2.loaded.doc;
      const pageCount = Math.max(docA.numPages, docB.numPages);

      setProgress("Extracting text…");
      const [textA, textB] = await Promise.all([extractPdfText(docA), extractPdfText(docB)]);
      if (id !== runId.current) return;

      const hasText = textA.length > 0 || textB.length > 0;
      setHasTextLayer(hasText);
      if (hasText) {
        const rows = buildTextRows(diffLines(textA || "", textB || ""));
        setTextRows(rows);
        setTextStats({
          added: rows.filter((r) => r.kind === "change" && r.right !== null).length,
          removed: rows.filter((r) => r.kind === "change" && r.left !== null).length,
        });
      }

      const results: PageCompareResult[] = [];
      for (let p = 1; p <= pageCount; p++) {
        if (id !== runId.current) return;
        setProgress(`Comparing page ${p} of ${pageCount}…`);

        const left = p <= docA.numPages ? await renderPdfPage(docA, p) : blankPage();
        const right = p <= docB.numPages ? await renderPdfPage(docB, p) : blankPage();

        results.push(compareRenderedPages(left, right, p));
        await yieldToMain();
      }

      if (id !== runId.current) return;
      setPages(results);
      const firstDiff = results.find((r) => r.differs)?.pageNumber ?? 1;
      setActivePage(firstDiff);
      setProgress("");
    } catch (e) {
      if (id !== runId.current) return;
      setError(e instanceof Error ? e.message : "Compare failed.");
      setProgress("");
    } finally {
      if (id === runId.current) setComparing(false);
    }
  }, [pdf1.loaded, pdf2.loaded]);

  const summary = useMemo(() => {
    if (!pages) return null;
    const differing = pages.filter((p) => p.differs).length;
    const avgDiff =
      pages.reduce((s, p) => s + p.diffRatio, 0) / Math.max(pages.length, 1);
    const similarity = Math.max(0, Math.min(100, (1 - avgDiff) * 100));
    return { differing, total: pages.length, similarity };
  }, [pages]);

  const changedTextRows = useMemo(
    () => (textRows ? textRows.filter((r) => r.kind === "change") : []),
    [textRows]
  );

  const current = pages?.find((p) => p.pageNumber === activePage) ?? null;
  const busy = comparing || pdf1.loading || pdf2.loading;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6 pb-24">
      <div className="flex flex-col gap-3">
        <Breadcrumb current={tool.name} asHeading={false} />
        <div className="flex flex-col gap-1.5 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
            {tool.name}
          </h1>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-2xl">
            {tool.description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PdfDropzone
          label="PDF 1"
          slot={pdf1}
          disabled={comparing}
          onFile={(f) => void assignFile(1, f)}
          onClear={() => clearSlot(1)}
          onDrag={(d) => setPdf1((s) => ({ ...s, dragging: d }))}
        />
        <PdfDropzone
          label="PDF 2"
          slot={pdf2}
          disabled={comparing}
          onFile={(f) => void assignFile(2, f)}
          onClear={() => clearSlot(2)}
          onDrag={(d) => setPdf2((s) => ({ ...s, dragging: d }))}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void runCompare()}
          disabled={!canCompare}
          className="px-4 py-2 rounded-lg text-sm font-medium border border-[#6366f1]/40 bg-[#6366f1]/10 text-[var(--accent-text)] hover:bg-[#6366f1]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {comparing ? "Comparing…" : "Compare"}
        </button>
        {comparing && (
          <button
            type="button"
            onClick={cancelCompare}
            className="px-3 py-2 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={swap}
          disabled={(!pdf1.file && !pdf2.file) || busy}
          className="px-3 py-2 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Swap
        </button>
        <button
          type="button"
          onClick={clearAll}
          disabled={!pdf1.file && !pdf2.file && !pages && !error}
          className="px-3 py-2 rounded-lg text-xs font-medium border border-[#ef4444]/40 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Clear
        </button>
        {progress && (
          <span className="text-xs text-[var(--text-muted)]" aria-live="polite">
            {progress}
          </span>
        )}
      </div>

      {error && (
        <p className="text-sm text-[#ef4444]" role="alert">
          {error}
        </p>
      )}

      {summary && (
        <div className="flex flex-wrap items-center gap-4 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm">
          <span className="text-[var(--text-primary)] font-medium">
            {summary.differing === 0
              ? "No visual differences detected"
              : `${summary.differing} of ${summary.total} page${summary.total === 1 ? "" : "s"} differ`}
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            ~{summary.similarity.toFixed(1)}% visually similar
          </span>
          {textStats && (textStats.added > 0 || textStats.removed > 0) && (
            <span className="text-xs">
              <span className="text-[#22c55e]">+{textStats.added}</span>
              {" · "}
              <span className="text-[#ef4444]">−{textStats.removed}</span>
              {" text lines"}
            </span>
          )}
          {hasTextLayer && textStats && textStats.added === 0 && textStats.removed === 0 && (
            <span className="text-xs text-[var(--text-muted)]">Text layers match</span>
          )}
          {!hasTextLayer && pages && (
            <span className="text-xs text-[var(--text-muted)]">
              No extractable text layer — showing visual diff only
            </span>
          )}
        </div>
      )}

      {pages && pages.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActivePage((p) => Math.max(1, p - 1))}
                disabled={activePage <= 1}
                className="px-2.5 py-1 rounded-md text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>
              {pages.map((p) => (
                <button
                  key={p.pageNumber}
                  type="button"
                  onClick={() => setActivePage(p.pageNumber)}
                  aria-current={activePage === p.pageNumber ? "page" : undefined}
                  aria-label={`Page ${p.pageNumber}${p.differs ? ", differs" : ", identical"}`}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                    activePage === p.pageNumber
                      ? "border-[#6366f1]/50 bg-[#6366f1]/15 text-[var(--accent-text)]"
                      : p.differs
                        ? "border-[#ef4444]/40 text-[#ef4444] hover:bg-[#ef4444]/10"
                        : "border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
                  }`}
                >
                  {p.pageNumber}
                  {p.differs ? " ●" : ""}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setActivePage((p) => Math.min(pages.length, p + 1))}
                disabled={activePage >= pages.length}
                className="px-2.5 py-1 rounded-md text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
            <div className="flex gap-1.5" role="group" aria-label="View mode">
              {(["overlay", "side"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                    view === v
                      ? "border-[#6366f1]/50 bg-[#6366f1]/15 text-[var(--accent-text)]"
                      : "border-[var(--border)] text-[var(--text-muted)]"
                  }`}
                >
                  {v === "overlay" ? "Highlight" : "Side by side"}
                </button>
              ))}
            </div>
          </div>

          {current && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
              <p className="text-xs text-[var(--text-muted)] mb-3">
                Page {current.pageNumber}
                {current.differs
                  ? ` · ~${(current.diffRatio * 100).toFixed(2)}% pixels differ`
                  : " · looks identical"}
              </p>
              {view === "overlay" ? (
                // eslint-disable-next-line @next/next/no-img-element -- data URLs from canvas compare
                <img
                  src={current.overlayUrl}
                  alt={`Difference highlight for page ${current.pageNumber}`}
                  className="max-w-full mx-auto rounded border border-[var(--border)]"
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">
                      PDF 1
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element -- data URLs from canvas compare */}
                    <img
                      src={current.leftUrl}
                      alt={`PDF 1 page ${current.pageNumber}`}
                      className="w-full rounded border border-[var(--border)]"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">
                      PDF 2
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element -- data URLs from canvas compare */}
                    <img
                      src={current.rightUrl}
                      alt={`PDF 2 page ${current.pageNumber}`}
                      className="w-full rounded border border-[var(--border)]"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {changedTextRows.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            Text changes
          </label>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] overflow-auto max-h-[420px]">
            <div className="grid grid-cols-2 text-[10px] uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border)] sticky top-0 bg-[var(--bg-surface)] z-10">
              <div className="px-4 py-1.5 border-r border-[var(--border)]">PDF 1</div>
              <div className="px-4 py-1.5">PDF 2</div>
            </div>
            <div className="mono text-sm leading-relaxed">
              {changedTextRows.slice(0, 200).map((row, i) => (
                <div key={i} className="grid grid-cols-2">
                  <div
                    className={`px-3 py-0.5 border-r border-[var(--border)] whitespace-pre-wrap break-words ${
                      row.left !== null ? "bg-[#ef4444]/10 text-[#ef4444]" : "bg-[var(--bg-elevated)]/40"
                    }`}
                  >
                    {row.left ?? ""}
                  </div>
                  <div
                    className={`px-3 py-0.5 whitespace-pre-wrap break-words ${
                      row.right !== null ? "bg-[#22c55e]/10 text-[#22c55e]" : "bg-[var(--bg-elevated)]/40"
                    }`}
                  >
                    {row.right ?? ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {changedTextRows.length > 200 && (
            <p className="text-xs text-[var(--text-muted)]">Showing first 200 changed lines.</p>
          )}
        </div>
      )}
    </div>
  );
}

function blankPage() {
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 1018;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#f3f4f6";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#9ca3af";
  ctx.font = "16px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("(no page)", canvas.width / 2, canvas.height / 2);
  return { canvas, width: canvas.width, height: canvas.height };
}
