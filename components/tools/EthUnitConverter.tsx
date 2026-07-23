"use client";

import { useState, useCallback } from "react";
import { ToolShell } from "@/components/ToolShell";
import { CopyChip } from "@/components/CopyChip";
import { getToolBySlug } from "@/lib/tools";
import { ETH_UNITS, QUICK_FILL_OPTIONS, parseUnitToWei, formatWeiToUnit, type EthUnit } from "@/lib/ethUnits";

const tool = getToolBySlug("eth-unit-converter")!;

function buildFromUnit(unitKey: string, value: string): {
  rawInputs: Record<string, string>;
  weiValue: bigint;
} | null {
  const unit = ETH_UNITS.find((u) => u.key === unitKey);
  if (!unit) return null;
  const wei = parseUnitToWei(value, unit.decimals);
  if (wei === null) return null;
  const rawInputs: Record<string, string> = { [unit.key]: value };
  for (const u of ETH_UNITS) {
    if (u.key === unit.key) continue;
    rawInputs[u.key] = formatWeiToUnit(wei, u.decimals);
  }
  return { rawInputs, weiValue: wei };
}

const INITIAL = buildFromUnit("ether", "1")!;

export function EthUnitConverter() {
  const [rawInputs, setRawInputs] = useState<Record<string, string>>(INITIAL.rawInputs);
  const [weiValue, setWeiValue] = useState<bigint | null>(INITIAL.weiValue);
  const [invalidKey, setInvalidKey] = useState<string | null>(null);

  const applyValue = useCallback((unit: EthUnit, value: string) => {
    setRawInputs((prev) => ({ ...prev, [unit.key]: value }));

    if (value.trim() === "") {
      setWeiValue(null);
      setInvalidKey(null);
      setRawInputs({});
      return;
    }

    const wei = parseUnitToWei(value, unit.decimals);
    if (wei === null) {
      // Invalid or mid-typing (e.g. "1.") — keep the raw text as-is, don't
      // touch other fields or the canonical value yet.
      setInvalidKey(unit.key);
      return;
    }

    setInvalidKey(null);
    setWeiValue(wei);

    const updated: Record<string, string> = { [unit.key]: value };
    for (const u of ETH_UNITS) {
      if (u.key === unit.key) continue;
      updated[u.key] = formatWeiToUnit(wei, u.decimals);
    }
    setRawInputs(updated);
  }, []);

  const handleClearAll = useCallback(() => {
    setRawInputs({});
    setWeiValue(null);
    setInvalidKey(null);
  }, []);

  const output =
    weiValue !== null
      ? ETH_UNITS.map((u) => `${u.label}: ${rawInputs[u.key] ?? formatWeiToUnit(weiValue, u.decimals)}`).join("\n")
      : "";

  return (
    <ToolShell
      tool={tool}
      input={weiValue !== null ? "has-value" : ""}
      output={output}
      onInputChange={(v) => {
        if (v === "") handleClearAll();
      }}
      hideInputPane
      hideFileActions
      showClear
      outputLabel="Convert between Ethereum units"
      extraActions={
        <div className="flex flex-wrap items-center gap-1.5">
          {QUICK_FILL_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => {
                const unit = ETH_UNITS.find((u) => u.key === opt.unitKey)!;
                applyValue(unit, opt.value);
              }}
              className="px-2.5 py-1 rounded-full text-xs border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              {opt.label}
            </button>
          ))}
        </div>
      }
      outputContent={
        <div className="flex flex-col divide-y divide-[var(--border)]">
          {ETH_UNITS.map((unit) => {
            const value = rawInputs[unit.key] ?? "";
            const isInvalid = invalidKey === unit.key;
            return (
              <div key={unit.key} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <label className="text-xs text-[var(--text-muted)] w-14 shrink-0">{unit.label}</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={value}
                  onChange={(e) => applyValue(unit, e.target.value)}
                  placeholder="0"
                  spellCheck={false}
                  className={`mono flex-1 min-w-0 text-sm bg-transparent focus:outline-none ${
                    isInvalid ? "text-[#ef4444]" : "text-[var(--text-primary)]"
                  }`}
                />
                <CopyChip value={value} label={unit.label} />
              </div>
            );
          })}
          {invalidKey && (
            <p role="alert" className="text-xs text-[#ef4444] pt-2.5">
              Enter a valid non-negative or negative decimal number for {ETH_UNITS.find((u) => u.key === invalidKey)?.label}.
            </p>
          )}
        </div>
      }
    />
  );
}
