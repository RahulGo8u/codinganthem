"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("curl-to-fetch")!;

const SAMPLE = `curl -X POST https://api.example.com/users \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer token123" \\
  -d '{"name":"Alice","role":"admin"}'`;

function tokenize(cmd: string): string[] {
  const normalized = cmd.replace(/\\\r?\n/g, " ");
  const tokens: string[] = [];
  let i = 0;
  while (i < normalized.length) {
    while (i < normalized.length && /\s/.test(normalized[i])) i++;
    if (i >= normalized.length) break;
    let token = "";
    while (i < normalized.length && !/\s/.test(normalized[i])) {
      const ch = normalized[i];
      if (ch === "'" || ch === '"') {
        const quote = ch;
        i++;
        while (i < normalized.length && normalized[i] !== quote) {
          token += normalized[i];
          i++;
        }
        i++;
      } else {
        token += ch;
        i++;
      }
    }
    tokens.push(token);
  }
  return tokens;
}

function curlToFetch(curl: string): string {
  const trimmed = curl.trim();
  if (!trimmed.toLowerCase().startsWith("curl")) {
    throw new Error("Input must start with `curl`.");
  }

  const tokens = tokenize(trimmed);
  let url = "";
  let method = "";
  const headers: Record<string, string> = {};
  let body: string | null = null;

  for (let i = 1; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === "-X" || t === "--request") {
      method = tokens[++i] ?? "";
    } else if (t === "-H" || t === "--header") {
      const header = tokens[++i] ?? "";
      const idx = header.indexOf(":");
      if (idx > -1) {
        headers[header.slice(0, idx).trim()] = header.slice(idx + 1).trim();
      }
    } else if (t === "-d" || t === "--data" || t === "--data-raw" || t === "--data-binary") {
      body = tokens[++i] ?? "";
    } else if (t === "-u" || t === "--user") {
      const creds = tokens[++i] ?? "";
      headers["Authorization"] = `Basic ${typeof btoa !== "undefined" ? btoa(creds) : creds}`;
    } else if (!t.startsWith("-") && !url) {
      url = t;
    }
  }

  if (!url) throw new Error("No URL found in the curl command.");
  if (!method) method = body ? "POST" : "GET";

  const options: string[] = [`  method: "${method.toUpperCase()}",`];
  if (Object.keys(headers).length > 0) {
    const headerLines = Object.entries(headers)
      .map(([k, v]) => `    "${k}": ${JSON.stringify(v)},`)
      .join("\n");
    options.push(`  headers: {\n${headerLines}\n  },`);
  }
  if (body !== null) {
    options.push(`  body: ${JSON.stringify(body)},`);
  }

  return `fetch(${JSON.stringify(url)}, {\n${options.join("\n")}\n})\n  .then((res) => res.json())\n  .then((data) => console.log(data));`;
}

export function CurlToFetch() {
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: undefined };
    try {
      return { output: curlToFetch(input), error: undefined };
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
      hideFileActions
      showClear
      inputLabel="cURL command"
      outputLabel="fetch() call"
      inputPlaceholder={"curl -X POST https://api.example.com \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"key\":\"value\"}'"}
      outputPlaceholder="JavaScript fetch() code will appear here..."
      extraActions={
        <button
          onClick={() => setInput(SAMPLE)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
      }
    />
  );
}
