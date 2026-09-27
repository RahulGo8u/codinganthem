"use client";

import { useMemo, useState, useCallback } from "react";
import { getToolBySlug } from "@/lib/tools";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CopyButton } from "@/components/CopyButton";
import { SegmentedControl } from "@/components/SegmentedControl";

const tool = getToolBySlug("css-gradient-generator")!;

type Stop = { id: string; color: string; pos: number };
type Kind = "linear" | "radial" | "conic";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

const PRESETS: { label: string; kind: Kind; angle: number; stops: Omit<Stop, "id">[] }[] = [
  {
    label: "Indigo → Pink",
    kind: "linear",
    angle: 135,
    stops: [
      { color: "#6366f1", pos: 0 },
      { color: "#ec4899", pos: 100 },
    ],
  },
  {
    label: "Sunset",
    kind: "linear",
    angle: 90,
    stops: [
      { color: "#f97316", pos: 0 },
      { color: "#ef4444", pos: 50 },
      { color: "#a855f7", pos: 100 },
    ],
  },
  {
    label: "Ocean",
    kind: "radial",
    angle: 0,
    stops: [
      { color: "#22d3ee", pos: 0 },
      { color: "#2563eb", pos: 100 },
    ],
  },
  {
    label: "Mint",
    kind: "linear",
    angle: 160,
    stops: [
      { color: "#34d399", pos: 0 },
      { color: "#0f766e", pos: 100 },
    ],
  },
];

export function CssGradientGenerator() {
  const [kind, setKind] = useState<Kind>("linear");
  const [angle, setAngle] = useState(135);
  const [copyMode, setCopyMode] = useState<"full" | "value">("full");
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
  const copyValue = copyMode === "full" ? fullRule : css;

  const updateStop = useCallback((id: string, patch: Partial<Stop>) => {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    setKind(preset.kind);
    setAngle(preset.angle);
    setStops(preset.stops.map((s) => ({ ...s, id: uid() })));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6 pb-24">
      <div className="flex flex-col gap-3">
        <Breadcrumb current={tool.name} asHeading={false} />
        <div className="flex flex-col gap-1.5 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{tool.name}</h1>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-2xl">{tool.description}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => void navigator.clipboard.writeText(copyValue)}
        className="w-full h-56 sm:h-72 rounded-xl border border-[var(--border)] text-left relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]"
        style={{ background: css }}
        aria-label={`Gradient preview. Click to copy ${copyMode === "full" ? "CSS rule" : "gradient value"}`}
        title="Click to copy"
      >
        <span className="sr-only">Click preview to copy gradient CSS</span>
      </button>

      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          label="Gradient type"
          value={kind}
          onChange={setKind}
          segments={[
            { value: "linear", label: "Linear" },
            { value: "radial", label: "Radial" },
            { value: "conic", label: "Conic" },
          ]}
        />
        <SegmentedControl
          label="Copy format"
          compact
          value={copyMode}
          onChange={setCopyMode}
          segments={[
            { value: "full", label: "Full rule" },
            { value: "value", label: "Value only" },
          ]}
        />
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Gradient presets">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => applyPreset(p)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            {p.label}
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
            aria-valuetext={`${angle} degrees`}
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
            type="button"
            onClick={() =>
              setStops((prev) => [...prev, { id: uid(), color: "#22c55e", pos: 50 }].slice(0, 6))
            }
            disabled={stops.length >= 6}
            className="text-xs text-[#6366f1] hover:underline disabled:opacity-40"
          >
            + Add stop
          </button>
        </div>
        {stops.map((s, index) => (
          <div key={s.id} className="flex flex-wrap items-center gap-3">
            <input
              type="color"
              value={s.color}
              onChange={(e) => updateStop(s.id, { color: e.target.value })}
              className="h-9 w-12 cursor-pointer"
              aria-label={`Stop ${index + 1} color`}
            />
            <input
              type="text"
              value={s.color}
              onChange={(e) => updateStop(s.id, { color: e.target.value })}
              aria-label={`Stop ${index + 1} hex`}
              className="mono w-24 rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-1.5 text-xs text-[var(--text-primary)]"
            />
            <input
              type="range"
              min={0}
              max={100}
              value={s.pos}
              aria-valuetext={`${s.pos} percent`}
              aria-label={`Stop ${index + 1} position`}
              onChange={(e) => updateStop(s.id, { pos: Number(e.target.value) })}
              className="flex-1 min-w-[120px]"
            />
            <span className="mono text-xs text-[var(--text-muted)] w-10">{s.pos}%</span>
            <button
              type="button"
              onClick={() => setStops((prev) => (prev.length > 2 ? prev.filter((x) => x.id !== s.id) : prev))}
              disabled={stops.length <= 2}
              aria-label={`Remove stop ${index + 1}`}
              className="text-xs text-[#ef4444] disabled:opacity-40"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-[var(--text-muted)]">CSS</span>
          <CopyButton value={copyValue} label="Copy" compact />
        </div>
        <code className="mono text-sm text-[var(--text-primary)] break-all">{fullRule}</code>
      </div>
    </div>
  );
}
