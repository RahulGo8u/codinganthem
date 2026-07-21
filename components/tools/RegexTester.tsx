"use client";

import { useState, useMemo } from "react";
import { getToolBySlug } from "@/lib/tools";
import { Breadcrumb } from "@/components/Breadcrumb";

const tool = getToolBySlug("regex-tester")!;

const SAMPLE_PATTERN = "\\b\\w+@\\w+\\.\\w+\\b";
const SAMPLE_TEXT = "Contact alice@example.com or bob@test.org for details.";

function renderHighlighted(text: string, matches: RegExpExecArray[]): React.ReactNode[] {
  if (matches.length === 0) return [text];
  const nodes: React.ReactNode[] = [];
  let last = 0;
  const sorted = [...matches].sort((a, b) => a.index - b.index);
  sorted.forEach((m, i) => {
    const start = m.index;
    const end = m.index + m[0].length;
    if (start > last) nodes.push(<span key={`t${i}`}>{text.slice(last, start)}</span>);
    nodes.push(
      <mark key={`m${i}`} className="bg-[#6366f1]/30 text-[var(--text-primary)] rounded px-0.5">
        {text.slice(start, end) || "∅"}
      </mark>
    );
    last = Math.max(end, last);
  });
  if (last < text.length) nodes.push(<span key="tail">{text.slice(last)}</span>);
  return nodes;
}

export function RegexTester() {
  const [pattern, setPattern] = useState(SAMPLE_PATTERN);
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState(SAMPLE_TEXT);

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

  const toggleFlag = (f: string) =>
    setFlags((prev) => (prev.includes(f) ? prev.replace(f, "") : prev + f));

  const loadSample = () => {
    setPattern(SAMPLE_PATTERN);
    setFlags("g");
    setTestString(SAMPLE_TEXT);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <Breadcrumb current={tool.name} />
        <button
          onClick={loadSample}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
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
        {result?.error && <p className="text-xs text-[#ef4444]">{result.error}</p>}

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

      {/* Test string + highlighted result */}
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
          <div className="mono min-h-[280px] p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] overflow-auto text-sm leading-relaxed whitespace-pre-wrap break-words text-[var(--text-primary)]">
            {result && !result.error && testString ? (
              renderHighlighted(testString, result.matches)
            ) : (
              <span className="text-[var(--text-muted)]">
                {pattern && testString ? "No matches found." : "Enter a pattern and test string..."}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Capture groups (only when matches have groups) */}
      {result && !result.error && result.matches.some((m) => m.length > 1) && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            Capture groups
          </label>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-4 mono text-xs text-[var(--text-muted)] flex flex-col gap-2 overflow-auto">
            {result.matches.map((m, i) => (
              <div key={i}>
                <span className="text-[var(--text-primary)]">Match {i + 1}:</span> &quot;{m[0]}&quot; at index {m.index}
                {m.slice(1).map((g, gi) => (
                  <div key={gi} className="pl-4">
                    Group {gi + 1}: {g ?? "(no match)"}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
