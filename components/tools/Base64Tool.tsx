"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { SegmentedControl } from "@/components/SegmentedControl";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("base64")!;

const SAMPLES = {
  encode: "Hello, CodingAnthem!",
  decode: "SGVsbG8sIENvZGluZ0FudGhlbSE=",
};

function toUrlSafe(b64: string): string {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromUrlSafe(b64: string): string {
  let s = b64.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4;
  if (pad) s += "=".repeat(4 - pad);
  return s;
}

export function Base64Tool() {
  const [input, setInput] = useState(SAMPLES.encode);
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [urlSafe, setUrlSafe] = useState(false);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: undefined };
    try {
      if (mode === "encode") {
        const encoded = btoa(unescape(encodeURIComponent(input)));
        return {
          output: urlSafe ? toUrlSafe(encoded) : encoded,
          error: undefined,
        };
      }
      const normalized = urlSafe ? fromUrlSafe(input.trim()) : input.trim();
      return {
        output: decodeURIComponent(escape(atob(normalized))),
        error: undefined,
      };
    } catch (e) {
      return {
        output: "",
        error:
          mode === "decode"
            ? "Invalid Base64 — check padding and whether URL-safe mode matches the input."
            : (e as Error).message,
      };
    }
  }, [input, mode, urlSafe]);

  const swap = () => {
    if (!output) return;
    setInput(output);
    setMode((m) => (m === "encode" ? "decode" : "encode"));
  };

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      error={error}
      downloadFileName={mode === "encode" ? "encoded.b64.txt" : "decoded.txt"}
      inputLabel={mode === "encode" ? "Plain text" : "Base64 encoded"}
      outputLabel={mode === "encode" ? "Base64 encoded" : "Decoded text"}
      inputPlaceholder={
        mode === "encode"
          ? "Enter text to encode..."
          : "Paste Base64 encoded string here..."
      }
      outputPlaceholder={
        mode === "encode" ? "Encoded output..." : "Decoded output..."
      }
      extraActions={
        <>
          <button
            type="button"
            onClick={() => setInput(SAMPLES[mode])}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Load sample
          </button>
          <button
            type="button"
            onClick={swap}
            disabled={!output}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Swap ↕
          </button>
        </>
      }
      options={
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            label="Encode or decode"
            value={mode}
            onChange={setMode}
            segments={[
              { value: "encode", label: "Encode" },
              { value: "decode", label: "Decode" },
            ]}
          />
          <label className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={urlSafe}
              onChange={(e) => setUrlSafe(e.target.checked)}
              className="accent-[#6366f1]"
            />
            URL-safe Base64
          </label>
        </div>
      }
    />
  );
}
