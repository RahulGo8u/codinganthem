"use client";

import {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { getToolBySlug } from "@/lib/tools";
import { ToolPageHeader } from "@/components/ToolPageHeader";
import { isTypingTarget, wrapIndex } from "@/lib/diffHunks";

const tool = getToolBySlug("regex-tester")!;

const SAMPLE_PATTERN = "\\b\\w+@\\w+\\.\\w+\\b";
const SAMPLE_TEXT = "Contact alice@example.com or bob@test.org for details.";

export function RegexTester() {
  const [pattern, setPattern] = useState(SAMPLE_PATTERN);
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState(SAMPLE_TEXT);
  const [activeMatch, setActiveMatch] = useState(0);
  const markRefs = useRef<Map<number, HTMLElement>>(new Map());

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
      return { matches, error: undefined as string | undefined };
    } catch (e) {
      return { matches: [] as RegExpExecArray[], error: (e as Error).message };
    }
  }, [pattern, flags, testString]);

  const matchCount = result && !result.error ? result.matches.length : 0;
  const displayActive = matchCount === 0 ? 0 : wrapIndex(activeMatch, matchCount);

  const scrollToMatch = useCallback(
    (index: number) => {
      if (matchCount === 0) return;
      const wrapped = wrapIndex(index, matchCount);
      setActiveMatch(wrapped);
      requestAnimationFrame(() => {
        markRefs.current.get(wrapped)?.scrollIntoView({
          block: "center",
          behavior: "smooth",
        });
      });
    },
    [matchCount]
  );

  const goPrev = useCallback(
    () => scrollToMatch(displayActive - 1),
    [scrollToMatch, displayActive]
  );
  const goNext = useCallback(
    () => scrollToMatch(displayActive + 1),
    [scrollToMatch, displayActive]
  );

  useEffect(() => {
    if (matchCount === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.key === "]") {
        e.preventDefault();
        goNext();
      } else if (e.key === "[") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [matchCount, goNext, goPrev]);

  const toggleFlag = (f: string) =>
    setFlags((prev) => (prev.includes(f) ? prev.replace(f, "") : prev + f));

  const loadSample = () => {
    setPattern(SAMPLE_PATTERN);
    setFlags("g");
    setTestString(SAMPLE_TEXT);
    setActiveMatch(0);
  };

  const highlightedNodes = useMemo(() => {
    if (!result || result.error || !testString) return null;
    const matches = [...result.matches].sort((a, b) => a.index - b.index);
    if (matches.length === 0) return null;
    const nodes: ReactNode[] = [];
    let last = 0;
    matches.forEach((m, i) => {
      const start = m.index;
      const end = m.index + m[0].length;
      if (start > last) {
        nodes.push(<span key={`t${i}`}>{testString.slice(last, start)}</span>);
      }
      const isActive = i === displayActive;
      nodes.push(
        <mark
          key={`m${i}`}
          data-match-index={i}
          className={`rounded px-0.5 ${
            isActive
              ? "bg-[#6366f1]/55 text-[var(--text-primary)] ring-2 ring-[#6366f1]/60"
              : "bg-[#6366f1]/30 text-[var(--text-primary)]"
          }`}
        >
          {testString.slice(start, end) || "∅"}
        </mark>
      );
      last = Math.max(end, last);
    });
    if (last < testString.length) {
      nodes.push(<span key="tail">{testString.slice(last)}</span>);
    }
    return nodes;
  }, [result, testString, displayActive]);

  // Bind mark elements after paint so scrollIntoView works without reading refs in render.
  useEffect(() => {
    markRefs.current.clear();
    const root = document.querySelector("[data-regex-matches]");
    if (!root) return;
    root.querySelectorAll<HTMLElement>("[data-match-index]").forEach((el) => {
      const idx = Number(el.dataset.matchIndex);
      if (!Number.isNaN(idx)) markRefs.current.set(idx, el);
    });
  }, [highlightedNodes]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
      <ToolPageHeader
        tool={tool}
        trailing={
          <button
            type="button"
            onClick={loadSample}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Load sample
          </button>
        }
      />

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
          Regular Expression
        </label>
        <div
          className={`flex items-center rounded-lg border ${result?.error ? "border-[#ef4444]" : "border-[var(--border)]"} bg-[var(--bg-surface)] overflow-hidden`}
        >
          <span className="mono px-3 text-[var(--text-muted)] text-lg select-none">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => {
              setPattern(e.target.value);
              setActiveMatch(0);
            }}
            placeholder="Enter regex pattern..."
            spellCheck={false}
            className="mono flex-1 h-11 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none"
          />
          <span className="mono px-1 text-[var(--text-muted)] text-lg select-none">/</span>
          <input
            type="text"
            value={flags}
            onChange={(e) => {
              setFlags(e.target.value.replace(/[^gimsuy]/g, ""));
              setActiveMatch(0);
            }}
            placeholder="flags"
            spellCheck={false}
            className="mono w-16 h-11 px-2 bg-transparent text-[#6366f1] text-sm focus:outline-none"
          />
        </div>
        {result?.error && <p className="text-xs text-[#ef4444]">{result.error}</p>}

        <div className="flex flex-wrap gap-2">
          {[
            { f: "g", label: "global (g)" },
            { f: "i", label: "case insensitive (i)" },
            { f: "m", label: "multiline (m)" },
            { f: "s", label: "dot all (s)" },
          ].map(({ f, label }) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                toggleFlag(f);
                setActiveMatch(0);
              }}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            Test String
          </label>
          <textarea
            value={testString}
            onChange={(e) => {
              setTestString(e.target.value);
              setActiveMatch(0);
            }}
            placeholder="Enter text to test the regex against..."
            spellCheck={false}
            className="mono min-h-[280px] max-h-[70vh] p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none leading-relaxed overflow-auto"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div />
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider text-center">
              Matches
            </label>
            <div className="flex justify-end items-center gap-1.5">
              {matchCount > 0 ? (
                <div className="flex items-center gap-1.5" role="group" aria-label="Navigate matches">
                  <button
                    type="button"
                    onClick={goPrev}
                    className="px-2.5 py-1 rounded-md text-xs font-medium border border-[#6366f1]/45 bg-[#6366f1]/10 text-[var(--accent-text)] hover:bg-[#6366f1]/20 transition-colors"
                    aria-label="Previous match"
                  >
                    ↑ Prev
                  </button>
                  <span className="text-xs text-[var(--text-muted)] mono tabular-nums min-w-[4.5rem] text-center">
                    {displayActive + 1} of {matchCount}
                  </span>
                  <button
                    type="button"
                    onClick={goNext}
                    className="px-2.5 py-1 rounded-md text-xs font-medium border border-[#22c55e]/45 bg-[#22c55e]/10 text-[#22c55e] hover:bg-[#22c55e]/20 transition-colors"
                    aria-label="Next match"
                  >
                    ↓ Next
                  </button>
                </div>
              ) : (
                result &&
                !result.error && (
                  <span className="text-xs text-[var(--text-muted)]">0 matches</span>
                )
              )}
            </div>
          </div>
          <div
            data-regex-matches
            className="mono min-h-[280px] max-h-[70vh] p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] overflow-auto text-sm leading-relaxed whitespace-pre-wrap break-words text-[var(--text-primary)]"
          >
            {highlightedNodes ? (
              highlightedNodes
            ) : (
              <span className="text-[var(--text-muted)]">
                {pattern && testString ? "No matches found." : "Enter a pattern and test string..."}
              </span>
            )}
          </div>
          {matchCount > 0 && (
            <p className="text-[10px] text-[var(--text-muted)]">
              Tip: press <span className="mono">[</span> / <span className="mono">]</span> to jump
              between matches
            </p>
          )}
        </div>
      </div>

      {result && !result.error && result.matches.some((m) => m.length > 1) && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            Capture groups
          </label>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-4 mono text-xs text-[var(--text-muted)] flex flex-col gap-2 overflow-auto max-h-[320px]">
            {result.matches.map((m, i) => (
              <div
                key={i}
                className={
                  i === displayActive
                    ? "rounded px-1 -mx-1 bg-[#6366f1]/10 text-[var(--text-primary)]"
                    : undefined
                }
              >
                <span className="text-[var(--text-primary)]">Match {i + 1}:</span> &quot;{m[0]}&quot;{" "}
                at index {m.index}
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
