"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("regex-tester")!;

export function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState("");

  const result = useMemo(() => {
    if (!pattern || !testString) return null;
    try {
      const re = new RegExp(pattern, flags);
      const matches: RegExpExecArray[] = [];
      if (flags.includes("g")) {
        let m: RegExpExecArray | null;
        let safety = 0;
        while ((m = re.exec(testString)) !== null && safety++ < 1000) {
          matches.push(m);
          if (m.index === re.lastIndex) re.lastIndex++;
        }
      } else {
        const m = re.exec(testString);
        if (m) matches.push(m);
      }
      return { matches, error: undefined };
    } catch (e) {
      return { matches: [], error: (e as Error).message };
    }
  }, [pattern, flags, testString]);

  const output = result
    ? result.error
      ? ""
      : result.matches.length === 0
      ? "No matches found."
      : result.matches
          .map((m, i) => {
            const groups = m.slice(1).map((g, gi) => `  Group ${gi + 1}: ${g ?? "(no match)"}`);
            return [`Match ${i + 1}: "${m[0]}" at index ${m.index}`, ...groups].join("\n");
          })
          .join("\n\n")
    : "";

  const toggleFlag = (f: string) =>
    setFlags((prev) => (prev.includes(f) ? prev.replace(f, "") : prev + f));

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <a href="/" className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          All tools
        </a>
        <span className="text-[var(--border)]">/</span>
        <h1 className="text-sm font-medium text-[var(--text-primary)]">{tool.name}</h1>
      </div>

      {/* Pattern input */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
          Regular Expression
        </label>
        <div className={`flex items-center rounded-lg border ${result?.error ? "border-[#ef4444]" : "border-[var(--border)]"} bg-[var(--bg-surface)] overflow-hidden`}>
          <span className="mono px-3 text-[var(--text-muted)] text-lg select-none">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern..."
            spellCheck={false}
            className="mono flex-1 h-11 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none"
          />
          <span className="mono px-1 text-[var(--text-muted)] text-lg select-none">/</span>
          <input
            type="text"
            value={flags}
            onChange={(e) => setFlags(e.target.value.replace(/[^gimsuy]/g, ""))}
            placeholder="flags"
            spellCheck={false}
            className="mono w-16 h-11 px-2 bg-transparent text-[#6366f1] text-sm focus:outline-none"
          />
        </div>
        {result?.error && (
          <p className="text-xs text-[#ef4444]">{result.error}</p>
        )}

        {/* Flag toggles */}
        <div className="flex flex-wrap gap-2">
          {[
            { f: "g", label: "global (g)" },
            { f: "i", label: "case insensitive (i)" },
            { f: "m", label: "multiline (m)" },
            { f: "s", label: "dot all (s)" },
          ].map(({ f, label }) => (
            <button
              key={f}
              onClick={() => toggleFlag(f)}
              className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                flags.includes(f)
                  ? "bg-[#6366f1]/15 text-[#6366f1] border-[#6366f1]/40"
                  : "text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-primary)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Test string + results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            Test String
          </label>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter text to test the regex against..."
            spellCheck={false}
            className="mono min-h-[280px] p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none leading-relaxed"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
              Matches
            </label>
            {result && !result.error && (
              <span className="text-xs text-[var(--text-muted)]">
                {result.matches.length} match{result.matches.length !== 1 ? "es" : ""}
              </span>
            )}
          </div>
          <div className="min-h-[280px] p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] overflow-auto">
            {output ? (
              <pre className="mono text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">{output}</pre>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">
                {pattern && testString ? "No matches found." : "Enter a pattern and test string..."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
