"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";
import { CopyChip } from "@/components/CopyChip";
import { parseCron } from "@/lib/cron";

const tool = getToolBySlug("cron-parser")!;

const SAMPLE = "*/15 9-17 * * 1-5";

const PRESETS: { label: string; value: string }[] = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Hourly", value: "0 * * * *" },
  { label: "Daily 9am", value: "0 9 * * *" },
  { label: "Weekdays", value: "*/15 9-17 * * 1-5" },
  { label: "Monthly 1st", value: "0 0 1 * *" },
];

export function CronParser() {
  const [input, setInput] = useState("");

  const { output, error, parsed } = useMemo(() => {
    if (!input.trim()) return { output: "", error: undefined, parsed: null };
    try {
      const result = parseCron(input);
      const { fields, parts, explanations, summary, runs } = result;
      const lines = [
        summary,
        "",
        "Field breakdown:",
        ...fields.map((f, i) => `  ${f.name.padEnd(14)} ${parts[i].padEnd(10)} → ${explanations[i]}`),
        ...(runs.length > 0 ? ["", "Next 5 scheduled runs:"] : []),
        ...runs.map((r, i) => `  ${i + 1}. ${r}`),
      ];
      return { output: lines.join("\n"), error: undefined, parsed: result };
    } catch (e) {
      return { output: "", error: (e as Error).message, parsed: null };
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
      inputLabel="Cron expression"
      outputLabel="Explanation"
      inputPlaceholder="*/5 * * * *"
      outputPlaceholder="Plain-English explanation will appear here..."
      outputContent={
        parsed ? (
          <div className="p-4 flex flex-col gap-4">
            <div className="result-card flex items-center justify-between gap-3">
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Summary
                </span>
                <p
                  role="status"
                  aria-live="polite"
                  className="text-base text-[var(--text-primary)] capitalize"
                >
                  {parsed.summary}
                </p>
              </div>
              <CopyChip value={parsed.summary} label="summary" />
            </div>

            <div className="result-card flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                Field Breakdown
              </span>
              <div className="flex flex-col divide-y divide-[var(--border)]">
                {parsed.fields.map((f, i) => (
                  <div key={f.name} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                    <span className="text-sm text-[var(--text-primary)] w-28 shrink-0">{f.name}</span>
                    <span className="mono text-xs text-[var(--accent)] w-16 shrink-0">{parsed.parts[i]}</span>
                    <span className="text-xs text-[var(--text-muted)]">{parsed.explanations[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="result-card flex flex-col gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Next 5 Scheduled Runs
              </span>
              <p className="text-[10px] text-[var(--text-muted)]">
                Times shown in your local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone})
              </p>
              {parsed.runs.length > 0 ? (
                <ol className="flex flex-col gap-2" aria-live="polite">
                  {parsed.runs.map((r, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <span className="badge badge-accent">{i + 1}</span>
                      <span className="mono text-sm text-[var(--text-primary)]">{r}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p role="status" className="text-xs text-[var(--text-muted)]">
                  No upcoming runs found in the near scan window. The expression may be too sparse
                  or never match (check day-of-month vs day-of-week).
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="p-4 text-[var(--text-muted)] text-sm">Plain-English explanation will appear here...</p>
        )
      }
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
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Cron presets">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setInput(p.value)}
              className="px-2.5 py-1 rounded-md text-xs border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      }
    />
  );
}
