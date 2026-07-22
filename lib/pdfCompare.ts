/** Client-side PDF load, text extract, page render, and pixel compare helpers. */

export const PDF_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
export const PDF_MAX_PAGES = 50;
export const PDF_ACCEPT = "application/pdf,.pdf";

/** Max render width in CSS pixels — keeps memory predictable on phones. */
const RENDER_MAX_WIDTH = 720;
/** Cap page height after scale so a tiny-width / huge-height MediaBox cannot OOM. */
const RENDER_MAX_HEIGHT = 1400;
/** Hard ceiling on canvas pixel count (width * height). */
const RENDER_MAX_PIXELS = RENDER_MAX_WIDTH * RENDER_MAX_HEIGHT;
/** Cap extracted text so a text bomb cannot freeze the tab. */
const MAX_TEXT_CHARS = 500_000;
/** Cap how many text items we walk per page. */
const MAX_TEXT_ITEMS_PER_PAGE = 20_000;
/** Pixel channel delta below this counts as identical (anti-alias noise). */
const PIXEL_THRESHOLD = 28;
/** Fraction of differing pixels below this → page treated as identical. */
const PAGE_IDENTICAL_RATIO = 0.002;
/** pdf.js maxImageSize — skip decoding absurd embedded bitmaps. */
const MAX_IMAGE_PIXELS = 4096 * 4096;

type PdfJs = typeof import("pdfjs-dist");
type PDFDocumentProxy = import("pdfjs-dist").PDFDocumentProxy;

let pdfjsPromise: Promise<PdfJs> | null = null;

