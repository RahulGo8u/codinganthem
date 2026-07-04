"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";
import { marked } from "marked";

const tool = getToolBySlug("markdown-preview")!;

marked.setOptions({ async: false });

const SAMPLE = `# Hello\n\nThis is **bold**, this is *italic*, and here's a [link](https://codinganthem.com).\n\n- Item one\n- Item two\n\n\`\`\`js\nconst x = 42;\n\`\`\``;

export function MarkdownPreviewer() {
  const [input, setInput] = useState("");

  const rendered = useMemo(() => {
    if (!input.trim()) return "";
    return marked.parse(input) as string;
  }, [input]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output=""
      onInputChange={setInput}
      inputLabel="Markdown"
      outputLabel="Preview"
      inputPlaceholder={"# Hello\n\nWrite **Markdown** here and see a live preview."}
      extraActions={
        <button
          onClick={() => setInput(SAMPLE)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
      }
      outputContent={
        rendered ? (
          <div
            className="prose prose-sm dark:prose-invert max-w-none p-4 text-[var(--text-primary)] [&_a]:text-[#6366f1] [&_code]:bg-[var(--bg-elevated)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_pre]:bg-[var(--bg-elevated)] [&_pre]:rounded-lg [&_pre]:p-4 [&_blockquote]:border-l-2 [&_blockquote]:border-[#6366f1] [&_blockquote]:pl-4 [&_blockquote]:text-[var(--text-muted)] [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5"
            dangerouslySetInnerHTML={{ __html: rendered }}
          />
        ) : (
          <p className="p-4 text-[var(--text-muted)] text-sm">Preview will appear here...</p>
        )
      }
    />
  );
}
