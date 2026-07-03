import Link from "next/link";
import { GitHubStars } from "./GitHubStars";

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
              All tools run in your browser. No data is sent to a server.
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
              className="hover:text-[var(--text-primary)] transition-colors"
            >
              Support ☕
            </a>
          </nav>

        </div>

        {/* Bottom line */}
        <div className="mt-6 pt-5 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
          © {new Date().getFullYear()} codinganthem — free forever.
        </div>
      </div>
    </footer>
  );
}
