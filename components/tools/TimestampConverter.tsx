"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("timestamp-converter")!;

export function TimestampConverter() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"to-date" | "to-unix">("to-date");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: undefined };

    if (mode === "to-date") {
      const num = Number(input.trim());
      if (isNaN(num)) return { output: "", error: "Enter a valid Unix timestamp (e.g. 1718822400)" };
      // auto-detect ms vs s
      const ms = num > 1e12 ? num : num * 1000;
      const d = new Date(ms);
      if (isNaN(d.getTime())) return { output: "", error: "Invalid timestamp" };
      return {
        output: [
          `Local:    ${d.toLocaleString()}`,
          `UTC:      ${d.toUTCString()}`,
          `ISO 8601: ${d.toISOString()}`,
          `Unix (s): ${Math.floor(ms / 1000)}`,
          `Unix (ms):${ms}`,
        ].join("\n"),
        error: undefined,
      };
    } else {
      const d = new Date(input.trim());
      if (isNaN(d.getTime())) return { output: "", error: "Invalid date string. Try: 2026-06-19 or June 19 2026" };
      return {
        output: [
          `Unix (s):  ${Math.floor(d.getTime() / 1000)}`,
          `Unix (ms): ${d.getTime()}`,
          `ISO 8601:  ${d.toISOString()}`,
          `UTC:       ${d.toUTCString()}`,
        ].join("\n"),
        error: undefined,
      };
    }
  }, [input, mode]);

  const now = Math.floor(Date.now() / 1000);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      error={error}
      inputLabel={mode === "to-date" ? "Unix Timestamp" : "Date / Time String"}
      outputLabel="Result"
      inputPlaceholder={
        mode === "to-date"
          ? `Enter Unix timestamp (e.g. ${now})`
          : "Enter date string (e.g. 2026-06-19T00:00:00Z)"
      }
      outputPlaceholder="Conversion result will appear here..."
      options={
        <>
          <div className="flex rounded-lg border border-[var(--border)] overflow-hidden text-xs">
            <button
              onClick={() => setMode("to-date")}
              className={`px-3 py-1.5 transition-colors ${
                mode === "to-date"
                  ? "bg-[#6366f1]/15 text-[#6366f1]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
              }`}
            >
              Timestamp → Date
            </button>
            <button
              onClick={() => setMode("to-unix")}
              className={`px-3 py-1.5 transition-colors ${
                mode === "to-unix"
                  ? "bg-[#6366f1]/15 text-[#6366f1]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
              }`}
            >
              Date → Timestamp
            </button>
          </div>
          <button
            onClick={() => setInput(String(now))}
            className="px-3 py-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Use current time
          </button>
        </>
      }
    />
  );
}
