"use client";

import { useState, useEffect } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";
import { HighlightedOutput } from "@/lib/highlight";

const tool = getToolBySlug("xml-formatter")!;

const SAMPLE = `<note><to>Alice</to><from>Bob</from><heading>Reminder</heading><body>Don't forget the meeting tomorrow.</body></note>`;

// Numeric node type constants (avoids relying on the global `Node` object)
const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const CDATA_SECTION_NODE = 4;
const COMMENT_NODE = 8;

function formatNode(node: Element, indent: string): string {
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

  const inner = children
    .map((child) => {
      if (child.nodeType === ELEMENT_NODE) return formatNode(child as Element, indent + "  ");
      if (child.nodeType === COMMENT_NODE) return `${indent}  <!--${child.textContent}-->`;
      if (child.nodeType === CDATA_SECTION_NODE) return `${indent}  <![CDATA[${child.textContent}]]>`;
      const text = child.textContent?.trim();
      return text ? `${indent}  ${text}` : "";
    })
    .filter(Boolean)
    .join("\n");

  return `${indent}${openTag}>\n${inner}\n${indent}</${node.nodeName}>`;
}

function formatXml(xmlString: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "application/xml");
  const errorNode = doc.querySelector("parsererror");
  if (errorNode) {
    throw new Error(errorNode.textContent?.replace(/\s+/g, " ").trim() || "Invalid XML.");
  }
  if (!doc.documentElement) throw new Error("No root element found.");

  let result = "";
  const declMatch = xmlString.match(/^\s*<\?xml[^?]*\?>/);
  if (declMatch) result += declMatch[0].trim() + "\n";
  result += formatNode(doc.documentElement, "");
  return result;
}

export function XmlFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      setError(undefined);
      return;
    }
    try {
      setOutput(formatXml(input));
      setError(undefined);
    } catch (e) {
      setOutput("");
      setError((e as Error).message);
    }
  }, [input]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      inputPlaceholder={"Paste your XML here...\n\n<note><to>Alice</to></note>"}
      outputPlaceholder="Formatted XML will appear here..."
      extraActions={
        <button
          onClick={() => setInput(SAMPLE)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
      }
      outputContent={
        error ? (
          <div className="flex items-start gap-2 px-4 py-2.5 bg-[#ef4444]/10 border-b border-[#ef4444]/30 text-xs text-[#ef4444] leading-relaxed">
            <span className="shrink-0">⚠</span>
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
