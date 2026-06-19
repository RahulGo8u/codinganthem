"use client";

import { useState, useMemo } from "react";
import { format, type SqlLanguage } from "sql-formatter";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("sql-formatter")!;

const DIALECTS: { value: SqlLanguage; label: string }[] = [
  { value: "sql",        label: "SQL"        },
  { value: "mysql",      label: "MySQL"      },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "sqlite",     label: "SQLite"     },
  { value: "mariadb",    label: "MariaDB"    },
  { value: "plsql",      label: "PL/SQL"     },
];

const SAMPLE = `SELECT u.id,u.name,u.email,o.total,o.created_at FROM users u INNER JOIN orders o ON u.id=o.user_id WHERE u.active=1 AND o.total>100 ORDER BY o.created_at DESC LIMIT 50;`;

export function SqlFormatter() {
  const [input, setInput] = useState("");
  const [dialect, setDialect] = useState<SqlLanguage>("sql");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: undefined };
    try {
      const result = format(input, { language: dialect, tabWidth: 2, keywordCase: "upper" });
      return { output: result, error: undefined };
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, dialect]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      error={error}
      inputLabel="SQL"
      outputLabel="Formatted SQL"
      inputPlaceholder="Paste your SQL query here..."
      outputPlaceholder="Formatted SQL will appear here..."
      extraActions={
        <button
          onClick={() => setInput(SAMPLE)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
      }
      options={
        <label className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
          Dialect
          <select
            value={dialect}
            onChange={(e) => setDialect(e.target.value as SqlLanguage)}
            className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--text-primary)]"
          >
            {DIALECTS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      }
    />
  );
}
