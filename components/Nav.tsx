"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Nav() {
  const openPalette = () => {
    document.getElementById("cmd-palette-trigger")?.click();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg-base)]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="font-semibold tracking-tight hover:opacity-80 transition-opacity text-base"
          style={{ color: "var(--text-primary)" }}
        >
          <span style={{ color: "#6366f1" }}>coding</span>anthem
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Link
            href="/about"
            className="hidden sm:block text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors px-2"
          >
            About
          </Link>
          {/* Search trigger */}
          <button
            onClick={openPalette}
            className="hidden sm:flex items-center gap-3 px-3 h-8 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:border-[#6366f1]/40 hover:text-[var(--text-primary)] transition-colors text-sm"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="text-xs">Search tools</span>
          </button>

          {/* Mobile search icon */}
          <button
            onClick={openPalette}
            className="sm:hidden w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            aria-label="Search tools"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
