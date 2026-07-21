import Link from "next/link";
import { Coffee } from "lucide-react";
import { GitHubStars } from "./GitHubStars";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/tools";

function GitHubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function XIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.227-8.26L1.99 2.25h7.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YouTubeIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">

          {/* Brand + tagline */}
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              <span style={{ color: "#6366f1" }}>coding</span>anthem
            </span>
            <p className="text-xs text-[var(--text-muted)]">
              Fast, free developer tools for everyday use.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--text-muted)]">
            <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">
              Tools
            </Link>
            <Link href="/about" className="hover:text-[var(--text-primary)] transition-colors">
              About
            </Link>
            <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">
              Privacy
            </Link>
            <a
              href="https://github.com/RahulGo8u/codinganthem"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[var(--text-primary)] transition-colors"
              aria-label="GitHub"
            >
              <GitHubIcon size={14} />
              GitHub
              <GitHubStars />
            </a>
            <a
              href="https://x.com/codinganthem"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[var(--text-primary)] transition-colors"
              aria-label="X (Twitter)"
            >
              <XIcon size={13} />
              X
            </a>
            <a
              href="https://www.youtube.com/@codinganthem"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[var(--text-primary)] transition-colors"
              aria-label="YouTube"
            >
              <YouTubeIcon size={14} />
              YouTube
            </a>
            <a
              href="https://buymeacoffee.com/codinganthem"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#f59e0b]/40 bg-[#f59e0b]/10 text-[#f59e0b] hover:bg-[#f59e0b]/20 transition-colors font-medium"
            >
              <Coffee size={12} />
              Buy me a coffee
            </a>
          </nav>

        </div>

        {/* Category links — site-wide crawl paths to hub pages */}
        <nav aria-label="Tool categories" className="mt-6 pt-5 border-t border-[var(--border)] flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--text-muted)]">
          {CATEGORY_ORDER.map((id) => (
            <Link
              key={id}
              href={`/category/${id}`}
              className="hover:text-[var(--text-primary)] transition-colors"
            >
              {CATEGORY_LABELS[id]}
            </Link>
          ))}
        </nav>

        {/* Bottom line */}
        <div className="mt-6 pt-5 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
          © {new Date().getFullYear()} codinganthem — free forever.
        </div>
      </div>
    </footer>
  );
}
