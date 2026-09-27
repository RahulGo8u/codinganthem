"use client";

import { useState, useCallback, useMemo } from "react";
import { Calculator, ChevronDown, ShieldCheck, Sparkles } from "lucide-react";
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
  featured = false,
  isSource = false,
  onChange,
  onFocus,
}: {
  unit: EthUnit;
  value: string;
  isInvalid: boolean;
  featured?: boolean;
  isSource?: boolean;
  onChange: (unit: EthUnit, value: string) => void;
  onFocus: (unit: EthUnit) => void;
}) {
  return (
    <div
      className={`rounded-xl border p-3.5 transition-colors ${
        isInvalid
          ? "border-[#ef4444]/60 bg-[#ef4444]/5"
          : isSource
            ? "border-[#6366f1]/60 bg-[#6366f1]/5"
            : "border-[var(--border)] bg-[var(--bg-surface)]"
      } ${featured ? "min-h-28" : ""}`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <label className="min-w-0" htmlFor={`eth-${unit.key}`}>
          <span className="block text-xs font-semibold text-[var(--text-primary)]">
            {unit.label}
            <span className="ml-1.5 font-normal text-[var(--text-muted)]">({unit.symbol})</span>
          </span>
          <span className="mt-0.5 block text-[10px] text-[var(--text-muted)]">
            10<sup>{unit.decimals}</sup> Wei{unit.alias ? ` · ${unit.alias}` : ""}
          </span>
        </label>
        {isSource && (
          <span className="rounded-full bg-[#6366f1]/15 px-2 py-0.5 text-[10px] font-medium text-[#6366f1]">
            Source
          </span>
        )}
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <input
          id={`eth-${unit.key}`}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(unit, e.target.value)}
          onFocus={() => onFocus(unit)}
          placeholder="0"
          spellCheck={false}
          aria-label={`${unit.label} amount`}
          aria-invalid={isInvalid}
          className={`mono min-w-0 flex-1 bg-transparent text-sm focus:outline-none ${
            isInvalid ? "text-[#ef4444]" : "text-[var(--text-primary)]"
          }`}
        />
        <CopyChip value={value} label={unit.label} />
      </div>
      {value && !isInvalid && value.length > 6 && (
        <p className="mono mt-2 truncate text-[10px] text-[var(--text-muted)]" title={formatReadable(value)}>
          {formatReadable(value)}
        </p>
      )}
    </div>
  );
}

