/** Client-side PDF load, text extract, page render, and pixel compare helpers. */

export const PDF_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
export const PDF_MAX_PAGES = 50;
export const PDF_ACCEPT = "application/pdf,.pdf";

/** Max render width in CSS pixels — keeps memory predictable on phones. */
const RENDER_MAX_WIDTH = 720;
/** Pixel channel delta below this counts as identical (anti-alias noise). */
const PIXEL_THRESHOLD = 28;
/** Fraction of differing pixels below this → page treated as identical. */
const PAGE_IDENTICAL_RATIO = 0.002;

type PdfJs = typeof import("pdfjs-dist");
type PDFDocumentProxy = import("pdfjs-dist").PDFDocumentProxy;

let pdfjsPromise: Promise<PdfJs> | null = null;

async function getPdfjs(): Promise<PdfJs> {
  if (typeof window === "undefined") {
    throw new Error("PDF compare only runs in the browser.");
  }
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((pdfjs) => {
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
  return name.toLowerCase().endsWith(".pdf");
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

  const typeOk = !file.type || file.type === "application/pdf";
  const nameOk = isPdfFileName(file.name);
  if (!typeOk && !nameOk) {
    throw new Error("Only PDF files are supported.");
  }

  const pdfjs = await getPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());

  if (!looksLikePdf(data)) {
    throw new Error("This does not look like a valid PDF file.");
  }

  let doc: PDFDocumentProxy;
  try {
    doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
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
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const strings: string[] = [];
    let lastY: number | null = null;
    for (const item of content.items) {
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
      strings.push(item.str);
      if (y !== null) lastY = y;
    }
    parts.push(strings.join("").trim());
  }
  return parts.join("\n\n").trim();
}

export type RenderedPage = {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
};

export async function renderPdfPage(
  doc: PDFDocumentProxy,
  pageNumber: number
): Promise<RenderedPage> {
  const page = await doc.getPage(pageNumber);
  const unscaled = page.getViewport({ scale: 1 });
  const scale = Math.min(1.5, RENDER_MAX_WIDTH / unscaled.width);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas not supported in this browser.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  return { canvas, width: canvas.width, height: canvas.height };
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
