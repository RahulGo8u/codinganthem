"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";
import { HighlightedOutput } from "@/lib/highlight";

const tool = getToolBySlug("xml-to-json")!;

const SAMPLE = `<note id="1"><to>Alice</to><from>Bob</from><heading>Reminder</heading><body>Don't forget the meeting tomorrow.</body></note>`;

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const CDATA_SECTION_NODE = 4;
const COMMENT_NODE = 8;

function xmlNodeToObj(node: Element): unknown {
  const attrs = Array.from(node.attributes);
  const children = Array.from(node.childNodes).filter(
    (n) => n.nodeType !== COMMENT_NODE && !(n.nodeType === TEXT_NODE && !n.textContent?.trim())
  );

  const elementChildren = children.filter((n) => n.nodeType === ELEMENT_NODE) as Element[];
  const textContent = children
    .filter((n) => n.nodeType === TEXT_NODE || n.nodeType === CDATA_SECTION_NODE)
    .map((n) => n.textContent?.trim())
    .filter(Boolean)
    .join(" ");

  if (elementChildren.length === 0) {
    if (attrs.length === 0) return textContent || "";
    const obj: Record<string, unknown> = {};
    attrs.forEach((a) => {
      obj[`@${a.name}`] = a.value;
    });
    if (textContent) obj["#text"] = textContent;
    return obj;
  }

  const obj: Record<string, unknown> = {};
  attrs.forEach((a) => {
    obj[`@${a.name}`] = a.value;
  });

  for (const child of elementChildren) {
    const name = child.nodeName;
    const value = xmlNodeToObj(child);
    if (name in obj) {
      if (Array.isArray(obj[name])) {
        (obj[name] as unknown[]).push(value);
      } else {
        obj[name] = [obj[name], value];
      }
    } else {
      obj[name] = value;
    }
  }
  if (textContent) obj["#text"] = textContent;
  return obj;
}

function xmlToJson(xmlString: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "application/xml");
  const errorNode = doc.querySelector("parsererror");
  if (errorNode) {
    const raw = errorNode.textContent?.replace(/\s+/g, " ").trim() || "Invalid XML.";
    throw new Error(raw.replace(/^.*?error:\s*/i, "XML parse error: ") || "Invalid XML.");
  }
  if (!doc.documentElement) throw new Error("No root element found.");

  const root = doc.documentElement;
  const result = { [root.nodeName]: xmlNodeToObj(root) };
  return JSON.stringify(result, null, 2);
}

export function XmlToJson() {
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: undefined };
    try {
      return { output: xmlToJson(input), error: undefined };
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      error={error}
      downloadFileName="converted.json"
      downloadMimeType="application/json"
      inputLabel="XML"
      outputLabel="JSON"
      inputPlaceholder={'Paste your XML here...\n\n<note id="1"><to>Alice</to></note>'}
      outputPlaceholder="JSON output will appear here..."
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
        <p className="text-[10px] text-[var(--text-muted)] max-w-xl">
          Attributes become <span className="mono">@name</span> keys; text nodes use{" "}
          <span className="mono">#text</span>; repeated sibling tags become arrays.
        </p>
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
          <HighlightedOutput code={output} />
        ) : (
          <p className="p-4 text-[var(--text-muted)] text-sm">JSON output will appear here...</p>
        )
      }
    />
  );
}
