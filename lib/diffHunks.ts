/** Shared helpers for side-by-side line-diff hunk navigation. */

export type DiffKind = "same" | "change";

export type DiffRowLike = { kind: DiffKind };

/** Row indices where each contiguous change block begins. */
export function findHunkStarts(rows: DiffRowLike[]): number[] {
  const starts: number[] = [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].kind === "change" && (i === 0 || rows[i - 1].kind !== "change")) {
      starts.push(i);
    }
  }
  return starts;
}

export function hunkRange(
  rows: DiffRowLike[],
  start: number
): { start: number; end: number } {
  let end = start;
  while (end + 1 < rows.length && rows[end + 1].kind === "change") end++;
  return { start, end };
}

export function wrapIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

/** Left accent bar for the active hunk (no horizontal rings). */
export function activeHunkRowClass(
  inActive: boolean,
  isHunkStart: boolean,
  isHunkEnd: boolean
): string {
  if (!inActive) return "";
  return [
    "shadow-[inset_3px_0_0_0_#6366f1]",
    isHunkStart ? "rounded-t-sm" : "",
    isHunkEnd ? "rounded-b-sm" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/** True when keyboard shortcuts should be ignored (typing in a field). */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}
