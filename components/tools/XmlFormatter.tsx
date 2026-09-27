"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { SegmentedControl } from "@/components/SegmentedControl";
import { getToolBySlug } from "@/lib/tools";
import { HighlightedOutput } from "@/lib/highlight";

const tool = getToolBySlug("xml-formatter")!;

const SAMPLE = `<note><to>Alice</to><from>Bob</from><heading>Reminder</heading><body>Don't forget the meeting tomorrow.</body></note>`;

// Numeric node type constants (avoids relying on the global `Node` object)
const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const CDATA_SECTION_NODE = 4;
const COMMENT_NODE = 8;

function formatNode(node: Element, indent: string, indentUnit: string): string {
  const children = Array.from(node.childNodes).filter(
    (n) => !(n.nodeType === TEXT_NODE && !n.textContent?.trim())
  );

  const attrs = Array.from(node.attributes)
    .map((a) => ` ${a.name}="${a.value}"`)
    .join("");
  const openTag = `<${node.nodeName}${attrs}`;

  if (children.length === 0) return `${indent}${openTag} />`;

  if (children.length === 1 && children[0].nodeType === TEXT_NODE) {
    return `${indent}${openTag}>${children[0].textContent?.trim()}</${node.nodeName}>`;
  }

  const childIndent = indent + indentUnit;
  const inner = children
    .map((child) => {
      if (child.nodeType === ELEMENT_NODE) return formatNode(child as Element, childIndent, indentUnit);
      if (child.nodeType === COMMENT_NODE) return `${childIndent}<!--${child.textContent}-->`;
      if (child.nodeType === CDATA_SECTION_NODE) return `${childIndent}<![CDATA[${child.textContent}]]>`;
      const text = child.textContent?.trim();
      return text ? `${childIndent}${text}` : "";
    })
    .filter(Boolean)
    .join("\n");

  return `${indent}${openTag}>\n${inner}\n${indent}</${node.nodeName}>`;
}

function minifyNode(node: Element): string {
  const children = Array.from(node.childNodes).filter(
    (n) => !(n.nodeType === TEXT_NODE && !n.textContent?.trim())
  );
  const attrs = Array.from(node.attributes)
    .map((a) => ` ${a.name}="${a.value}"`)
    .join("");
  const openTag = `<${node.nodeName}${attrs}`;
  if (children.length === 0) return `${openTag}/>`;
  if (children.length === 1 && children[0].nodeType === TEXT_NODE) {
    return `${openTag}>${children[0].textContent?.trim()}</${node.nodeName}>`;
  }
  const inner = children
    .map((child) => {
      if (child.nodeType === ELEMENT_NODE) return minifyNode(child as Element);
      if (child.nodeType === COMMENT_NODE) return `<!--${child.textContent}-->`;
      if (child.nodeType === CDATA_SECTION_NODE) return `<![CDATA[${child.textContent}]]>`;
      return child.textContent?.trim() ?? "";
    })
    .filter(Boolean)
    .join("");
  return `${openTag}>${inner}</${node.nodeName}>`;
}

function formatXml(xmlString: string, minify: boolean, indentSize: number): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "application/xml");
  const errorNode = doc.querySelector("parsererror");
  if (errorNode) {
    const raw = errorNode.textContent?.replace(/\s+/g, " ").trim() || "Invalid XML.";
    throw new Error(raw.replace(/^.*?error:\s*/i, "XML parse error: ") || "Invalid XML.");
  }
  if (!doc.documentElement) throw new Error("No root element found.");

  let result = "";
  const declMatch = xmlString.match(/^\s*<\?xml[^?]*\?>/);
  if (declMatch) result += declMatch[0].trim() + (minify ? "" : "\n");
  result += minify
    ? minifyNode(doc.documentElement)
    : formatNode(doc.documentElement, "", " ".repeat(indentSize));
  return result;
}

export function XmlFormatter() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"beautify" | "minify">("beautify");
  const [indent, setIndent] = useState<"2" | "4">("2");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: undefined };
    try {
      return {
        output: formatXml(input, mode === "minify", Number(indent)),
        error: undefined,
      };
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, mode, indent]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      error={error}
      downloadFileName="formatted.xml"
      downloadMimeType="application/xml"
      inputPlaceholder={"Paste your XML here...\n\n<note><to>Alice</to></note>"}
      outputPlaceholder="Formatted XML will appear here..."
      extraActions={
        <button
          type="button"
          onClick={() => setInput(SAMPLE)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
      }
      options={
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            label="Format mode"
            value={mode}
            onChange={setMode}
            segments={[
              { value: "beautify", label: "Beautify" },
              { value: "minify", label: "Minify" },
            ]}
          />
          {mode === "beautify" && (
            <SegmentedControl
              label="Indent size"
              value={indent}
              onChange={setIndent}
              compact
              segments={[
                { value: "2", label: "2 spaces" },
                { value: "4", label: "4 spaces" },
              ]}
            />
          )}
        </div>
      }
      outputContent={
        error ? (
          <div
            role="alert"
            className="flex items-start gap-2 px-4 py-2.5 bg-[#ef4444]/10 border-b border-[#ef4444]/30 text-xs text-[#ef4444] leading-relaxed"
          >
            <span className="shrink-0" aria-hidden="true">
              ⚠
            </span>
            <span>{error}</span>
          </div>
        ) : output ? (
          <HighlightedOutput code={output} lang="xml" />
        ) : (
          <p className="p-4 text-[var(--text-muted)] text-sm">
            Formatted XML will appear here...
          </p>
        )
      }
    />
  );
}
