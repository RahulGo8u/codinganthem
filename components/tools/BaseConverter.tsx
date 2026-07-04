"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("base-converter")!;

type Base = 2 | 8 | 10 | 16;
const BASES: { value: Base; label: string; prefix: string }[] = [
  { value: 2,  label: "Binary (2)",      prefix: "0b" },
  { value: 8,  label: "Octal (8)",       prefix: "0o" },
  { value: 10, label: "Decimal (10)",    prefix: "" },
  { value: 16, label: "Hex (16)",        prefix: "0x" },
];

const SAMPLES: Record<Base, string> = {
  2: "11111111",
  8: "377",
  10: "255",
  16: "FF",
};

const VALID: Record<Base, RegExp> = {
  2:  /^[01]+$/,
  8:  /^[0-7]+$/,
  10: /^[0-9]+$/,
  16: /^[0-9a-fA-F]+$/,
};

export function BaseConverter() {
  const [input, setInput] = useState("");
  const [fromBase, setFromBase] = useState<Base>(10);

  const { output, error } = useMemo(() => {
    const val = input.trim();
    if (!val) return { output: "", error: undefined };

    if (!VALID[fromBase].test(val)) {
      return { output: "", error: `"${val}" contains digits invalid for base ${fromBase}.` };
    }

    const decimal = parseInt(val, fromBase);
    if (!isFinite(decimal)) return { output: "", error: "Number is too large to convert." };

    const lines = BASES.map(({ value, label, prefix }) => {
      const converted = decimal.toString(value).toUpperCase();
      return `${label.padEnd(16)} ${prefix}${converted}`;
    });

    return { output: lines.join("\n"), error: undefined };
  }, [input, fromBase]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      error={error}
      hideFileActions
      showClear
      inputLabel="Number"
      outputLabel="All bases"
      inputPlaceholder="Enter a number..."
      outputPlaceholder="Conversions will appear here..."
      extraActions={
        <button
          onClick={() => setInput(SAMPLES[fromBase])}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
      }
      options={
        <label className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
          From base
          <select
            value={fromBase}
            onChange={(e) => setFromBase(Number(e.target.value) as Base)}
            className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--text-primary)]"
          >
            {BASES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      }
    />
  );
}
