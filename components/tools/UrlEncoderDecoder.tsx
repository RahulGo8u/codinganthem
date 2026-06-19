"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("url-encoder")!;

type Mode = "encode-component" | "encode-uri" | "decode";

const MODE_LABELS: Record<Mode, string> = {
  "encode-component": "Encode value",
  "encode-uri": "Encode URL",
  "decode": "Decode",
};

const MODE_HINTS: Record<Mode, string> = {
  "encode-component": "Encodes everything including / : ? & — for query param values",
  "encode-uri": "Preserves / : ? & # — for encoding a full URL",
  "decode": "Decodes %XX percent-encoded sequences back to text",
};

export function UrlEncoderDecoder() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("encode-component");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: undefined };
    try {
      if (mode === "encode-component") {
        return { output: encodeURIComponent(input), error: undefined };
      } else if (mode === "encode-uri") {
        return { output: encodeURI(input), error: undefined };
      } else {
        return { output: decodeURIComponent(input), error: undefined };
      }
    } catch (e) {
      return {
        output: "",
        error: mode === "decode"
          ? "Invalid percent-encoded string — make sure the input is valid URL-encoded text."
          : (e as Error).message,
      };
    }
  }, [input, mode]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      error={error}
      hideFileActions
      inputLabel={mode === "decode" ? "URL-encoded text" : "Plain text"}
      outputLabel={mode === "decode" ? "Decoded text" : "Encoded"}
      inputPlaceholder={
        mode === "encode-uri"
          ? "https://example.com/path?q=hello world&lang=en"
          : mode === "encode-component"
          ? "hello world & more"
          : "Enter percent-encoded string to decode..."
      }
      outputPlaceholder="Output will appear here..."
      options={
        <div className="flex flex-col gap-1.5">
          <div className="flex rounded-lg border border-[var(--border)] overflow-hidden text-xs">
            {(["encode-component", "encode-uri", "decode"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 transition-colors ${
                  mode === m
                    ? "bg-[#6366f1]/15 text-[#6366f1]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                }`}
              >
                {MODE_LABELS[m]}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-[var(--text-muted)]">{MODE_HINTS[mode]}</p>
        </div>
      }
    />
  );
}
