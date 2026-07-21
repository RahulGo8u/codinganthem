import Link from "next/link";
import { Coffee } from "lucide-react";
import { GitHubStars } from "./GitHubStars";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/tools";

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
          <nav className="flex items-center gap-5 text-xs text-[var(--text-muted)]">
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
            >
              GitHub
              <GitHubStars />
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
