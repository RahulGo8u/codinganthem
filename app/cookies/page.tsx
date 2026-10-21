import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Cookie Policy for CodingAnthem — which cookies the site sets, how Google AdSense uses cookies, and how to opt out.",
  alternates: {
    canonical: "https://www.codinganthem.com/cookies",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const SECTIONS = [
  {
    title: "Cookies CodingAnthem sets",
    body: "CodingAnthem does not set its own tracking cookies. Theme preference and recently used tools are stored in your browser's localStorage, which stays on your device and is not sent to us. You can clear it from your browser's site-data settings.",
  },
  {
    title: "Analytics",
    body: "We use Plausible Analytics and Vercel Analytics to see aggregate traffic, such as which tools are used most. Both are cookie-free. They do not build a profile of you across other sites.",
  },
  {
    title: "Advertising cookies",
    body: "Google AdSense, and advertising partners working with Google, may set cookies and similar identifiers to serve ads, measure whether an ad was viewed, limit how often you see the same ad, and detect invalid traffic. If you allow personalized ads, those cookies can also remember that you visited this site so later ads are more relevant. Ads do not receive the text, code, or files you enter into a client-side tool. Google describes the cookies it uses at policies.google.com/technologies/cookies.",
  },
  {
    title: "Consent",
    body: "Where the law requires it, including in the European Economic Area, the United Kingdom, and Switzerland, a consent message is shown before Google uses cookies for personalized ads. You can accept or reject that use. Non-personalized ads may still appear.",
  },
  {
    title: "How to control cookies",
    body: "You can block or delete cookies in your browser settings. You can turn off personalized ads from Google at adssettings.google.com. Industry opt-out pages are at aboutads.info and youronlinechoices.eu. Blocking advertising cookies does not stop the tools from working.",
  },
  {
    title: "Changes",
    body: "If we add another service that sets cookies, this page and the Privacy Policy will be updated, and the date below will change.",
  },
];

export default function CookiePolicyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
            Cookie <span className="text-[var(--accent-text)]">Policy</span>
          </h1>
          <p className="text-[var(--text-muted)] leading-relaxed">
            This page explains the cookies and similar storage used on CodingAnthem. How we handle
            the data you put into tools is covered in the{" "}
            <Link href="/privacy" className="text-[var(--accent-text)] hover:underline">
              Privacy Policy
            </Link>
            . The rules for using the site are in the{" "}
            <Link href="/terms" className="text-[var(--accent-text)] hover:underline">
              Terms of Service
            </Link>
            . Last updated October 2026.
          </p>
        </div>

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

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#6366f1]/15 border border-[#6366f1]/40 text-[#6366f1] text-sm font-medium hover:bg-[#6366f1]/25 transition-colors"
          >
            Browse all tools
          </Link>
          <a
            href="https://github.com/RahulGo8u/codinganthem/issues"
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
