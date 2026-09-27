"use client";

import { useMemo, useState, useCallback } from "react";
import { getToolBySlug } from "@/lib/tools";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CopyButton } from "@/components/CopyButton";
import { CopyChip } from "@/components/CopyChip";

const tool = getToolBySlug("meta-tag-generator")!;

const TITLE_LIMIT = 60;
const DESC_LIMIT = 160;

function escapeAttr(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function lengthHint(len: number, limit: number): { text: string; tone: "ok" | "warn" | "over" } {
  if (len > limit) return { text: `${len}/${limit} — over recommended length`, tone: "over" };
  if (len > limit * 0.9) return { text: `${len}/${limit} — near recommended limit`, tone: "warn" };
  return { text: `${len}/${limit} characters recommended`, tone: "ok" };
}

function hintClass(tone: "ok" | "warn" | "over") {
  if (tone === "over") return "text-[#ef4444]";
  if (tone === "warn") return "text-[#f59e0b]";
  return "opacity-80";
}

export function MetaTagGenerator() {
  const [title, setTitle] = useState("CodingAnthem — Free Developer Tools");
  const [description, setDescription] = useState(
    "Fast, free developer tools that run in your browser. No sign-up required."
  );
  const [url, setUrl] = useState("https://www.codinganthem.com");
  const [image, setImage] = useState("https://www.codinganthem.com/opengraph-image");
  const [siteName, setSiteName] = useState("CodingAnthem");
  const [twitter, setTwitter] = useState("@codinganthem");
  const [robots, setRobots] = useState("index, follow");

  const titleHint = lengthHint(title.length, TITLE_LIMIT);
  const descHint = lengthHint(description.length, DESC_LIMIT);

  const html = useMemo(() => {
    const lines = [
      `<title>${escapeAttr(title)}</title>`,
      `<meta name="description" content="${escapeAttr(description)}" />`,
      `<meta name="robots" content="${escapeAttr(robots)}" />`,
      `<link rel="canonical" href="${escapeAttr(url)}" />`,
      "",
      `<!-- Open Graph -->`,
      `<meta property="og:type" content="website" />`,
      `<meta property="og:title" content="${escapeAttr(title)}" />`,
      `<meta property="og:description" content="${escapeAttr(description)}" />`,
      `<meta property="og:url" content="${escapeAttr(url)}" />`,
      `<meta property="og:site_name" content="${escapeAttr(siteName)}" />`,
      `<meta property="og:image" content="${escapeAttr(image)}" />`,
      "",
      `<!-- Twitter -->`,
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:title" content="${escapeAttr(title)}" />`,
      `<meta name="twitter:description" content="${escapeAttr(description)}" />`,
      `<meta name="twitter:image" content="${escapeAttr(image)}" />`,
    ];
    if (twitter.trim()) {
      lines.push(`<meta name="twitter:site" content="${escapeAttr(twitter)}" />`);
    }
    return lines.join("\n");
  }, [title, description, url, image, siteName, twitter, robots]);

  const field = useCallback(
    (
      label: string,
      value: string,
      onChange: (v: string) => void,
      opts?: { multiline?: boolean; hint?: string; hintTone?: "ok" | "warn" | "over" }
    ) => (
      <label className="flex flex-col gap-1.5 text-xs text-[var(--text-muted)]">
        {label}
        {opts?.multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] resize-y"
          />
        ) : (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
          />
        )}
        {opts?.hint && (
          <span className={`text-[10px] ${hintClass(opts.hintTone ?? "ok")}`}>{opts.hint}</span>
        )}
      </label>
    ),
    []
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6 pb-24">
      <div className="flex flex-col gap-3">
        <Breadcrumb current={tool.name} asHeading={false} />
        <div className="flex flex-col gap-1.5 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{tool.name}</h1>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-2xl">{tool.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-3">
          {field("Page title", title, setTitle, {
            hint: titleHint.text,
            hintTone: titleHint.tone,
          })}
          {field("Meta description", description, setDescription, {
            multiline: true,
            hint: descHint.text,
            hintTone: descHint.tone,
          })}
          {field("Canonical URL", url, setUrl)}
          {field("OG / Twitter image URL", image, setImage)}
          {field("Site name", siteName, setSiteName)}
          {field("Twitter handle", twitter, setTwitter)}
          {field("Robots", robots, setRobots)}
        </div>

        <div className="flex flex-col gap-4">
          {/* Theme-safe SERP chrome: always light (like Google), labeled as preview */}
          <div className="rounded-lg border border-[var(--border)] bg-[#ffffff] p-4 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs uppercase tracking-wider text-[#71717a]">Google preview</span>
              <span className="text-[10px] text-[#71717a]">Light preview chrome</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-[#1a0dab] truncate">{title || "Page title"}</span>
              <span className="text-xs text-[#006621] truncate">{url || "https://example.com"}</span>
              <span className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
                {description || "Meta description appears here."}
              </span>
            </div>
            {(titleHint.tone !== "ok" || descHint.tone !== "ok") && (
              <p className="text-[10px] text-[#b45309] leading-relaxed" role="status">
                {titleHint.tone === "over" && "Title exceeds ~60 characters and may truncate in SERPs. "}
                {titleHint.tone === "warn" && "Title is near the ~60 character limit. "}
                {descHint.tone === "over" && "Description exceeds ~160 characters and may truncate. "}
                {descHint.tone === "warn" && "Description is near the ~160 character limit."}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
            <div className="h-36 bg-[var(--bg-elevated)] flex items-center justify-center text-xs text-[var(--text-muted)] border-b border-[var(--border)] overflow-hidden">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element -- user-provided OG URL preview
                <img
                  src={image}
                  alt="OG preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                "OG image preview"
              )}
            </div>
            <div className="p-3 flex flex-col gap-0.5">
              <span className="text-[10px] uppercase text-[var(--text-muted)]">{siteName || "Site"}</span>
              <span className="text-sm font-medium text-[var(--text-primary)] truncate">{title}</span>
              <span className="text-xs text-[var(--text-muted)] line-clamp-2">{description}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Generated HTML</span>
          <div className="flex items-center gap-3">
            <CopyChip value={html} label="HTML" />
            <CopyButton value={html} label="Copy all" compact />
          </div>
        </div>
        <pre className="mono text-xs text-[var(--text-primary)] whitespace-pre-wrap break-all leading-relaxed max-h-80 overflow-auto">
          {html}
        </pre>
      </div>
    </div>
  );
}
