"use client";

import { useState, useCallback, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { CopyChip } from "@/components/CopyChip";
import { CopyButton } from "@/components/CopyButton";
import { getToolBySlug } from "@/lib/tools";
import { ETH_UNITS, QUICK_FILL_OPTIONS, parseUnitToWei, formatWeiToUnit, type EthUnit } from "@/lib/ethUnits";

const tool = getToolBySlug("eth-unit-converter")!;

const COMMON_KEYS = new Set(["wei", "gwei", "ether"]);

function groupThousands(intPart: string): string {
  const neg = intPart.startsWith("-");
  const digits = neg ? intPart.slice(1) : intPart;
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return neg ? `-${grouped}` : grouped;
}

/** Display helper — never used for parsing. */
function formatReadable(value: string): string {
  if (!value || value === "." || value === "-") return value;
  const neg = value.startsWith("-");
  const unsigned = neg ? value.slice(1) : value;
  const [whole = "0", frac] = unsigned.split(".");
  const grouped = groupThousands(whole);
  const body = frac !== undefined ? `${grouped}.${frac}` : grouped;
  return neg ? `-${body}` : body;
}

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

function UnitRow({
  unit,
  value,
  isInvalid,
  onChange,
}: {
  unit: EthUnit;
  value: string;
  isInvalid: boolean;
  onChange: (unit: EthUnit, value: string) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 py-2.5 first:pt-0 last:pb-0">
      <label className="text-xs text-[var(--text-muted)] w-14 shrink-0" htmlFor={`eth-${unit.key}`}>
        {unit.label}
      </label>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <input
          id={`eth-${unit.key}`}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(unit, e.target.value)}
          placeholder="0"
          spellCheck={false}
          className={`mono flex-1 min-w-0 text-sm bg-transparent focus:outline-none ${
            isInvalid ? "text-[#ef4444]" : "text-[var(--text-primary)]"
          }`}
        />
        {value && !isInvalid && (
          <span className="hidden sm:inline mono text-[10px] text-[var(--text-muted)] shrink-0 max-w-[40%] truncate" title={formatReadable(value)}>
            {formatReadable(value)}
          </span>
        )}
        <CopyChip value={value} label={unit.label} />
      </div>
    </div>
  );
}

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

  const jsonExport = useMemo(() => {
    if (weiValue === null) return "";
    const obj: Record<string, string> = {};
    for (const u of ETH_UNITS) {
      obj[u.key] = rawInputs[u.key] ?? formatWeiToUnit(weiValue, u.decimals);
    }
    return JSON.stringify(obj, null, 2);
  }, [weiValue, rawInputs]);

  const output =
    weiValue !== null
      ? ETH_UNITS.map((u) => `${u.label}: ${rawInputs[u.key] ?? formatWeiToUnit(weiValue, u.decimals)}`).join("\n")
      : "";

  const commonUnits = ETH_UNITS.filter((u) => COMMON_KEYS.has(u.key));
  const otherUnits = ETH_UNITS.filter((u) => !COMMON_KEYS.has(u.key));

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
              type="button"
              onClick={() => {
                const unit = ETH_UNITS.find((u) => u.key === opt.unitKey)!;
                applyValue(unit, opt.value);
              }}
              className="px-2.5 py-1 rounded-full text-xs border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              {opt.label}
            </button>
          ))}
          <CopyButton value={jsonExport} label="Copy JSON" compact className="ml-1" />
        </div>
      }
      outputContent={
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] pb-1">
            Common
          </p>
          <div className="flex flex-col divide-y divide-[var(--border)]">
            {commonUnits.map((unit) => (
              <UnitRow
                key={unit.key}
                unit={unit}
                value={rawInputs[unit.key] ?? ""}
                isInvalid={invalidKey === unit.key}
                onChange={applyValue}
              />
            ))}
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] pt-3 pb-1">
            Other units
          </p>
          <div className="flex flex-col divide-y divide-[var(--border)]">
            {otherUnits.map((unit) => (
              <UnitRow
                key={unit.key}
                unit={unit}
                value={rawInputs[unit.key] ?? ""}
                isInvalid={invalidKey === unit.key}
                onChange={applyValue}
              />
            ))}
          </div>
          {invalidKey && (
            <p role="alert" className="text-xs text-[#ef4444] pt-2.5">
              Enter a valid decimal for {ETH_UNITS.find((u) => u.key === invalidKey)?.label}. Other fields keep the last valid conversion until this edits successfully.
            </p>
          )}
        </div>
      }
    />
  );
}
