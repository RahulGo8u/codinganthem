"use client";

import { useMemo, useState, useCallback } from "react";
import { getToolBySlug } from "@/lib/tools";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CopyChip } from "@/components/CopyChip";

const tool = getToolBySlug("css-gradient-generator")!;

type Stop = { id: string; color: string; pos: number };
type Kind = "linear" | "radial" | "conic";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function CssGradientGenerator() {
  const [kind, setKind] = useState<Kind>("linear");
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<Stop[]>([
    { id: uid(), color: "#6366f1", pos: 0 },
    { id: uid(), color: "#ec4899", pos: 100 },
  ]);

  const stopCss = useMemo(
    () =>
      [...stops]
        .sort((a, b) => a.pos - b.pos)
        .map((s) => `${s.color} ${s.pos}%`)
        .join(", "),
    [stops]
  );

  const css = useMemo(() => {
    if (kind === "linear") return `linear-gradient(${angle}deg, ${stopCss})`;
    if (kind === "radial") return `radial-gradient(circle, ${stopCss})`;
    return `conic-gradient(from ${angle}deg, ${stopCss})`;
  }, [kind, angle, stopCss]);

  const fullRule = `background: ${css};`;

  const updateStop = useCallback((id: string, patch: Partial<Stop>) => {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6 pb-24">
      <div className="flex flex-col gap-3">
        <Breadcrumb current={tool.name} asHeading={false} />
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1.5 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{tool.name}</h1>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-2xl">{tool.description}</p>
          </div>
          <span className="badge badge-neutral">Client-side</span>
        </div>
      </div>

      <div
        className="w-full h-56 sm:h-72 rounded-xl border border-[var(--border)]"
        style={{ background: css }}
      />

      <div className="flex flex-wrap gap-2">
        {(["linear", "radial", "conic"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-colors ${
              kind === k
                ? "border-[#6366f1]/40 bg-[#6366f1]/15 text-[#6366f1]"
                : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      {kind !== "radial" && (
        <label className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          Angle
          <input
            type="range"
            min={0}
            max={360}
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="flex-1 max-w-xs"
          />
          <span className="mono text-[var(--text-primary)] w-12">{angle}°</span>
        </label>
      )}

      <div className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Color stops</span>
          <button
            onClick={() =>
              setStops((prev) => [...prev, { id: uid(), color: "#22c55e", pos: 50 }].slice(0, 6))
            }
            disabled={stops.length >= 6}
            className="text-xs text-[#6366f1] hover:underline disabled:opacity-40"
          >
            + Add stop
          </button>
        </div>
        {stops.map((s) => (
          <div key={s.id} className="flex flex-wrap items-center gap-3">
            <input
              type="color"
              value={s.color}
              onChange={(e) => updateStop(s.id, { color: e.target.value })}
              className="h-9 w-12 cursor-pointer"
            />
            <input
              type="text"
              value={s.color}
              onChange={(e) => updateStop(s.id, { color: e.target.value })}
              className="mono w-24 rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-1.5 text-xs text-[var(--text-primary)]"
            />
            <input
              type="range"
              min={0}
              max={100}
              value={s.pos}
              onChange={(e) => updateStop(s.id, { pos: Number(e.target.value) })}
              className="flex-1 min-w-[120px]"
            />
            <span className="mono text-xs text-[var(--text-muted)] w-10">{s.pos}%</span>
            {stops.length > 2 && (
              <button
                onClick={() => setStops((prev) => prev.filter((x) => x.id !== s.id))}
                className="text-xs text-[#ef4444]"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-[var(--text-muted)]">CSS</span>
          <CopyChip value={fullRule} label="CSS" />
        </div>
        <code className="mono text-sm text-[var(--text-primary)] break-all">{fullRule}</code>
      </div>
    </div>
  );
}
