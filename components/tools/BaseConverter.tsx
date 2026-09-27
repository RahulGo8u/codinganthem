"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { SegmentedControl } from "@/components/SegmentedControl";
import { CopyChip } from "@/components/CopyChip";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("base-converter")!;

type Base = 2 | 8 | 10 | 16;
const BASES: { value: Base; label: string; prefix: string }[] = [
  { value: 2, label: "Binary (2)", prefix: "0b" },
  { value: 8, label: "Octal (8)", prefix: "0o" },
  { value: 10, label: "Decimal (10)", prefix: "" },
  { value: 16, label: "Hex (16)", prefix: "0x" },
];

const SAMPLES: Record<Base, string> = {
  2: "11111111",
  8: "377",
  10: "255",
  16: "FF",
};

const VALID: Record<Base, RegExp> = {
  2: /^[01]+$/,
  8: /^[0-7]+$/,
  10: /^[0-9]+$/,
  16: /^[0-9a-fA-F]+$/,
};

export function BaseConverter() {
  const [input, setInput] = useState("");
  const [fromBase, setFromBase] = useState<Base>(10);

  const { output, error, conversions, warning } = useMemo(() => {
    const val = input.trim();
    if (!val) {
      return {
        output: "",
        error: undefined,
        conversions: [] as { label: string; value: string }[],
        warning: undefined as string | undefined,
      };
    }

    if (!VALID[fromBase].test(val)) {
      return {
        output: "",
        error: `"${val}" contains digits invalid for base ${fromBase}.`,
        conversions: [],
        warning: undefined,
      };
    }

    const decimal = parseInt(val, fromBase);
    if (!isFinite(decimal)) {
      return {
        output: "",
        error: "Number is too large to convert.",
        conversions: [],
        warning: undefined,
      };
    }

    const warning =
      decimal > Number.MAX_SAFE_INTEGER
        ? "Value exceeds JavaScript safe integer (2^53 − 1); precision may be lost."
        : undefined;

    const bitWidth =
      decimal === 0 ? 1 : Math.floor(Math.log2(decimal)) + 1;

    const conversions = BASES.map(({ value, label, prefix }) => ({
      label,
      value: `${prefix}${decimal.toString(value).toUpperCase()}`,
    }));
    conversions.push({
      label: "Bit width",
      value: `${bitWidth} bit${bitWidth === 1 ? "" : "s"}`,
    });
    const lines = conversions.map((c) => `${c.label.padEnd(16)} ${c.value}`);

    return { output: lines.join("\n"), error: undefined, conversions, warning };
  }, [input, fromBase]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      error={error ?? warning}
      hideFileActions
      showClear
      inputLabel="Number"
      outputLabel="All bases"
      inputPlaceholder="Enter a number..."
      outputPlaceholder="Conversions will appear here..."
      outputContent={
        conversions.length > 0 ? (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {conversions.map((c) => (
              <div key={c.label} className="result-card flex items-center justify-between gap-3">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {c.label}
                  </span>
                  <span className="mono text-lg font-semibold text-[var(--text-primary)] truncate">
                    {c.value}
                  </span>
                </div>
                {c.label !== "Bit width" && <CopyChip value={c.value} label={c.label} />}
              </div>
            ))}
          </div>
        ) : (
          <p className="p-4 text-[var(--text-muted)] text-sm">Conversions will appear here...</p>
        )
      }
      extraActions={
        <button
          type="button"
          onClick={() => setInput(SAMPLES[fromBase])}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
      }
      options={
        <SegmentedControl
          label="From base"
          value={String(fromBase) as "2" | "8" | "10" | "16"}
          onChange={(v) => setFromBase(Number(v) as Base)}
          segments={[
            { value: "2", label: "Bin" },
            { value: "8", label: "Oct" },
            { value: "10", label: "Dec" },
            { value: "16", label: "Hex" },
          ]}
        />
      }
    />
  );
}
