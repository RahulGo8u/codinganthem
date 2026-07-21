import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "CodingAnthem's privacy policy — what data is collected, how it's used, and what stays entirely in your browser.",
  alternates: {
    canonical: "https://www.codinganthem.com/privacy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const SECTIONS = [
  {
    title: "Client-side tools",
    body: "The majority of tools on CodingAnthem — formatters, encoders, converters, generators, and more — run entirely in your browser using JavaScript and Web APIs (like the Web Crypto API). Whatever you paste, type, or upload into these tools is processed locally on your device and is never transmitted to any server.",
  },
  {
    title: "Server-side tools",
    body: "A small number of tools require a backend to function — currently, URL Shortener. When you use this tool, the URL you submit and the generated short code are stored in a database so the redirect can work. No account or personal information is collected or required to use it.",
  },
  {
    title: "Local storage",
    body: "CodingAnthem uses your browser's localStorage to remember your theme preference and your recently used tools. This data stays on your device — it is never sent to us or any third party, and you can clear it at any time by clearing your browser's site data.",
  },
  {
    title: "Analytics",
    body: "We use Plausible Analytics and Vercel Analytics to understand aggregate site traffic — for example, which tools are most used. Both are cookie-free and do not track individuals across sites or devices. We do not use Google Analytics, ad-network trackers, or any cross-site tracking technology.",
  },
  {
    title: "Cookies",
    body: "CodingAnthem does not set tracking cookies. No cookie consent banner is shown because no cookies are used for tracking or advertising purposes.",
  },
  {
    title: "Third parties",
    body: "We do not sell, rent, or share any data with third parties for advertising purposes. There are no ad networks or affiliate trackers on this site.",
  },
  {
    title: "Changes to this policy",
    body: "If this policy changes in a meaningful way — for example, if a new tool requires collecting additional data — this page will be updated to reflect that.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <div className="flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
            Privacy <span className="text-[#6366f1]">Policy</span>
          </h1>
          <p className="text-[var(--text-muted)] leading-relaxed">
            This page explains what data CodingAnthem collects, how it&apos;s used, and what stays
            entirely on your device. Last updated July 2026.
          </p>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-3">
          {SECTIONS.map(({ title, body }) => (
            <div
              key={title}
              className="flex gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1] mt-2 shrink-0" />
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)] mb-0.5">{title}</p>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
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
            Questions? Open an issue on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
