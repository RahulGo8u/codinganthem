"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("color-contrast-checker")!;

type RGB = { r: number; g: number; b: number };

function parseColor(input: string): RGB | null {
  const s = input.trim();
  if (!s) return null;

  if (s.startsWith("#") || /^[0-9a-fA-F]{3,6}$/.test(s)) {
    const hex = s.startsWith("#") ? s.slice(1) : s;
    const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
    if (full.length !== 6) return null;
    const n = parseInt(full, 16);
    if (isNaN(n)) return null;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  const rgbMatch = s.match(/^rgba?\(?\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    const clamp = (n: number) => Math.max(0, Math.min(255, n));
    return { r: clamp(Number(rgbMatch[1])), g: clamp(Number(rgbMatch[2])), b: clamp(Number(rgbMatch[3])) };
  }

  return null;
}

function toHex({ r, g, b }: RGB): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function relativeLuminance({ r, g, b }: RGB): number {
  const channel = (c: number) => {
    const cs = c / 255;
    return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(a: RGB, b: RGB): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function ColorContrastChecker() {
  const [fg, setFg] = useState("#111111");
  const [bg, setBg] = useState("#ffffff");

  const fgRgb = useMemo(() => parseColor(fg), [fg]);
  const bgRgb = useMemo(() => parseColor(bg), [bg]);
  const ratio = fgRgb && bgRgb ? contrastRatio(fgRgb, bgRgb) : null;

  const checks = ratio
    ? [
        { label: "AA — Normal text", pass: ratio >= 4.5 },
        { label: "AA — Large text", pass: ratio >= 3 },
        { label: "AAA — Normal text", pass: ratio >= 7 },
        { label: "AAA — Large text", pass: ratio >= 4.5 },
      ]
    : [];

  const wcagLevels = ratio
    ? [
        {
          level: "WCAG AA",
          normal: ratio >= 4.5,
          large: ratio >= 3,
        },
        {
          level: "WCAG AAA",
          normal: ratio >= 7,
          large: ratio >= 4.5,
        },
      ]
    : [];

  const output = ratio
    ? `Contrast ratio: ${ratio.toFixed(2)}:1\n${checks.map((c) => `${c.label}: ${c.pass ? "Pass" : "Fail"}`).join("\n")}`
    : "";

  const error =
    (fg.trim() && !fgRgb) || (bg.trim() && !bgRgb)
      ? "Could not parse one of the colors. Try a HEX code (#111111) or rgb(17,17,17)."
      : undefined;

  return (
    <ToolShell
      tool={tool}
      input=""
      output={output}
      onInputChange={() => {}}
      error={error}
      hideFileActions
      hideInputPane
      outputLabel="Contrast Result"
      outputPlaceholder="Enter two colors above to check contrast..."
      badges={<span className="badge badge-success">WCAG 2.1 Ready</span>}
      options={
        <div className="flex flex-wrap items-center gap-6 w-full">
          <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            Text color
            <input
              type="color"
              value={fgRgb ? toHex(fgRgb) : "#111111"}
              onChange={(e) => setFg(e.target.value)}
              className="w-8 h-8 rounded border border-[var(--border)] cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={fg}
              onChange={(e) => setFg(e.target.value)}
              className="mono w-28 bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--text-primary)]"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            Background color
            <input
              type="color"
              value={bgRgb ? toHex(bgRgb) : "#ffffff"}
              onChange={(e) => setBg(e.target.value)}
              className="w-8 h-8 rounded border border-[var(--border)] cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={bg}
              onChange={(e) => setBg(e.target.value)}
              className="mono w-28 bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--text-primary)]"
            />
          </label>
        </div>
      }
      outputContent={
        ratio && fgRgb && bgRgb ? (
          <div className="p-4 flex flex-col gap-4">
            {/* Result cards: ratio + WCAG AA/AAA */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Big ratio card */}
              <div className="result-card flex flex-col gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Contrast Ratio
                </span>
                <span className="text-4xl font-semibold text-[var(--accent)] mono leading-none">
                  {ratio.toFixed(1)}:1
                </span>
                <div className="mt-1 h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--success)]"
                    style={{ width: `${Math.min(100, (ratio / 21) * 100)}%` }}
                  />
                </div>
              </div>

              {/* WCAG level cards */}
              {wcagLevels.map((w) => (
                <div key={w.level} className="result-card flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      {w.level}
                    </span>
                    <span className={w.normal && w.large ? "text-[var(--success)]" : "text-[var(--error)]"}>
                      {w.normal && w.large ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-primary)]">Normal Text</span>
                    <span className={`badge ${w.normal ? "badge-success" : ""}`} style={w.normal ? undefined : { color: "var(--error)", background: "color-mix(in srgb, var(--error) 12%, transparent)", borderColor: "color-mix(in srgb, var(--error) 35%, transparent)" }}>
                      {w.normal ? "PASS" : "FAIL"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">Large Text</span>
                    <span className={`badge ${w.large ? "badge-success" : ""}`} style={w.large ? undefined : { color: "var(--error)", background: "color-mix(in srgb, var(--error) 12%, transparent)", borderColor: "color-mix(in srgb, var(--error) 35%, transparent)" }}>
                      {w.large ? "PASS" : "FAIL"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual preview */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-[var(--text-primary)]">Visual Preview</span>
              <div
                className="rounded-xl border border-[var(--border)] p-6 flex flex-col gap-3"
                style={{ backgroundColor: toHex(bgRgb), color: toHex(fgRgb) }}
              >
                <p className="text-2xl font-semibold">Large Headline Preview</p>
                <p className="text-sm leading-relaxed">
                  The quick brown fox jumps over the lazy dog. Accessibility is not just a
                  checklist, it&apos;s a way of designing for everyone, everywhere.
                </p>
                <div className="flex flex-wrap gap-3 mt-2">
                  <span
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border"
                    style={{ borderColor: toHex(fgRgb), color: toHex(fgRgb) }}
                  >
                    Action Primary
                  </span>
                  <span
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ color: toHex(fgRgb), opacity: 0.7 }}
                  >
                    Ghost Secondary
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="p-4 text-[var(--text-muted)] text-sm">Enter two colors above to check contrast...</p>
        )
      }
    />
  );
}