async function getPdfjs(): Promise<PdfJs> {
  if (typeof window === "undefined") {
    throw new Error("PDF compare only runs in the browser.");
  }
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((pdfjs) => {
      // Always pin to our same-origin worker — never let document content choose a worker URL.
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

/** True when the buffer starts with the PDF magic header `%PDF-`. */
export function looksLikePdf(data: Uint8Array): boolean {
  return (
    data.length >= 5 &&
    data[0] === 0x25 && // %
    data[1] === 0x50 && // P
    data[2] === 0x44 && // D
    data[3] === 0x46 && // F
    data[4] === 0x2d // -
  );
}

function isPdfFileName(name: string): boolean {
  // Reject path-like / null-byte names; require a real .pdf suffix (not .pdf.exe).
  if (!name || name.includes("\0") || name.includes("/") || name.includes("\\")) {
    return false;
  }
  const base = name.split(/[/\\]/).pop() ?? name;
  return /\.pdf$/i.test(base);
}

function assertAllowedUploadMeta(file: File): void {
  // Require .pdf name AND MIME application/pdf or empty (browsers often omit type on drop).
  // Content is still verified via %PDF- magic bytes before parsing.
  const mimeOk = file.type === "application/pdf" || file.type === "";
  const nameOk = isPdfFileName(file.name);
  if (!nameOk) {
    throw new Error("Only files with a .pdf extension are supported.");
  }
  if (!mimeOk) {
    throw new Error("Only PDF files are supported.");
  }
}

export type LoadedPdf = {
  file: File;
  doc: PDFDocumentProxy;
  pageCount: number;
};

export async function loadPdf(file: File): Promise<LoadedPdf> {
  if (!file || file.size === 0) {
    throw new Error("This file is empty.");
  }
  if (file.size > PDF_MAX_BYTES) {
    throw new Error(
      `File too large (${formatBytes(file.size)}). Maximum is ${formatBytes(PDF_MAX_BYTES)}.`
    );
  }

  assertAllowedUploadMeta(file);

  const pdfjs = await getPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());

  // Content sniff — blocks .pdf-named images/binaries/HTML before pdf.js runs.
  if (!looksLikePdf(data)) {
    throw new Error("This does not look like a valid PDF file.");
  }

  let doc: PDFDocumentProxy;
  try {
    doc = await pdfjs.getDocument({
      data,
      // Harden parsing surface area
      enableXfa: false,
      stopAtErrors: true,
      disableFontFace: true,
      useSystemFonts: false,
      verbosity: 0,
      // We pass a full buffer — no network range/stream fetches of the PDF itself
      disableRange: true,
      disableStream: true,
      disableAutoFetch: true,
      // Avoid worker fetching remote CMap/font/wasm URLs
      useWorkerFetch: false,
      maxImageSize: MAX_IMAGE_PIXELS,
    }).promise;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to open PDF.";
    if (/password|encrypted/i.test(msg)) {
      throw new Error("Password-protected PDFs are not supported.");
    }
    throw new Error("Could not open this PDF. It may be damaged or unsupported.");
  }

  if (doc.numPages > PDF_MAX_PAGES) {
    await doc.destroy();
    throw new Error(`Too many pages (${doc.numPages}). Maximum is ${PDF_MAX_PAGES}.`);
  }
  if (doc.numPages < 1) {
    await doc.destroy();
    throw new Error("This PDF has no pages.");
  }

  return { file, doc, pageCount: doc.numPages };
}

export async function extractPdfText(doc: PDFDocumentProxy): Promise<string> {
  const parts: string[] = [];
  let totalChars = 0;

  for (let i = 1; i <= doc.numPages; i++) {
    if (totalChars >= MAX_TEXT_CHARS) break;
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const strings: string[] = [];
    let lastY: number | null = null;
    let itemCount = 0;

    for (const item of content.items) {
      if (itemCount++ >= MAX_TEXT_ITEMS_PER_PAGE) break;
      if (!("str" in item)) continue;
      const y = Array.isArray(item.transform) ? item.transform[5] : null;
      if (lastY !== null && y !== null && Math.abs(y - lastY) > 6) {
        strings.push("\n");
      } else if (
        strings.length &&
        !strings[strings.length - 1].endsWith("\n") &&
        !strings[strings.length - 1].endsWith(" ")
      ) {
        strings.push(" ");
      }
      const str = typeof item.str === "string" ? item.str : "";
      strings.push(str);
      totalChars += str.length;
      if (totalChars >= MAX_TEXT_CHARS) break;
      if (y !== null) lastY = y;
    }
    parts.push(strings.join("").trim());
  }

  const text = parts.join("\n\n").trim();
  return text.length > MAX_TEXT_CHARS ? text.slice(0, MAX_TEXT_CHARS) : text;
}

export type RenderedPage = {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
};

function clampRenderScale(pageWidth: number, pageHeight: number): number {
  const safeW = Math.max(pageWidth, 1);
  const safeH = Math.max(pageHeight, 1);
  let scale = Math.min(1.5, RENDER_MAX_WIDTH / safeW);
  let w = safeW * scale;
  let h = safeH * scale;
  if (h > RENDER_MAX_HEIGHT) {
    scale *= RENDER_MAX_HEIGHT / h;
    w = safeW * scale;
    h = safeH * scale;
  }
  const pixels = w * h;
  if (pixels > RENDER_MAX_PIXELS) {
    scale *= Math.sqrt(RENDER_MAX_PIXELS / pixels);
  }
  return Math.max(scale, 0.05);
}

export async function renderPdfPage(
  doc: PDFDocumentProxy,
  pageNumber: number
): Promise<RenderedPage> {
  const page = await doc.getPage(pageNumber);
  const unscaled = page.getViewport({ scale: 1 });
  const scale = clampRenderScale(unscaled.width, unscaled.height);
  const viewport = page.getViewport({ scale });
  const width = Math.max(1, Math.floor(viewport.width));
  const height = Math.max(1, Math.floor(viewport.height));
  if (width * height > RENDER_MAX_PIXELS * 1.05) {
    throw new Error("PDF page dimensions are too large to render safely.");
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas not supported in this browser.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  return { canvas, width, height };
}

export type PageCompareResult = {
  pageNumber: number;
  differs: boolean;
  diffRatio: number;
  leftUrl: string;
  rightUrl: string;
  overlayUrl: string;
};

function padToSize(
  source: HTMLCanvasElement,
  width: number,
  height: number
): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0);
  return ctx.getImageData(0, 0, width, height);
}

export function compareRenderedPages(
  left: RenderedPage,
  right: RenderedPage,
  pageNumber: number
): PageCompareResult {
  const width = Math.max(left.width, right.width);
  const height = Math.max(left.height, right.height);
  if (width * height > RENDER_MAX_PIXELS * 1.05) {
    throw new Error("Combined page size is too large to compare safely.");
  }
  const a = padToSize(left.canvas, width, height);
  const b = padToSize(right.canvas, width, height);

  const overlay = document.createElement("canvas");
  overlay.width = width;
  overlay.height = height;
  const octx = overlay.getContext("2d")!;
  const base = document.createElement("canvas");
  base.width = width;
  base.height = height;
  const bctx = base.getContext("2d")!;
  bctx.fillStyle = "#ffffff";
  bctx.fillRect(0, 0, width, height);
  bctx.drawImage(left.canvas, 0, 0);
  bctx.globalAlpha = 0.45;
  bctx.drawImage(right.canvas, 0, 0);
  bctx.globalAlpha = 1;
  octx.drawImage(base, 0, 0);

  const heat = octx.getImageData(0, 0, width, height);
  let changed = 0;
  const total = width * height;
  for (let i = 0; i < a.data.length; i += 4) {
    const dr = Math.abs(a.data[i] - b.data[i]);
    const dg = Math.abs(a.data[i + 1] - b.data[i + 1]);
    const db = Math.abs(a.data[i + 2] - b.data[i + 2]);
    if (dr > PIXEL_THRESHOLD || dg > PIXEL_THRESHOLD || db > PIXEL_THRESHOLD) {
      changed++;
      heat.data[i] = 220;
      heat.data[i + 1] = 40;
      heat.data[i + 2] = 80;
      heat.data[i + 3] = 200;
    }
  }
  octx.putImageData(heat, 0, 0);

  const diffRatio = total > 0 ? changed / total : 0;
  const differs = diffRatio > PAGE_IDENTICAL_RATIO;

  return {
    pageNumber,
    differs,
    diffRatio,
    leftUrl: left.canvas.toDataURL("image/jpeg", 0.85),
    rightUrl: right.canvas.toDataURL("image/jpeg", 0.85),
    overlayUrl: overlay.toDataURL("image/jpeg", 0.85),
  };
}

export function yieldToMain(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
