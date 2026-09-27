"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { SegmentedControl } from "@/components/SegmentedControl";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("url-encoder")!;

type Mode = "encode-component" | "encode-uri" | "decode-component" | "decode-uri";

const MODE_LABELS: Record<Mode, string> = {
  "encode-component": "Encode value",
  "encode-uri": "Encode URL",
  "decode-component": "Decode value",
  "decode-uri": "Decode URL",
};

const MODE_HINTS: Record<Mode, string> = {
  "encode-component": "encodeURIComponent — encodes / : ? & for query param values",
  "encode-uri": "encodeURI — preserves / : ? & # for a full URL",
  "decode-component": "decodeURIComponent — decodes %XX including encoded separators",
  "decode-uri": "decodeURI — safer for full URLs; leaves some reserved characters encoded",
};

const SAMPLES: Record<Mode, string> = {
  "encode-component": "hello world & more",
  "encode-uri": "https://example.com/path?q=hello world&lang=en",
  "decode-component": "hello%20world%20%26%20more",
  "decode-uri": "https://example.com/path%20name?q=hello%20world",
};

export function UrlEncoderDecoder() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("encode-component");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: undefined };
    try {
      if (mode === "encode-component") {
        return { output: encodeURIComponent(input), error: undefined };
      }
      if (mode === "encode-uri") {
        return { output: encodeURI(input), error: undefined };
      }
      if (mode === "decode-uri") {
        return { output: decodeURI(input), error: undefined };
      }
      return { output: decodeURIComponent(input), error: undefined };
    } catch (e) {
      return {
        output: "",
        error: mode.startsWith("decode")
          ? "Invalid percent-encoded string — check for malformed % sequences."
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
      showClear
      downloadFileName="url-encoded.txt"
      inputLabel={mode.startsWith("decode") ? "URL-encoded text" : "Plain text"}
      outputLabel={mode.startsWith("decode") ? "Decoded text" : "Encoded"}
      inputPlaceholder={
        mode === "encode-uri"
          ? "https://example.com/path?q=hello world&lang=en"
          : mode === "encode-component"
            ? "hello world & more"
            : "Enter percent-encoded string to decode..."
      }
      outputPlaceholder="Output will appear here..."
      extraActions={
        <button
          type="button"
          onClick={() => setInput(SAMPLES[mode])}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
      }
      options={
        <div className="flex flex-col gap-1.5 w-full">
          <p className="text-[10px] text-[var(--text-muted)] order-first sm:order-last">
            {MODE_HINTS[mode]}
          </p>
          <SegmentedControl
            label="URL encode or decode mode"
            value={mode}
            onChange={setMode}
            segments={(
              [
                "encode-component",
                "encode-uri",
                "decode-component",
                "decode-uri",
              ] as Mode[]
            ).map((m) => ({ value: m, label: MODE_LABELS[m] }))}
          />
        </div>
      }
    />
  );
}
