import Link from "next/link";

interface BreadcrumbProps {
  /** Current page label shown after the separator */
  current: string;
  /**
   * Render the current label as an <h1> (default — correct for pages where
   * this is the only heading) or as plain text when the page already
   * defines its own <h1> elsewhere.
   */
  asHeading?: boolean;
}

/**
 * Shared "All tools / {current}" navigation row used at the top of every
 * tool page. Centralizing this avoids the markup drifting out of sync
 * across individual tool components.
 */
export function Breadcrumb({ current, asHeading = true }: BreadcrumbProps) {
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/"
        className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        All tools
      </Link>
      <span className="text-[var(--border)]">/</span>
      {asHeading ? (
        <h1 className="text-sm font-medium text-[var(--text-primary)]">{current}</h1>
      ) : (
        <span className="text-[var(--text-primary)]">{current}</span>
      )}
    </div>
  );
}
