export interface FieldDef {
  name: string;
  min: number;
  max: number;
  labels?: string[];
}

export const CRON_FIELDS_5: FieldDef[] = [
  { name: "Minute", min: 0, max: 59 },
  { name: "Hour", min: 0, max: 23 },
  { name: "Day (month)", min: 1, max: 31 },
  { name: "Month", min: 1, max: 12, labels: ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] },
  { name: "Day (week)", min: 0, max: 6, labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
];

export const CRON_FIELDS_6: FieldDef[] = [
  { name: "Second", min: 0, max: 59 },
  ...CRON_FIELDS_5,
];

export interface ParsedCron {
  fields: FieldDef[];
  parts: string[];
  explanations: string[];
  summary: string;
  runs: string[];
}

export function explainField(expr: string, field: FieldDef): string {
  const { name, min, max, labels } = field;
  const label = (n: number) => (labels ? (labels[n] ?? String(n)) : String(n));
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

  const secs = expandField(secParts, is6 ? fields[0] : { name: "Second", min: 0, max: 59 });
  const mins = expandField(minParts, fields[is6 ? 1 : 0]);
  const hrs = expandField(hrParts, fields[is6 ? 2 : 1]);
  const doms = expandField(domParts, fields[is6 ? 3 : 2]);
  const mons = expandField(monParts, fields[is6 ? 4 : 3]).map((m) => m - 1);
  const dows = expandField(dowParts, fields[is6 ? 5 : 4]);

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

export function parseCron(cron: string): ParsedCron {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5 && parts.length !== 6) {
    throw new Error("Expected 5 fields (min hr dom mon dow) or 6 fields with seconds.");
  }

  const fields = parts.length === 6 ? CRON_FIELDS_6 : CRON_FIELDS_5;
  const explanations = parts.map((part, i) => explainField(part, fields[i]));

  const [min, hr, dom, mon, dow] = parts.length === 6 ? parts.slice(1) : parts;
  let summary = "Runs ";
  if (min === "*" && hr === "*") summary += "every minute";
  else if (min.startsWith("*/") && hr === "*") summary += `every ${min.split("/")[1]} minutes`;
  else if (/^\d+$/.test(min) && /^\d+$/.test(hr)) summary += `at ${hr.padStart(2, "0")}:${min.padStart(2, "0")}`;
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
