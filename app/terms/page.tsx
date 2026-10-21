import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms of Service for CodingAnthem — the rules for using the free developer tools, intellectual property, and limitations of liability.",
  alternates: {
    canonical: "https://www.codinganthem.com/terms",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const SECTIONS = [
  {
    title: "Using the site",
    body: "CodingAnthem provides free, browser-based developer tools. You can use them without an account. By using the site you agree to these Terms of Service. If you do not agree, do not use the site.",
  },
  {
    title: "Acceptable use",
    body: "Use the tools for lawful purposes. Do not attempt to disrupt the site, probe it for vulnerabilities beyond normal use, overload the URL shortener or other server-backed tools, or use them to distribute malware, phishing, or other harmful content. We may block or remove short links that abuse the service.",
  },
  {
    title: "Your input",
    body: "You keep whatever rights you have in text, code, or files you enter into a tool. Most tools process that input only in your browser. The URL Shortener stores the URL you submit so the redirect can work. AI tools send your input to Google's Gemini API, as described in the Privacy Policy. Do not paste secrets, credentials, or other people's personal data into those tools.",
  },
  {
    title: "Intellectual property",
    body: "The CodingAnthem name, site design, and original copy are ours. The source code is released under the Apache License 2.0, available in the GitHub repository. Tool output is generated for you from your input; we do not claim ownership of it. Third-party names (including Google AdSense and Gemini) belong to their owners.",
  },
  {
    title: "Advertising",
    body: "The site may show ads through Google AdSense. Ads are separate from the tools. They do not receive what you paste into a client-side tool. See the Cookie Policy for how advertising cookies work and how to opt out of personalized ads.",
  },
  {
    title: "No professional advice",
    body: "Tools that touch security, cryptography, networking, or finance — including hash and HMAC generators, JWT and key utilities, cron and CIDR calculators, and Ethereum address tools — are conveniences for development and learning. They are not a substitute for a security review, legal advice, or financial advice. Check important results yourself before you rely on them.",
  },
  {
    title: "Disclaimers and liability",
    body: "The site and tools are provided as is, without warranties of any kind, including accuracy, availability, or fitness for a particular purpose. To the extent the law allows, CodingAnthem is not liable for any loss or damage arising from your use of the site, including lost data, a wrong conversion, or downtime. Some places do not allow these limits, so they apply only as far as local law permits.",
  },
  {
    title: "Changes",
    body: "We may update these terms as the site changes — for example, when a new tool stores data or when advertising starts. The date at the top of this page will change when we do. Continued use after an update means you accept the revised terms.",
  },
];

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
            Terms of <span className="text-[var(--accent-text)]">Use</span>
          </h1>
          <p className="text-[var(--text-muted)] leading-relaxed">
            These Terms of Service cover how you may use CodingAnthem. They work together with the{" "}
            <Link href="/privacy" className="text-[var(--accent-text)] hover:underline">
              Privacy Policy
            </Link>{" "}
            and the{" "}
            <Link href="/cookies" className="text-[var(--accent-text)] hover:underline">
              Cookie Policy
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
