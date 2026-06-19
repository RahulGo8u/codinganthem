import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "CodingAnthem is a collection of fast, free developer tools that run entirely in your browser.",
  alternates: {
    canonical: "https://www.codinganthem.com/about",
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <div className="flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
            About <span className="text-[#6366f1]">CodingAnthem</span>
          </h1>
          <p className="text-[var(--text-muted)] leading-relaxed">
            CodingAnthem is a collection of developer tools built to be fast, free, and zero-friction.
            Every tool runs entirely in your browser — your data never leaves your machine.
          </p>
        </div>

        {/* Principles */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
            Principles
          </h2>
          <div className="flex flex-col gap-3">
            {[
              {
                title: "Zero friction",
                desc: "No sign-up required. Ever. All free tools stay free.",
              },
              {
                title: "Privacy by default",
                desc: "All processing happens in your browser. Nothing is sent to a server.",
              },
              {
                title: "Fast",
                desc: "Tools respond in real-time as you type. No submit buttons, no loading spinners.",
              },
              {
                title: "Shareable",
                desc: "Tool state is encoded in the URL — share a pre-filled tool with one link.",
              },
            ].map(({ title, desc }) => (
              <div key={title} className="flex gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1] mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)] mb-0.5">{title}</p>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#6366f1]/15 border border-[#6366f1]/40 text-[#6366f1] text-sm font-medium hover:bg-[#6366f1]/25 transition-colors"
          >
            Browse all tools
          </Link>
          <a
            href="https://github.com/RahulGo8u/codinganthem"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] text-sm font-medium hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
