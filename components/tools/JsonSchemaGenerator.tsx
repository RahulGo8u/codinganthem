"use client";

import { useMemo, useState } from "react";
import { ToolShell } from "@/components/ToolShell";
import { SegmentedControl } from "@/components/SegmentedControl";
import { getToolBySlug } from "@/lib/tools";
import { HighlightedOutput } from "@/lib/highlight";
import {
  SCHEMA_SAMPLE,
  buildSchemaArtifact,
  friendlyJsonError,
  type SchemaFormat,
} from "@/lib/jsonSchema";

const tool = getToolBySlug("json-schema-generator")!;

const FORMATS: { value: SchemaFormat; label: string }[] = [
  { value: "json-schema", label: "JSON Schema" },
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "gemini", label: "Gemini" },
  { value: "typescript", label: "TypeScript" },
  { value: "zod", label: "Zod" },
  { value: "python", label: "Python" },
];

export function JsonSchemaGenerator() {
  const [input, setInput] = useState("");
  const [format, setFormat] = useState<SchemaFormat>("json-schema");
  const [title, setTitle] = useState("Root");
  const [functionName, setFunctionName] = useState("submit_data");
  const [description, setDescription] = useState("");
  const [detectFormats, setDetectFormats] = useState(true);
  const [requireProperties, setRequireProperties] = useState(true);
  const [rejectExtraProperties, setRejectExtraProperties] = useState(true);

  const { output, filename, error } = useMemo(() => {
    if (!input.trim()) return { output: "", filename: "schema.json", error: undefined };
    try {
      const parsed = JSON.parse(input);
      const artifact = buildSchemaArtifact(parsed, format, {
        title,
        description,
        functionName,
        detectFormats,
        requireProperties,
        rejectExtraProperties,
      });
      return { output: artifact.code, filename: artifact.filename, error: undefined };
    } catch (err) {
      return { output: "", filename: "schema.json", error: friendlyJsonError(err, input) };
    }
  }, [input, format, title, description, functionName, detectFormats, requireProperties, rejectExtraProperties]);

  const highlightLang = format === "typescript" || format === "zod" ? "js" : "json";

  function loadSample() {
    setInput(SCHEMA_SAMPLE);
    setTitle("User");
    setFunctionName("lookup_user");
    setDescription("Look up a user from the fields in this object.");
  }

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      error={error}
      downloadFileName={filename}
      downloadMimeType={filename.endsWith(".json") ? "application/json" : "text/plain"}
      inputLabel="Sample JSON"
      outputLabel={FORMATS.find((item) => item.value === format)?.label ?? "Schema"}
      inputPlaceholder='Paste a JSON object, for example { "email": "ada@example.com" }'
      outputPlaceholder="JSON Schema, a tool definition, or generated types will appear here..."
      outputContent={
        output ? (
          format === "python" ? (
            <pre className="mono w-full min-h-[320px] whitespace-pre-wrap break-words p-4 text-sm leading-relaxed text-[var(--text-primary)]">
              {output}
            </pre>
          ) : (
            <HighlightedOutput code={output} lang={highlightLang} />
          )
        ) : (
          <p className="p-4 text-sm text-[var(--text-muted)]">
            JSON Schema, a tool definition, or generated types will appear here...
          </p>
        )
      }
      extraActions={
        <button
          type="button"
          onClick={loadSample}
          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
        >
          Load sample
        </button>
      }
      options={
        <div className="flex w-full flex-col gap-3">
          <SegmentedControl
            label="Output format"
            value={format}
            onChange={setFormat}
            compact
            segments={FORMATS}
          />
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs text-[var(--text-muted)]">
              Schema name
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mono h-8 w-32 rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-2 text-xs text-[var(--text-primary)]"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-[var(--text-muted)]">
              Function name
              <input
                type="text"
                value={functionName}
                onChange={(event) => setFunctionName(event.target.value)}
                className="mono h-8 w-40 rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-2 text-xs text-[var(--text-primary)]"
                spellCheck={false}
              />
            </label>
            <label className="flex min-w-[16rem] flex-1 flex-col gap-1 text-xs text-[var(--text-muted)]">
              Description
              <input
                type="text"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What this tool or schema is for"
                className="h-8 w-full rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-2 text-xs text-[var(--text-primary)]"
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <CheckOption checked={detectFormats} onChange={setDetectFormats} label="Detect emails, UUIDs, URLs, and dates" />
            <CheckOption checked={requireProperties} onChange={setRequireProperties} label="Require observed properties" />
            <CheckOption checked={rejectExtraProperties} onChange={setRejectExtraProperties} label="Disallow extra properties" />
          </div>
          {format === "openai" && (
            <p className="text-xs text-[var(--text-muted)]">
              OpenAI strict mode always requires every property and rejects extra fields, including nested objects.
            </p>
          )}
        </div>
      }
    />
  );
}

function CheckOption({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-1.5 text-xs text-[var(--text-muted)]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="accent-[#6366f1]"
      />
      {label}
    </label>
  );
}
