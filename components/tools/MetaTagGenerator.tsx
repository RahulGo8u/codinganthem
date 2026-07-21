"use client";

import { useMemo, useState, useCallback } from "react";
import { getToolBySlug } from "@/lib/tools";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CopyChip } from "@/components/CopyChip";

const tool = getToolBySlug("meta-tag-generator")!;

function escapeAttr(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
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
  const [copied, setCopied] = useState(false);

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

  const copyAll = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* silent */
    }
  }, [html]);

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    opts?: { multiline?: boolean; hint?: string }
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
      {opts?.hint && <span className="text-[10px] opacity-80">{opts.hint}</span>}
    </label>
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
          {field("Page title", title, setTitle, { hint: `${title.length}/60 characters recommended` })}
          {field("Meta description", description, setDescription, {
            multiline: true,
            hint: `${description.length}/160 characters recommended`,
          })}
          {field("Canonical URL", url, setUrl)}
          {field("OG / Twitter image URL", image, setImage)}
          {field("Site name", siteName, setSiteName)}
          {field("Twitter handle", twitter, setTwitter)}
          {field("Robots", robots, setRobots)}
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-[var(--border)] bg-white p-4 flex flex-col gap-3">
            <span className="text-xs uppercase tracking-wider text-zinc-500">Google preview</span>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-[#1a0dab] truncate">{title || "Page title"}</span>
              <span className="text-xs text-[#006621] truncate">{url || "https://example.com"}</span>
              <span className="text-xs text-zinc-600 leading-relaxed line-clamp-2">
                {description || "Meta description appears here."}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
            <div className="h-36 bg-[var(--bg-elevated)] flex items-center justify-center text-xs text-[var(--text-muted)] border-b border-[var(--border)] overflow-hidden">
              {image ? (
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
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Generated HTML</span>
          <div className="flex items-center gap-3">
            <CopyChip value={html} label="HTML" />
            <button
              onClick={() => void copyAll()}
              className="text-xs font-medium text-[#22c55e] hover:text-[#16a34a]"
            >
              {copied ? "Copied ✓" : "Copy all"}
            </button>
          </div>
        </div>
        <pre className="mono text-xs text-[var(--text-primary)] whitespace-pre-wrap break-all leading-relaxed max-h-80 overflow-auto">
          {html}
        </pre>
      </div>
    </div>
  );
}
