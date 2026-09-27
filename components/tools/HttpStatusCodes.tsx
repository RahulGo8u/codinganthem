"use client";

import { useMemo, useState } from "react";
import { ToolShell } from "@/components/ToolShell";
import { CopyChip } from "@/components/CopyChip";
import { SegmentedControl } from "@/components/SegmentedControl";
import { getToolBySlug } from "@/lib/tools";
import { filterHttpStatuses } from "@/lib/httpStatus";

const tool = getToolBySlug("http-status-codes")!;

export function HttpStatusCodes() {
  const [query, setQuery] = useState("");
  const [className, setClassName] = useState("all");
  const results = useMemo(() => filterHttpStatuses(query, className), [query, className]);
  const output = results.map((status) => `${status.code} ${status.name}`).join("\n");

  return (
    <ToolShell
      tool={tool}
      input={query || "search"}
      output={output}
      onInputChange={setQuery}
      hideInputPane
      hideFileActions
      outputLabel="HTTP status codes"
      downloadFileName="http-status-codes.txt"
      outputContent={
        <div className="flex flex-col gap-4">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by code, name, or meaning"
            aria-label="Search HTTP status codes"
            className="h-10 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-primary)]"
          />
          <SegmentedControl
            label="Status class"
            value={className}
            onChange={setClassName}
            compact
            segments={[
              { value: "all", label: "All" },
              { value: "1xx", label: "1xx" },
              { value: "2xx", label: "2xx" },
              { value: "3xx", label: "3xx" },
              { value: "4xx", label: "4xx" },
              { value: "5xx", label: "5xx" },
            ]}
          />
          <p className="text-xs text-[var(--text-muted)]">{results.length} codes</p>
          <div className="flex flex-col gap-2">
            {results.map((status) => (
              <article key={status.code} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                      <span className="mono mr-2 text-[#6366f1]">{status.code}</span>
                      {status.name}
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">{status.summary}</p>
                  </div>
                  <CopyChip value={String(status.code)} label={`${status.code} ${status.name}`} />
                </div>
              </article>
            ))}
            {results.length === 0 && (
              <p role="status" className="text-sm text-[var(--text-muted)]">No status codes match that search.</p>
            )}
          </div>
        </div>
      }
    />
  );
}
