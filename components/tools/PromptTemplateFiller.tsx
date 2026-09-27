"use client";

import { useState, useMemo, useCallback } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("prompt-template-filler")!;

const SAMPLE = "Write a {{tone}} email to {{recipient}} about {{topic}}.";

const VARIABLE_PATTERN = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

function extractVariables(template: string): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  const re = new RegExp(VARIABLE_PATTERN);
  let match: RegExpExecArray | null;
  while ((match = re.exec(template)) !== null) {
    const name = match[1];
    if (!seen.has(name)) {
      seen.add(name);
      names.push(name);
    }
  }
  return names;
}

export function PromptTemplateFiller() {
  const [input, setInput] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});

  const variables = useMemo(() => extractVariables(input), [input]);

  const unresolved = useMemo(
    () => variables.filter((name) => !values[name]?.trim()),
    [variables, values]
  );

  const output = useMemo(() => {
    if (!input) return "";
    return input.replace(VARIABLE_PATTERN, (fullMatch, name: string) => {
      const value = values[name];
      return value ? value : fullMatch;
    });
  }, [input, values]);

  const handleValueChange = useCallback((name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleClear = useCallback(() => {
    setValues({});
  }, []);

  const handleOpenInChatGPT = useCallback(() => {
    if (!output) return;
    window.open(`https://chatgpt.com/?q=${encodeURIComponent(output)}`, "_blank", "noopener,noreferrer");
  }, [output]);

  const highlightedParts = useMemo(() => {
    if (!output) return null;
    const parts: { text: string; unresolved: boolean }[] = [];
    const re = new RegExp(VARIABLE_PATTERN);
    let last = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(output)) !== null) {
      if (match.index > last) {
        parts.push({ text: output.slice(last, match.index), unresolved: false });
      }
      parts.push({ text: match[0], unresolved: true });
      last = match.index + match[0].length;
    }
    if (last < output.length) {
      parts.push({ text: output.slice(last), unresolved: false });
    }
    return parts;
  }, [output]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      onClear={handleClear}
      inputLabel="Template"
      outputLabel="Resolved prompt"
      inputPlaceholder={`Paste a prompt template with {{variables}}...\n\n${SAMPLE}`}
      outputPlaceholder="Fill in the detected variables above to see the resolved prompt..."
      showClear
      options={
        variables.length > 0 ? (
          <div className="flex flex-col gap-2 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
              {variables.map((name) => {
                const empty = !values[name]?.trim();
                return (
                  <label key={name} className="flex flex-col gap-1 text-[var(--text-muted)] text-xs min-w-0">
                    <span className="mono">{`{{${name}}}`}</span>
                    <input
                      type="text"
                      value={values[name] ?? ""}
                      onChange={(e) => handleValueChange(name, e.target.value)}
                      placeholder="value..."
                      aria-invalid={empty}
                      className={`w-full bg-[var(--bg-base)] border-2 rounded-md px-2.5 py-1.5 text-xs text-[var(--text-primary)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#6366f1]/40 focus:border-[#6366f1] transition-all ${
                        empty
                          ? "border-[#f59e0b]/50"
                          : "border-[var(--text-muted)]/40"
                      }`}
                    />
                  </label>
                );
              })}
            </div>
            {unresolved.length > 0 && (
              <p className="text-[11px] text-[#f59e0b]" role="status">
                {unresolved.length} unresolved variable{unresolved.length === 1 ? "" : "s"} highlighted in the output
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-[var(--text-muted)]">
            Paste a template with <span className="mono">{"{{variables}}"}</span> above — fillable fields will appear here automatically.
          </p>
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
      extraRightActions={
        <button
          type="button"
          onClick={handleOpenInChatGPT}
          disabled={!output}
          title="Opens ChatGPT in a new tab with the resolved prompt pre-filled — nothing is sent automatically"
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#6366f1]/40 bg-[#6366f1]/10 text-[#6366f1] hover:bg-[#6366f1]/20 hover:border-[#6366f1]/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Open in ChatGPT ↗
        </button>
      }
      outputContent={
        output ? (
          <pre className="mono w-full min-h-[320px] p-4 text-sm text-[var(--text-primary)] whitespace-pre-wrap break-words leading-relaxed">
            {highlightedParts?.map((part, i) =>
              part.unresolved ? (
                <mark
                  key={i}
                  className="rounded px-0.5 bg-[#f59e0b]/25 text-[#f59e0b] not-italic"
                >
                  {part.text}
                </mark>
              ) : (
                <span key={i}>{part.text}</span>
              )
            )}
          </pre>
        ) : undefined
      }
    />
  );
}