export function EthUnitConverter() {
  const [rawInputs, setRawInputs] = useState<Record<string, string>>(INITIAL.rawInputs);
  const [weiValue, setWeiValue] = useState<bigint | null>(INITIAL.weiValue);
  const [invalidKey, setInvalidKey] = useState<string | null>(null);
  const [sourceKey, setSourceKey] = useState("ether");
  const [gasLimit, setGasLimit] = useState("21000");
  const [gasPrice, setGasPrice] = useState("20");

  const applyValue = useCallback((unit: EthUnit, value: string) => {
    const normalized = value.replace(/[,_\s]/g, "");
    setSourceKey(unit.key);
    setRawInputs((prev) => ({ ...prev, [unit.key]: normalized }));

    if (normalized.trim() === "") {
      setWeiValue(null);
      setInvalidKey(null);
      setRawInputs({});
      return;
    }

    const wei = parseUnitToWei(normalized, unit.decimals);
    if (wei === null) {
      setInvalidKey(unit.key);
      return;
    }

    setInvalidKey(null);
    setWeiValue(wei);

    const updated: Record<string, string> = { [unit.key]: normalized };
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
    setSourceKey("ether");
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
  const sourceUnit = ETH_UNITS.find((u) => u.key === sourceKey) ?? ETH_UNITS[6];

  const gasEstimate = useMemo(() => {
    if (!/^\d+$/.test(gasLimit) || BigInt(gasLimit) <= BigInt(0)) return null;
    const priceWei = parseUnitToWei(gasPrice, 9);
    if (priceWei === null || priceWei < BigInt(0)) return null;
    const totalWei = priceWei * BigInt(gasLimit);
    return {
      wei: totalWei.toString(),
      ether: formatWeiToUnit(totalWei, 18),
    };
  }, [gasLimit, gasPrice]);

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
      outputLabel="Ethereum unit converter"
      extraActions={
        <CopyButton value={jsonExport} label="Copy all as JSON" compact />
      }
      outputContent={
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 rounded-xl border border-[#6366f1]/25 bg-gradient-to-br from-[#6366f1]/10 to-transparent p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                <Sparkles size={15} className="text-[#6366f1]" aria-hidden="true" />
                Start with a common value
              </div>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Choose a preset or edit any unit below. Commas are accepted.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_FILL_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => {
                    const unit = ETH_UNITS.find((u) => u.key === opt.unitKey)!;
                    applyValue(unit, opt.value);
                  }}
                  className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs text-[var(--text-muted)] transition-colors hover:border-[#6366f1]/50 hover:text-[var(--text-primary)]"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <section aria-labelledby="common-ethereum-units">
            <div className="mb-2.5 flex items-end justify-between gap-3">
              <div>
                <h2 id="common-ethereum-units" className="text-sm font-semibold text-[var(--text-primary)]">
                  Wei, Gwei & Ether
                </h2>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  Editing {sourceUnit.label}; all results update with exact BigInt precision.
                </p>
              </div>
              <span className="hidden items-center gap-1 text-[10px] text-[var(--success)] sm:flex">
                <ShieldCheck size={12} aria-hidden="true" />
                Local & exact
              </span>
            </div>
            <div className="grid gap-2.5 md:grid-cols-3">
            {commonUnits.map((unit) => (
              <UnitRow
                key={unit.key}
                unit={unit}
                value={rawInputs[unit.key] ?? ""}
                isInvalid={invalidKey === unit.key}
                isSource={sourceKey === unit.key}
                featured
                onChange={applyValue}
                onFocus={(selected) => setSourceKey(selected.key)}
              />
            ))}
            </div>
          </section>

          {invalidKey && (
            <p role="alert" className="rounded-lg border border-[#ef4444]/35 bg-[#ef4444]/10 px-3 py-2.5 text-xs text-[#ef4444]">
              Enter a valid {ETH_UNITS.find((u) => u.key === invalidKey)?.label} amount with no more
              than {ETH_UNITS.find((u) => u.key === invalidKey)?.decimals} decimal places.
            </p>
          )}

          <details className="group rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-[var(--text-primary)]">
              <span>
                More Ethereum denominations
                <span className="ml-2 text-xs font-normal text-[var(--text-muted)]">
                  Kwei, Mwei, Szabo & Finney
                </span>
              </span>
              <ChevronDown size={16} className="text-[var(--text-muted)] transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="grid gap-2.5 border-t border-[var(--border)] p-3 md:grid-cols-2">
              {otherUnits.map((unit) => (
                <UnitRow
                  key={unit.key}
                  unit={unit}
                  value={rawInputs[unit.key] ?? ""}
                  isInvalid={invalidKey === unit.key}
                  isSource={sourceKey === unit.key}
                  onChange={applyValue}
                  onFocus={(selected) => setSourceKey(selected.key)}
                />
              ))}
            </div>
          </details>

          <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4" aria-labelledby="gas-fee-heading">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[#6366f1]/12 p-2 text-[#6366f1]">
                <Calculator size={17} aria-hidden="true" />
              </div>
              <div>
                <h2 id="gas-fee-heading" className="text-sm font-semibold text-[var(--text-primary)]">
                  Ethereum gas fee estimator
                </h2>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  Gas limit × max gas price. Your wallet&apos;s final fee may be lower.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-medium text-[var(--text-muted)]">
                Gas limit
                <input
                  type="text"
                  inputMode="numeric"
                  value={gasLimit}
                  onChange={(event) => setGasLimit(event.target.value.replace(/[,_\s]/g, ""))}
                  className="mono mt-1.5 h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-primary)] focus:border-[#6366f1] focus:outline-none"
                  aria-label="Gas limit"
                />
              </label>
              <label className="text-xs font-medium text-[var(--text-muted)]">
                Max gas price (Gwei)
                <input
                  type="text"
                  inputMode="decimal"
                  value={gasPrice}
                  onChange={(event) => setGasPrice(event.target.value.replace(/[,_\s]/g, ""))}
                  className="mono mt-1.5 h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-primary)] focus:border-[#6366f1] focus:outline-none"
                  aria-label="Max gas price in Gwei"
                />
              </label>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                ["ETH transfer", "21000"],
                ["ERC-20 transfer", "65000"],
                ["Token swap", "150000"],
              ].map(([label, value]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setGasLimit(value)}
                  className="rounded-full px-2.5 py-1 text-[11px] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                >
                  {label} · {Number(value).toLocaleString()}
                </button>
              ))}
            </div>

            {gasEstimate ? (
              <div className="mt-4 grid gap-2 rounded-lg bg-[var(--bg-elevated)] p-3 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Maximum fee</p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="mono min-w-0 truncate text-sm font-semibold text-[var(--text-primary)]">
                      {gasEstimate.ether} ETH
                    </p>
                    <CopyChip value={gasEstimate.ether} label="gas fee in ETH" />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Exact Wei</p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="mono min-w-0 truncate text-sm text-[var(--text-primary)]">
                      {formatReadable(gasEstimate.wei)}
                    </p>
                    <CopyChip value={gasEstimate.wei} label="gas fee in Wei" />
                  </div>
                </div>
              </div>
            ) : (
              <p role="alert" className="mt-3 text-xs text-[#ef4444]">
                Enter a positive whole-number gas limit and a valid non-negative Gwei price.
              </p>
            )}
          </section>

          <div className="flex items-start gap-2 rounded-lg bg-[var(--bg-elevated)] px-3 py-2.5 text-xs leading-relaxed text-[var(--text-muted)]">
            <ShieldCheck size={14} className="mt-0.5 shrink-0 text-[var(--success)]" aria-hidden="true" />
            <p>
              Conversion happens entirely in your browser. Never enter a private key, seed phrase,
              or wallet recovery phrase into any website.
            </p>
          </div>
        </div>
      }
    />
  );
}
