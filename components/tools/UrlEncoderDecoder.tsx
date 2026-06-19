"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("url-encoder")!;

export function UrlEncoderDecoder() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: undefined };
    try {
      if (mode === "encode") {
        return { output: encodeURIComponent(input), error: undefined };
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
      inputLabel={mode === "encode" ? "Plain text" : "URL-encoded text"}
      outputLabel={mode === "encode" ? "URL-encoded" : "Decoded text"}
      inputPlaceholder={
        mode === "encode"
          ? "Enter text or URL to encode..."
          : "Enter percent-encoded string to decode..."
      }
      outputPlaceholder={mode === "encode" ? "Encoded output..." : "Decoded output..."}
      options={
        <div className="flex rounded-lg border border-[var(--border)] overflow-hidden text-xs">
          {(["encode", "decode"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 capitalize transition-colors ${
                mode === m
                  ? "bg-[#6366f1]/15 text-[#6366f1]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      }
    />
  );
}
