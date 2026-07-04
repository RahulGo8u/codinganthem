"use client";

import { useState, useCallback } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";
import { HighlightedOutput } from "@/lib/highlight";

const tool = getToolBySlug("mock-data-generator")!;

type Format = "json" | "csv";

interface FieldDef {
  key: string;
  label: string;
  group: string;
}

const FIELD_DEFS: FieldDef[] = [
  // Identity
  { key: "fullName",     label: "Full Name",      group: "Identity" },
  { key: "email",        label: "Email",           group: "Identity" },
  { key: "username",     label: "Username",        group: "Identity" },
  { key: "phone",        label: "Phone",           group: "Identity" },
  // Location
  { key: "streetAddress",label: "Street Address",  group: "Location" },
  { key: "city",         label: "City",            group: "Location" },
  { key: "country",      label: "Country",         group: "Location" },
  // Work
  { key: "company",      label: "Company",         group: "Work" },
  { key: "jobTitle",     label: "Job Title",       group: "Work" },
  // Other
  { key: "uuid",         label: "UUID",            group: "Other" },
  { key: "date",         label: "Date",            group: "Other" },
  { key: "number",       label: "Number (1–1000)", group: "Other" },
  { key: "boolean",      label: "Boolean",         group: "Other" },
  { key: "url",          label: "URL",             group: "Other" },
  { key: "hexColor",     label: "Hex Color",       group: "Other" },
  { key: "lorem",        label: "Lorem Sentence",  group: "Other" },
];

const GROUPS = ["Identity", "Location", "Work", "Other"];

const DEFAULT_FIELDS = ["fullName", "email", "username", "uuid"];

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
}

export function MockDataGenerator() {
  const [selected, setSelected] = useState<string[]>(DEFAULT_FIELDS);
  const [count, setCount] = useState(10);
  const [format, setFormat] = useState<Format>("json");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const toggle = useCallback((key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const generate = useCallback(async (fields: string[], rows: number, fmt: Format) => {
    if (fields.length === 0) {
      setError("Select at least one field to generate.");
      return;
    }
    setLoading(true);
    setError(undefined);
    try {
      const { faker } = await import("@faker-js/faker");
      const data = Array.from({ length: rows }, () => {
        const row: Record<string, unknown> = {};
        for (const key of fields) {
          switch (key) {
            case "fullName":      row.fullName      = faker.person.fullName(); break;
            case "email":         row.email         = faker.internet.email(); break;
            case "username":      row.username      = faker.internet.username(); break;
            case "phone":         row.phone         = faker.phone.number(); break;
            case "streetAddress": row.streetAddress = faker.location.streetAddress(); break;
            case "city":          row.city          = faker.location.city(); break;
            case "country":       row.country       = faker.location.country(); break;
            case "company":       row.company       = faker.company.name(); break;
            case "jobTitle":      row.jobTitle      = faker.person.jobTitle(); break;
            case "uuid":          row.uuid          = faker.string.uuid(); break;
            case "date":          row.date          = faker.date.past().toISOString().split("T")[0]; break;
            case "number":        row.number        = faker.number.int({ min: 1, max: 1000 }); break;
            case "boolean":       row.boolean       = faker.datatype.boolean(); break;
            case "url":           row.url           = faker.internet.url(); break;
            case "hexColor":      row.hexColor      = faker.color.rgb({ format: "hex" }); break;
            case "lorem":         row.lorem         = faker.lorem.sentence(); break;
          }
        }
        return row;
      });
      setOutput(fmt === "json" ? JSON.stringify(data, null, 2) : toCSV(data));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGenerate = useCallback(() => {
    generate(selected, count, format);
  }, [generate, selected, count, format]);

  const handleLoadSample = useCallback(() => {
    const sampleFields = ["fullName", "email", "username", "uuid"];
    setSelected(sampleFields);
    setCount(5);
    setFormat("json");
    generate(sampleFields, 5, "json");
  }, [generate]);

  const handleClear = useCallback(() => {
    setOutput("");
    setError(undefined);
  }, []);

  return (
    <ToolShell
      tool={tool}
      input=""
      output={output}
      onInputChange={() => {}}
      error={error}
      hideFileActions
      hideInputPane
      onClear={handleClear}
      outputLabel={format === "json" ? "JSON Output" : "CSV Output"}
      outputPlaceholder="Configure your schema above and click Generate..."
      outputContent={
        output ? (
          format === "json" ? (
            <HighlightedOutput code={output} lang="json" />
          ) : (
            <pre className="mono w-full min-h-[320px] p-4 text-sm text-[var(--text-primary)] whitespace-pre-wrap break-words leading-relaxed overflow-auto">
              {output}
            </pre>
          )
        ) : undefined
      }
      extraActions={
        <>
          <button
            onClick={handleLoadSample}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Load sample
          </button>
          <button
            onClick={() => setOutput("")}
            disabled={!output}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#ef4444]/40 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 hover:border-[#ef4444]/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Clear
          </button>
        </>
      }
      options={
        <div className="flex flex-col gap-4 w-full">
          {/* Field selection */}
          <div className="flex flex-col gap-3">
            {GROUPS.map((group) => (
              <div key={group} className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] w-16 shrink-0">
                  {group}
                </span>
                {FIELD_DEFS.filter((f) => f.group === group).map((field) => (
                  <label
                    key={field.key}
                    className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] cursor-pointer select-none hover:text-[var(--text-primary)] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(field.key)}
                      onChange={() => toggle(field.key)}
                      className="accent-[#6366f1]"
                    />
                    {field.label}
                  </label>
                ))}
              </div>
            ))}
          </div>

          {/* Controls row */}
          <div className="flex flex-wrap items-center gap-4 pt-1 border-t border-[var(--border)]">
            <label className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
              Rows
              <input
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value))))}
                className="w-16 bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--text-primary)]"
              />
            </label>

            <div className="flex rounded-lg border border-[var(--border)] overflow-hidden text-xs">
              {(["json", "csv"] as Format[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`px-3 py-1.5 uppercase transition-colors ${
                    format === f
                      ? "bg-[#6366f1]/15 text-[#6366f1]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || selected.length === 0}
              className="px-4 py-1.5 rounded-lg text-xs font-medium border border-[#6366f1]/40 bg-[#6366f1]/15 text-[#6366f1] hover:bg-[#6366f1]/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Generating…" : "Generate"}
            </button>
          </div>
        </div>
      }
    />
  );
}
