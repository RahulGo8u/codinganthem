"use client";

import { useMemo, useState } from "react";
import { ToolShell } from "@/components/ToolShell";
import { CopyButton } from "@/components/CopyButton";
import { getToolBySlug } from "@/lib/tools";
import { marked } from "marked";

const tool = getToolBySlug("markdown-preview")!;

marked.setOptions({ async: false, gfm: true, breaks: false });

const SAMPLE = `# Hello

This is **bold**, this is *italic*, and here's a [link](https://codinganthem.com).

- Item one
- Item two

| Col A | Col B |
| ----- | ----- |
| 1     | 2     |

\`\`\`js
const x = 42;
\`\`\``;

const RAW_HTML_RE = /<\/?[a-zA-Z][\s\S]*?>/;

/** Strip dangerous tags/attrs from marked output (no extra dependency). */
function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") return html;
  const doc = new DOMParser().parseFromString(html, "text/html");
  const forbidden = ["script", "iframe", "object", "embed", "form", "link", "meta", "base", "style"];
  for (const tag of forbidden) {
    doc.querySelectorAll(tag).forEach((el) => el.remove());
  }
  doc.querySelectorAll("*").forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim();
      if (name.startsWith("on") || name === "srcdoc") {
        el.removeAttribute(attr.name);
        continue;
      }
      if (
        (name === "href" || name === "src" || name === "xlink:href") &&
        /^\s*javascript:/i.test(value)
      ) {
        el.removeAttribute(attr.name);
      }
    }
  });
  return doc.body.innerHTML;
}

export function MarkdownPreviewer() {
  const [input, setInput] = useState(SAMPLE);

  const { rendered, hasRawHtml } = useMemo(() => {
    if (!input.trim()) return { rendered: "", hasRawHtml: false };
    const raw = marked.parse(input) as string;
    return {
      rendered: sanitizeHtml(raw),
      hasRawHtml: RAW_HTML_RE.test(input),
    };
  }, [input]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={rendered}
      onInputChange={setInput}
      inputLabel="Markdown"
      outputLabel="Preview"
      inputPlaceholder={"# Hello\n\nWrite **Markdown** here and see a live preview."}
      downloadFileName="preview.html"
      downloadMimeType="text/html"
      extraActions={
        <button
          type="button"
          onClick={() => setInput(SAMPLE)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
      }
      extraRightActions={<CopyButton value={rendered} label="Copy HTML" compact />}
      options={
        hasRawHtml ? (
          <p
            role="note"
            className="text-[11px] leading-relaxed text-[#f59e0b] max-w-3xl"
          >
            Raw HTML in your Markdown is sanitized before preview (scripts, iframes, and event
            handlers are removed). Prefer Markdown syntax for untrusted content.
          </p>
        ) : (
          <p className="text-[11px] leading-relaxed text-[var(--text-muted)] max-w-3xl">
            Preview is sanitized client-side. On small screens, use the Markdown / Preview tabs
            above the panes.
          </p>
        )
      }
      outputContent={
        rendered ? (
          <div
            className="prose prose-sm dark:prose-invert max-w-none overflow-x-auto break-words text-[var(--text-primary)] [&_a]:text-[#6366f1] [&_code]:bg-[var(--bg-elevated)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_pre]:bg-[var(--bg-elevated)] [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_table]:block [&_table]:overflow-x-auto [&_table]:w-full [&_blockquote]:border-l-2 [&_blockquote]:border-[#6366f1] [&_blockquote]:pl-4 [&_blockquote]:text-[var(--text-muted)] [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_img]:max-w-full [&_img]:h-auto"
            dangerouslySetInnerHTML={{ __html: rendered }}
          />
        ) : (
          <p className="text-[var(--text-muted)] text-sm">Preview will appear here...</p>
        )
      }
    />
  );
}
