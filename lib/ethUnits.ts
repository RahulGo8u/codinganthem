/**
 * BigInt-safe Ethereum unit conversion. 1 Ether = 10^18 Wei — well beyond
 * the range JS `Number` can represent exactly, so all parsing/formatting
 * here is done via string manipulation + BigInt, never floating-point
 * arithmetic.
 */

export interface EthUnit {
  key: string;
  label: string;
  /** Decimal places relative to Wei (e.g. Ether is 10^18 Wei). */
  decimals: number;
}

export const ETH_UNITS: EthUnit[] = [
  { key: "wei", label: "Wei", decimals: 0 },
  { key: "kwei", label: "Kwei", decimals: 3 },
  { key: "mwei", label: "Mwei", decimals: 6 },
  { key: "gwei", label: "Gwei", decimals: 9 },
  { key: "szabo", label: "Szabo", decimals: 12 },
  { key: "finney", label: "Finney", decimals: 15 },
  { key: "ether", label: "Ether", decimals: 18 },
];

/**
 * Parses a decimal string (e.g. "1.5", "-0.002", "1000") in a unit with the
 * given number of decimal places (relative to Wei) into a Wei BigInt.
 * Returns null for empty/invalid input rather than throwing, so callers can
 * treat "not parseable yet" (e.g. mid-typing "1.") as a normal UI state.
 */
export function parseUnitToWei(value: string, decimals: number): bigint | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const negative = trimmed.startsWith("-");
  const unsigned = negative ? trimmed.slice(1) : trimmed;

  if (!/^\d*\.?\d*$/.test(unsigned) || unsigned === "" || unsigned === ".") {
    return null;
  }

  const [wholePart = "0", fractionPart = ""] = unsigned.split(".");

  if (fractionPart.length > decimals) {
    // More precision than this unit supports at the Wei level (e.g. more
    // than 18 decimal places for Ether) — reject rather than silently
    // truncating meaningful digits.
    return null;
  }

  const paddedFraction = fractionPart.padEnd(decimals, "0");
  const combined = `${wholePart}${paddedFraction}` || "0";

  try {
    const wei = BigInt(combined);
    return negative ? -wei : wei;
  } catch {
    return null;
  }
}

/**
 * Formats a Wei BigInt into a decimal string for a unit with the given
 * number of decimal places, trimming trailing zeros (and a trailing "."
 * if the result is a whole number).
 */
export function formatWeiToUnit(wei: bigint, decimals: number): string {
  const negative = wei < BigInt(0);
  const abs = negative ? -wei : wei;

  const divisor = BigInt(10) ** BigInt(decimals);
  const whole = abs / divisor;
  const remainder = abs % divisor;

  if (decimals === 0) {
    return `${negative ? "-" : ""}${whole.toString()}`;
  }

  const fraction = remainder.toString().padStart(decimals, "0").replace(/0+$/, "");
  const result = fraction ? `${whole}.${fraction}` : whole.toString();

  return `${negative ? "-" : ""}${result}`;
}

export interface QuickFillOption {
  label: string;
  unitKey: string;
  value: string;
}

export const QUICK_FILL_OPTIONS: QuickFillOption[] = [
  { label: "1 ETH", unitKey: "ether", value: "1" },
  { label: "20 Gwei gas", unitKey: "gwei", value: "20" },
  { label: "21000 Wei base gas", unitKey: "wei", value: "21000" },
];
