"use client";

import { useRef } from "react";

interface HighlightedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  highlight: (code: string) => React.ReactNode[];
  placeholder?: string;
}

/**
 * A plain <textarea> with transparent text (caret only) stacked exactly on
 * top of a syntax-highlighted <pre>, scroll-synced on every keystroke.
 * Standard technique for adding highlighting to an editable code input
 * without pulling in a full code-editor dependency.
 */
export function HighlightedTextarea({ value, onChange, highlight, placeholder }: HighlightedTextareaProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const syncScroll = () => {
    if (preRef.current && taRef.current) {
      preRef.current.scrollTop = taRef.current.scrollTop;
      preRef.current.scrollLeft = taRef.current.scrollLeft;
    }
  };

  return (
    <div className="relative w-full h-full min-h-[320px]">
      <pre
        ref={preRef}
        aria-hidden="true"
        className="mono absolute inset-0 w-full h-full m-0 p-4 text-sm whitespace-pre-wrap break-words leading-relaxed overflow-auto pointer-events-none"
      >
        {value.length > 0 ? highlight(value) : null}
        {"\n"}
      </pre>
      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        placeholder={placeholder}
        spellCheck={false}
        className="mono absolute inset-0 w-full h-full p-4 text-sm resize-none overflow-auto bg-transparent text-transparent caret-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none leading-relaxed whitespace-pre-wrap break-words"
      />
    </div>
  );
}
