/**
 * Trigger a browser download from an existing URL.
 *
 * The anchor must be attached to the document for reliable behavior on mobile
 * browsers. Object URLs are revoked after the click has been dispatched rather
 * than immediately, which avoids cancelling downloads in Safari.
 */
export function downloadUrl(url: string, filename: string, revoke = false) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  if (revoke) {
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  downloadUrl(URL.createObjectURL(blob), filename, true);
}
