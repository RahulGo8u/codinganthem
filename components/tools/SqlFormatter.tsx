"use client";

import { useState, useMemo } from "react";
import { format, type SqlLanguage } from "sql-formatter";
import { ToolShell } from "@/components/ToolShell";
import { SegmentedControl } from "@/components/SegmentedControl";
import { getToolBySlug } from "@/lib/tools";
import { HighlightedOutput } from "@/lib/highlight";

const tool = getToolBySlug("sql-formatter")!;

const DIALECTS: { value: SqlLanguage; label: string }[] = [
  { value: "sql", label: "SQL" },
  { value: "mysql", label: "MySQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "sqlite", label: "SQLite" },
  { value: "mariadb", label: "MariaDB" },
  { value: "plsql", label: "PL/SQL" },
];

const SAMPLE = `SELECT u.id,u.name,u.email,o.total,o.created_at FROM users u INNER JOIN orders o ON u.id=o.user_id WHERE u.active=1 AND o.total>100 ORDER BY o.created_at DESC LIMIT 50;`;

export function SqlFormatter() {
  const [input, setInput] = useState("");
  const [dialect, setDialect] = useState<SqlLanguage>("sql");
  const [mode, setMode] = useState<"beautify" | "minify">("beautify");
  const [keywordCase, setKeywordCase] = useState<"upper" | "lower">("upper");
  const [indent, setIndent] = useState<"2" | "4">("2");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: undefined };
    try {
      const formatted = format(input, {
        language: dialect,
        tabWidth: Number(indent),
        keywordCase,
      });
      const result =
        mode === "minify"
          ? formatted.replace(/\s+/g, " ").trim()
          : formatted;
      return { output: result, error: undefined };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not format SQL.";
      return {
        output: "",
        error: msg.includes("Parse error") || msg.includes("syntax")
          ? msg
          : `Could not format SQL: ${msg}`,
      };
    }
  }, [input, dialect, mode, keywordCase, indent]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      error={error}
      downloadFileName="formatted.sql"
      downloadMimeType="application/sql"
      inputLabel="SQL"
      outputLabel="Formatted SQL"
      inputPlaceholder="Paste your SQL query here..."
      outputPlaceholder="Formatted SQL will appear here..."
      outputContent={
        output ? (
          <HighlightedOutput code={output} lang="sql" />
        ) : (
          <p className="p-4 text-[var(--text-muted)] text-sm">Formatted SQL will appear here...</p>
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
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
            Dialect
            <select
              value={dialect}
              onChange={(e) => setDialect(e.target.value as SqlLanguage)}
              aria-label="SQL dialect"
              className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--text-primary)]"
            >
              {DIALECTS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <SegmentedControl
            label="Format mode"
            value={mode}
            onChange={setMode}
            compact
            segments={[
              { value: "beautify", label: "Beautify" },
              { value: "minify", label: "Minify" },
            ]}
          />
          <SegmentedControl
            label="Keyword case"
            value={keywordCase}
            onChange={setKeywordCase}
            compact
            segments={[
              { value: "upper", label: "UPPER" },
              { value: "lower", label: "lower" },
            ]}
          />
          <SegmentedControl
            label="Indent size"
            value={indent}
            onChange={setIndent}
            compact
            segments={[
              { value: "2", label: "2 spaces" },
              { value: "4", label: "4 spaces" },
            ]}
          />
        </div>
      }
    />
  );
}
