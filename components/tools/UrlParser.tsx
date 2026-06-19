"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("url-parser")!;

interface ParsedUrl {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  params: [string, string][];
  hash: string;
}

function parseUrl(raw: string): ParsedUrl {
  const url = new URL(raw.trim());
  const params: [string, string][] = [];
  url.searchParams.forEach((value, key) => params.push([key, value]));
  return {
    protocol: url.protocol.replace(":", ""),
    hostname: url.hostname,
    port: url.port,
    pathname: url.pathname,
    params,
    hash: url.hash.replace("#", ""),
  };
}

const FIELD_LABELS: { key: keyof Omit<ParsedUrl, "params">; label: string }[] = [
  { key: "protocol", label: "Protocol" },
  { key: "hostname", label: "Hostname" },
  { key: "port", label: "Port" },
  { key: "pathname", label: "Path" },
  { key: "hash", label: "Hash" },
];

export function UrlParser() {
  const [input, setInput] = useState("");

  const { parsed, error } = useMemo(() => {
    if (!input.trim()) return { parsed: null, error: undefined };
    try {
      return { parsed: parseUrl(input), error: undefined };
    } catch {
      return { parsed: null, error: "Invalid URL — make sure it includes a protocol (e.g. https://)." };
    }
  }, [input]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output=""
      onInputChange={setInput}
      error={error}
      hideFileActions
      showClear
      inputLabel="URL"
      outputLabel="Components"
      extraActions={
        <button
          onClick={() => setInput("https://www.example.com:8080/path/to/page?q=hello+world&page=2&sort=desc#section")}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
      }
      inputPlaceholder="https://www.example.com/path?q=hello&page=2#section"
      outputContent={
        parsed ? (
          <div className="p-4 flex flex-col gap-1">
            {FIELD_LABELS.map(({ key, label }) =>
              parsed[key] ? (
                <div key={key} className="flex items-start gap-3 py-2 border-b border-[var(--border)] last:border-0">
                  <span className="text-xs text-[var(--text-muted)] w-24 shrink-0 pt-0.5">{label}</span>
                  <span className="text-xs text-[var(--text-primary)] mono break-all">{parsed[key]}</span>
                </div>
              ) : null
            )}
            {parsed.params.length > 0 && (
              <div className="flex flex-col gap-1 py-2">
                <span className="text-xs text-[var(--text-muted)] mb-1">Query params</span>
                {parsed.params.map(([k, v]) => (
                  <div key={k} className="flex items-start gap-3 pl-2">
                    <span className="text-xs text-[#6366f1] mono w-32 shrink-0 truncate">{k}</span>
                    <span className="text-xs text-[var(--text-primary)] mono break-all">{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="p-4 text-[var(--text-muted)] text-sm">Parsed components will appear here...</p>
        )
      }
    />
  );
}
