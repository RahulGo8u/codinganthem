/** Client-side PDF password unlock via qpdf (WebAssembly). */

import {
  createPdfToolkit,
  PdfPasswordError,
  type PdfToolkit,
} from "pdfstudio";
import {
  PDF_ACCEPT,
  PDF_MAX_BYTES,
  formatBytes,
  looksLikePdf,
} from "@/lib/pdfCompare";

export { PDF_ACCEPT, PDF_MAX_BYTES, formatBytes };

const WASM_URL = "/qpdf.wasm";

let toolkitPromise: Promise<PdfToolkit> | null = null;

function getToolkit(): Promise<PdfToolkit> {
  if (typeof window === "undefined") {
    throw new Error("PDF unlock only runs in the browser.");
  }
  if (!toolkitPromise) {
    toolkitPromise = createPdfToolkit({ wasmUrl: WASM_URL });
  }
  return toolkitPromise;
}

function isPdfFileName(name: string): boolean {
  if (!name || name.includes("\0") || name.includes("/") || name.includes("\\")) {
    return false;
  }
  const base = name.split(/[/\\]/).pop() ?? name;
  return /\.pdf$/i.test(base);
}

function assertAllowedUploadMeta(file: File): void {
  const mimeOk = file.type === "application/pdf" || file.type === "";
  const nameOk = isPdfFileName(file.name);
  if (!nameOk) {
    throw new Error("Only files with a .pdf extension are supported.");
  }
  if (!mimeOk) {
    throw new Error("Only PDF files are supported.");
  }
}

export type PdfLockStatus = {
  encrypted: boolean;
  requiresPassword: boolean;
  pageCount: number | null;
};

/** Validate upload bytes and report whether the PDF needs a password. */
export async function inspectPdf(file: File): Promise<PdfLockStatus> {
  if (!file || file.size === 0) {
    throw new Error("This file is empty.");
  }
  if (file.size > PDF_MAX_BYTES) {
    throw new Error(
      `File too large (${formatBytes(file.size)}). Maximum is ${formatBytes(PDF_MAX_BYTES)}.`
    );
  }
  assertAllowedUploadMeta(file);

  const data = new Uint8Array(await file.arrayBuffer());
  if (!looksLikePdf(data)) {
    throw new Error("This does not look like a valid PDF file.");
  }

  const pdf = await getToolkit();
  const encrypted = await pdf.isEncrypted(data);
  const requiresPassword = encrypted ? await pdf.requiresPassword(data) : false;

  let pageCount: number | null = null;
  if (!requiresPassword) {
    try {
      pageCount = await pdf.pageCount(data);
    } catch {
      pageCount = null;
    }
  }

  return { encrypted, requiresPassword, pageCount };
}

/** Decrypt with the given password and return unlocked PDF bytes. */
export async function unlockPdf(
  file: File,
  password: string
): Promise<{ bytes: Uint8Array; pageCount: number }> {
  if (!file || file.size === 0) {
    throw new Error("This file is empty.");
  }
  if (file.size > PDF_MAX_BYTES) {
    throw new Error(
      `File too large (${formatBytes(file.size)}). Maximum is ${formatBytes(PDF_MAX_BYTES)}.`
    );
  }
  assertAllowedUploadMeta(file);

  const data = new Uint8Array(await file.arrayBuffer());
  if (!looksLikePdf(data)) {
    throw new Error("This does not look like a valid PDF file.");
  }

  const pdf = await getToolkit();
  const encrypted = await pdf.isEncrypted(data);
  if (!encrypted) {
    throw new Error("This PDF is not password-protected.");
  }

  try {
    const bytes = await pdf.unlock(data, { password });
    const pageCount = await pdf.pageCount(bytes);
    return { bytes, pageCount };
  } catch (e) {
    if (e instanceof PdfPasswordError) {
      throw new Error("Incorrect password. Please try again.");
    }
    const msg = e instanceof Error ? e.message : "";
    if (/invalid password|password/i.test(msg)) {
      throw new Error("Incorrect password. Please try again.");
    }
    throw new Error("Could not unlock this PDF. It may be damaged or unsupported.");
  }
}

/** Suggest a download filename for an unlocked PDF. */
export function unlockedFileName(originalName: string): string {
  const base = (originalName.split(/[/\\]/).pop() ?? "document.pdf")
    .replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, "")
    .replace(/\.pdf$/i, "");
  const safe = (base || "document").slice(0, 160);
  return `${safe}-unlocked.pdf`;
}
