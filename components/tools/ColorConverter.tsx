"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("color-converter")!;

const SAMPLE = "#6366f1";

type RGB = { r: number; g: number; b: number };
type HSL = { h: number; s: number; l: number };

function hexToRgb(hex: string): RGB | null {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  if (full.length !== 6) return null;
  const n = parseInt(full, 16);
  if (isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
      case gn: h = ((bn - rn) / d + 2) / 6; break;
      case bn: h = ((rn - gn) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb({ h, s, l }: HSL): RGB {
  const sn = s / 100, ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function rgbToHex({ r, g, b }: RGB) {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function parseInput(input: string): { rgb: RGB; hex: string; hsl: HSL } | null {
  const s = input.trim();
  if (!s) return null;

  // HEX
  if (s.startsWith("#") || /^[0-9a-fA-F]{3,6}$/.test(s)) {
    const rgb = hexToRgb(s.startsWith("#") ? s : "#" + s);
    if (!rgb) return null;
    return { rgb, hex: rgbToHex(rgb), hsl: rgbToHsl(rgb) };
  }

  // RGB
  const rgbMatch = s.match(/^rgba?\(?\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    const clamp = (n: number) => Math.max(0, Math.min(255, n));
    const rgb = { r: clamp(Number(rgbMatch[1])), g: clamp(Number(rgbMatch[2])), b: clamp(Number(rgbMatch[3])) };
    return { rgb, hex: rgbToHex(rgb), hsl: rgbToHsl(rgb) };
  }

  // HSL
  const hslMatch = s.match(/^hsla?\(?\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/i);
  if (hslMatch) {
    const hsl = { h: Number(hslMatch[1]), s: Number(hslMatch[2]), l: Number(hslMatch[3]) };
    const rgb = hslToRgb(hsl);
    return { rgb, hex: rgbToHex(rgb), hsl };
  }

  return null;
}

export function ColorConverter() {
  const [input, setInput] = useState("");

  const result = useMemo(() => parseInput(input), [input]);

  const output = result
    ? [
        `HEX:  ${result.hex}`,
        `RGB:  rgb(${result.rgb.r}, ${result.rgb.g}, ${result.rgb.b})`,
        `HSL:  hsl(${result.hsl.h}, ${result.hsl.s}%, ${result.hsl.l}%)`,
      ].join("\n")
    : "";

  const error =
    input.trim() && !result
      ? "Could not parse color. Try: #6366f1, rgb(99,102,241), or hsl(239,84%,67%)"
      : undefined;

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      error={error}
      hideFileActions
      showClear
      inputLabel="Color value"
      outputLabel="Conversions"
      inputPlaceholder="Enter a color: #6366f1, rgb(99,102,241), or hsl(239,84%,67%)"
      outputPlaceholder="Converted values will appear here..."
      extraActions={
        <button
          onClick={() => setInput(SAMPLE)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
      }
      outputContent={
        result ? (
          <div className="flex flex-col gap-4">
            {/* Color preview */}
            <div
              className="w-full h-24 rounded-lg border border-[var(--border)]"
              style={{ backgroundColor: result.hex }}
            />
            {/* Values */}
            <div className="flex flex-col gap-2">
              {[
                { label: "HEX", value: result.hex },
                { label: "RGB", value: `rgb(${result.rgb.r}, ${result.rgb.g}, ${result.rgb.b})` },
                { label: "HSL", value: `hsl(${result.hsl.h}, ${result.hsl.s}%, ${result.hsl.l}%)` },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <span className="text-xs text-[var(--text-muted)] w-10">{label}</span>
                  <code className="mono text-sm text-[var(--text-primary)] flex-1">{value}</code>
                  <button
                    onClick={() => navigator.clipboard.writeText(value)}
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : input.trim() ? (
          <p className="text-[#ef4444] text-sm">{error}</p>
        ) : (
          <p className="text-[var(--text-muted)] text-sm">Converted values will appear here...</p>
        )
      }
    />
  );
}
