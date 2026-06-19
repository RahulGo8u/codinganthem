"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("jwt-decoder")!;

function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return atob(padded);
}

function decodeJwt(token: string): { header: unknown; payload: unknown; signature: string } {
  const parts = token.trim().split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT — expected 3 dot-separated parts (header.payload.signature).");
  const header = JSON.parse(base64UrlDecode(parts[0]));
  const payload = JSON.parse(base64UrlDecode(parts[1]));
  return { header, payload, signature: parts[2] };
}

export function JwtDecoder() {
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: undefined };
    try {
      const { header, payload, signature } = decodeJwt(input);
      const result = {
        header,
        payload,
        signature: `${signature.slice(0, 16)}… (not verified)`,
      };
      return { output: JSON.stringify(result, null, 2), error: undefined };
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
      inputLabel="JWT Token"
      outputLabel="Decoded"
      inputPlaceholder="Paste your JWT here (eyJ...)"
      outputPlaceholder="Decoded header and payload will appear here..."
    />
  );
}
