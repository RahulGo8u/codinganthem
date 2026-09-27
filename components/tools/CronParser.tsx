"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";
import { CopyChip } from "@/components/CopyChip";

const tool = getToolBySlug("cron-parser")!;

const SAMPLE = "*/15 9-17 * * 1-5";

const PRESETS: { label: string; value: string }[] = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Hourly", value: "0 * * * *" },
  { label: "Daily 9am", value: "0 9 * * *" },
  { label: "Weekdays", value: "*/15 9-17 * * 1-5" },
  { label: "Monthly 1st", value: "0 0 1 * *" },
];

interface FieldDef { name: string; min: number; max: number; labels?: string[]; }

const FIELDS_5: FieldDef[] = [
  { name: "Minute",      min: 0, max: 59 },
  { name: "Hour",        min: 0, max: 23 },
  { name: "Day (month)", min: 1, max: 31 },
  { name: "Month",       min: 1, max: 12, labels: ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] },
  { name: "Day (week)",  min: 0, max: 6,  labels: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"] },
];
const FIELDS_6: FieldDef[] = [
  { name: "Second",      min: 0, max: 59 },
  ...FIELDS_5,
];

function explainField(expr: string, field: FieldDef): string {
  const { name, min, max, labels } = field;
  const label = (n: number) => labels ? (labels[n] ?? String(n)) : String(n);
  if (expr === "*") return `every ${name.toLowerCase()}`;
  if (/^\d+$/.test(expr)) {
    const n = Number(expr);
    if (n < min || n > max) throw new Error(`${name}: ${n} is out of range ${min}–${max}.`);
    return `at ${name.toLowerCase()} ${label(n)}`;
  }
  if (/^\*\/\d+$/.test(expr)) {
    const step = Number(expr.split("/")[1]);
    return `every ${step} ${name.toLowerCase()}${step > 1 ? "s" : ""}`;
  }
  if (/^\d+-\d+$/.test(expr)) {
    const [a, b] = expr.split("-").map(Number);
    return `${name} ${label(a)} through ${label(b)}`;
  }
  if (/^[\d,]+$/.test(expr)) {
    const vals = expr.split(",").map(Number);
    return `${name} ${vals.map(label).join(", ")}`;
  }
  throw new Error(`${name}: unsupported expression "${expr}".`);
}

function expandField(expr: string, field: FieldDef): number[] {
  const { min, max } = field;
  const all = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  if (expr === "*") return all;
  if (/^\*\/\d+$/.test(expr)) {
    const step = Number(expr.split("/")[1]);
    return all.filter((n) => (n - min) % step === 0);
  }
  if (/^\d+$/.test(expr)) return [Number(expr)];
  if (/^\d+-\d+$/.test(expr)) {
    const [a, b] = expr.split("-").map(Number);
    return all.filter((n) => n >= a && n <= b);
  }
  if (/^[\d,]+$/.test(expr)) return expr.split(",").map(Number);
  return all;
}

function nextRuns(parts: string[], fields: FieldDef[], count = 5): string[] {
  const is6 = parts.length === 6;
  const [secParts, minParts, hrParts, domParts, monParts, dowParts] = is6
    ? parts
    : ["0", ...parts];

  const secs   = expandField(secParts, is6 ? fields[0] : { name: "Second", min: 0, max: 59 });
  const mins   = expandField(minParts, fields[is6 ? 1 : 0]);
  const hrs    = expandField(hrParts,  fields[is6 ? 2 : 1]);
  const doms   = expandField(domParts, fields[is6 ? 3 : 2]);
  const mons   = expandField(monParts, fields[is6 ? 4 : 3]).map((m) => m - 1); // JS 0-indexed
  const dows   = expandField(dowParts, fields[is6 ? 5 : 4]);

  const results: string[] = [];
  const d = new Date();
  d.setMilliseconds(0);
  d.setSeconds(d.getSeconds() + 1);

  for (let i = 0; i < 100000 && results.length < count; i++) {
    if (
      mons.includes(d.getMonth()) &&
      doms.includes(d.getDate()) &&
      dows.includes(d.getDay()) &&
      hrs.includes(d.getHours()) &&
      mins.includes(d.getMinutes()) &&
      secs.includes(d.getSeconds())
    ) {
      results.push(d.toLocaleString());
    }
    d.setSeconds(d.getSeconds() + 1);
  }
  return results;
}

function parseCron(cron: string): { fields: FieldDef[]; parts: string[]; explanations: string[]; summary: string; runs: string[] } {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5 && parts.length !== 6)
    throw new Error("Expected 5 fields (min hr dom mon dow) or 6 fields with seconds.");

  const fields = parts.length === 6 ? FIELDS_6 : FIELDS_5;
  const explanations = parts.map((p, i) => explainField(p, fields[i]));

  const [min, hr, dom, mon, dow] = parts.length === 6 ? parts.slice(1) : parts;
  let summary = "Runs ";
  if (min === "*" && hr === "*") summary += "every minute";
  else if (min.startsWith("*/") && hr === "*") summary += `every ${min.split("/")[1]} minutes`;
  else if (/^\d+$/.test(min) && /^\d+$/.test(hr)) summary += `at ${hr.padStart(2,"0")}:${min.padStart(2,"0")}`;
  else summary += `${explanations[parts.length === 6 ? 1 : 0]}, ${explanations[parts.length === 6 ? 2 : 1]}`;
  if (dom !== "*") summary += `, on day ${dom} of the month`;
  if (mon !== "*") summary += `, in ${explainField(mon, fields[parts.length === 6 ? 4 : 3]).replace("at month ", "")}`;
  if (dow !== "*") summary += `, on ${explainField(dow, fields[parts.length === 6 ? 5 : 4]).replace("day (week) ", "")}`;

  const runs = nextRuns(parts, fields);
  if (runs.length === 0) {
    summary += " — no runs found in the next ~27 hours of scanning";
  }
  return { fields, parts, explanations, summary, runs };
}

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
