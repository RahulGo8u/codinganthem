"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("cron-parser")!;

interface FieldDef {
  name: string;
  min: number;
  max: number;
  labels?: string[];
}

const FIELDS: FieldDef[] = [
  { name: "Minute",     min: 0, max: 59 },
  { name: "Hour",       min: 0, max: 23 },
  { name: "Day (month)", min: 1, max: 31 },
  { name: "Month",      min: 1, max: 12, labels: ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] },
  { name: "Day (week)", min: 0, max: 6,  labels: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"] },
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

function parseCron(cron: string): { explanations: string[]; summary: string } {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) throw new Error("Expected 5 fields: minute hour day month weekday");

  const explanations = parts.map((p, i) => explainField(p, FIELDS[i]));

  const [min, hr, dom, mon, dow] = parts;
  let summary = "Runs ";
  if (min === "*" && hr === "*") summary += "every minute";
  else if (min.startsWith("*/") && hr === "*") summary += `every ${min.split("/")[1]} minutes`;
  else if (/^\d+$/.test(min) && /^\d+$/.test(hr)) summary += `at ${hr.padStart(2,"0")}:${min.padStart(2,"0")}`;
  else summary += `${explanations[0]}, ${explanations[1]}`;

  if (dom !== "*") summary += `, on day ${dom} of the month`;
  if (mon !== "*") summary += `, in ${explainField(mon, FIELDS[3]).replace("at month ", "")}`;
  if (dow !== "*") summary += `, on ${explainField(dow, FIELDS[4]).replace("day (week) ", "")}`;

  return { explanations, summary };
}

export function CronParser() {
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: undefined };
    try {
      const { explanations, summary } = parseCron(input);
      const lines = [
        summary,
        "",
        "Field breakdown:",
        ...FIELDS.map((f, i) => `  ${f.name.padEnd(14)} ${input.trim().split(/\s+/)[i].padEnd(10)} → ${explanations[i]}`),
      ];
      return { output: lines.join("\n"), error: undefined };
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
      inputLabel="Cron expression"
      outputLabel="Explanation"
      inputPlaceholder="*/5 * * * *"
      outputPlaceholder="Plain-English explanation will appear here..."
    />
  );
}
