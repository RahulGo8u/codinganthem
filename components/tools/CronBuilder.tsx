"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ToolShell } from "@/components/ToolShell";
import { CopyButton } from "@/components/CopyButton";
import { getToolBySlug } from "@/lib/tools";
import { parseCron } from "@/lib/cron";

const tool = getToolBySlug("cron-builder")!;

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

type EveryOrValue = "every" | "value" | "step" | "range";

export function CronBuilder() {
  const [minuteMode, setMinuteMode] = useState<EveryOrValue>("step");
  const [minute, setMinute] = useState(0);
  const [minuteStep, setMinuteStep] = useState(15);
  const [minuteEnd, setMinuteEnd] = useState(45);
  const [hourMode, setHourMode] = useState<EveryOrValue>("range");
  const [hour, setHour] = useState(9);
  const [hourStep, setHourStep] = useState(2);
  const [hourEnd, setHourEnd] = useState(17);
  const [dayMode, setDayMode] = useState<"every" | "value">("every");
  const [day, setDay] = useState(1);
  const [monthMode, setMonthMode] = useState<"every" | "value">("every");
  const [month, setMonth] = useState(1);
  const [weekMode, setWeekMode] = useState<"every" | "weekdays" | "weekends" | "value">("weekdays");
  const [weekDay, setWeekDay] = useState(1);

  const expression = useMemo(() => {
    const minuteField =
      minuteMode === "every" ? "*" :
      minuteMode === "step" ? `*/${minuteStep}` :
      minuteMode === "range" ? `${minute}-${minuteEnd}` :
      String(minute);
    const hourField =
      hourMode === "every" ? "*" :
      hourMode === "step" ? `*/${hourStep}` :
      hourMode === "range" ? `${hour}-${hourEnd}` :
      String(hour);
    const dayField = dayMode === "every" ? "*" : String(day);
    const monthField = monthMode === "every" ? "*" : String(month);
    const weekField =
      weekMode === "every" ? "*" :
      weekMode === "weekdays" ? "1-5" :
      weekMode === "weekends" ? "0,6" :
      String(weekDay);
    return [minuteField, hourField, dayField, monthField, weekField].join(" ");
  }, [minuteMode, minute, minuteStep, minuteEnd, hourMode, hour, hourStep, hourEnd, dayMode, day, monthMode, month, weekMode, weekDay]);

  const parsed = useMemo(() => {
    try {
      return { result: parseCron(expression), error: "" };
    } catch (err) {
      return { result: null, error: err instanceof Error ? err.message : "Invalid cron expression." };
    }
  }, [expression]);

  const output = parsed.result
    ? [expression, parsed.result.summary, ...parsed.result.runs].join("\n")
    : expression;

  return (
    <ToolShell
      tool={tool}
      input={expression}
      output={output}
      onInputChange={() => undefined}
      hideInputPane
      hideFileActions
      outputLabel="Cron expression"
      downloadFileName="crontab.txt"
      outputContent={
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-[#6366f1]/30 bg-[#6366f1]/8 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Expression</p>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
              <p className="mono text-lg font-semibold text-[var(--text-primary)]">{expression}</p>
              <CopyButton value={expression} label="Copy expression" compact />
            </div>
            {parsed.result && (
              <p role="status" className="mt-2 text-sm capitalize text-[var(--text-primary)]">{parsed.result.summary}</p>
            )}
            {parsed.error && <p role="alert" className="mt-2 text-xs text-[#ef4444]">{parsed.error}</p>}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Minute">
              <ModeSelect label="Minute schedule" value={minuteMode} onChange={setMinuteMode} options={[["every", "Every minute"], ["step", "Every N minutes"], ["value", "At minute"], ["range", "From–to"]]} />
              {minuteMode === "step" && <NumberInput label="Every N minutes" value={minuteStep} min={1} max={30} onChange={setMinuteStep} />}
              {minuteMode === "value" && <NumberInput label="Minute" value={minute} min={0} max={59} onChange={setMinute} />}
              {minuteMode === "range" && (
                <div className="flex gap-2">
                  <NumberInput label="From minute" value={minute} min={0} max={59} onChange={setMinute} />
                  <NumberInput label="To minute" value={minuteEnd} min={0} max={59} onChange={setMinuteEnd} />
                </div>
              )}
            </Field>
            <Field label="Hour">
              <ModeSelect label="Hour schedule" value={hourMode} onChange={setHourMode} options={[["every", "Every hour"], ["step", "Every N hours"], ["value", "At hour"], ["range", "From–to"]]} />
              {hourMode === "step" && <NumberInput label="Every N hours" value={hourStep} min={1} max={12} onChange={setHourStep} />}
              {hourMode === "value" && <NumberInput label="Hour" value={hour} min={0} max={23} onChange={setHour} />}
              {hourMode === "range" && (
                <div className="flex gap-2">
                  <NumberInput label="From hour" value={hour} min={0} max={23} onChange={setHour} />
                  <NumberInput label="To hour" value={hourEnd} min={0} max={23} onChange={setHourEnd} />
                </div>
              )}
            </Field>
            <Field label="Day of month">
              <ModeSelect label="Day of month schedule" value={dayMode} onChange={setDayMode} options={[["every", "Every day"], ["value", "On day"]]} />
              {dayMode === "value" && <NumberInput label="Day of month" value={day} min={1} max={31} onChange={setDay} />}
            </Field>
            <Field label="Month">
              <ModeSelect label="Month schedule" value={monthMode} onChange={setMonthMode} options={[["every", "Every month"], ["value", "In month"]]} />
              {monthMode === "value" && (
                <select aria-label="Month" value={month} onChange={(event) => setMonth(Number(event.target.value))} className={selectClass}>
                  {MONTHS.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}
                </select>
              )}
            </Field>
            <Field label="Day of week">
              <ModeSelect label="Day of week schedule" value={weekMode} onChange={setWeekMode} options={[["every", "Every day"], ["weekdays", "Weekdays"], ["weekends", "Weekends"], ["value", "On day"]]} />
              {weekMode === "value" && (
                <select aria-label="Weekday" value={weekDay} onChange={(event) => setWeekDay(Number(event.target.value))} className={selectClass}>
                  {WEEKDAYS.map((name, index) => <option key={name} value={index}>{name}</option>)}
                </select>
              )}
            </Field>
          </div>

          {parsed.result && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Next 5 runs</p>
              <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                Local time ({Intl.DateTimeFormat().resolvedOptions().timeZone})
              </p>
              <ol className="mt-2 flex flex-col gap-1.5">
                {parsed.result.runs.map((run, index) => (
                  <li key={`${index}-${run}`} className="mono text-sm text-[var(--text-primary)]">{index + 1}. {run}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      }
    />
  );
}

const selectClass = "h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 text-sm text-[var(--text-primary)]";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3">
      <legend className="px-1 text-xs font-semibold text-[var(--text-primary)]">{label}</legend>
      {children}
    </fieldset>
  );
}

function ModeSelect<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: [T, string][];
}) {
  return (
    <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value as T)} className={selectClass}>
      {options.map(([option, text]) => <option key={option} value={option}>{text}</option>)}
    </select>
  );
}

function NumberInput({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <input
      aria-label={label}
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(event) => {
        const next = Number(event.target.value);
        if (Number.isFinite(next)) onChange(Math.min(max, Math.max(min, next)));
      }}
      className="mono h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 text-sm text-[var(--text-primary)]"
    />
  );
}
