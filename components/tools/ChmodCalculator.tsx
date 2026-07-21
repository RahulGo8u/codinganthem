"use client";

import { useMemo, useState, useCallback } from "react";
import { getToolBySlug } from "@/lib/tools";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CopyChip } from "@/components/CopyChip";

const tool = getToolBySlug("chmod-calculator")!;

type Perm = { r: boolean; w: boolean; x: boolean };
type Triple = { owner: Perm; group: Perm; public: Perm };

const DEFAULT: Triple = {
  owner: { r: true, w: true, x: false },
  group: { r: true, w: false, x: false },
  public: { r: true, w: false, x: false },
};

function digit(p: Perm): number {
  return (p.r ? 4 : 0) + (p.w ? 2 : 0) + (p.x ? 1 : 0);
}

function symbolic(p: Perm): string {
  return `${p.r ? "r" : "-"}${p.w ? "w" : "-"}${p.x ? "x" : "-"}`;
}

function fromDigit(n: number): Perm {
  return { r: (n & 4) !== 0, w: (n & 2) !== 0, x: (n & 1) !== 0 };
}

const PRESETS: { label: string; octal: string }[] = [
  { label: "644", octal: "644" },
  { label: "755", octal: "755" },
  { label: "600", octal: "600" },
  { label: "700", octal: "700" },
  { label: "777", octal: "777" },
];

export function ChmodCalculator() {
  const [perms, setPerms] = useState<Triple>(DEFAULT);
  const [sticky, setSticky] = useState(false);
  const [setuid, setSetuid] = useState(false);
  const [setgid, setSetgid] = useState(false);

  const octal = useMemo(() => {
    const special = (setuid ? 4 : 0) + (setgid ? 2 : 0) + (sticky ? 1 : 0);
    const base = `${digit(perms.owner)}${digit(perms.group)}${digit(perms.public)}`;
    return special > 0 ? `${special}${base}` : base;
  }, [perms, sticky, setuid, setgid]);

  const sym = useMemo(
    () => `${symbolic(perms.owner)}${symbolic(perms.group)}${symbolic(perms.public)}`,
    [perms]
  );

  const command = `chmod ${octal}`;

  const toggle = (who: keyof Triple, bit: keyof Perm) => {
    setPerms((prev) => ({
      ...prev,
      [who]: { ...prev[who], [bit]: !prev[who][bit] },
    }));
  };

  const applyOctal = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length < 3) return;
    const padded = cleaned.padStart(4, "0");
    const special = cleaned.length === 4 ? Number(padded[0]) : 0;
    const o = Number(cleaned.length === 4 ? padded[1] : cleaned[0]);
    const g = Number(cleaned.length === 4 ? padded[2] : cleaned[1]);
    const p = Number(cleaned.length === 4 ? padded[3] : cleaned[2]);
    if ([o, g, p].some((n) => n > 7)) return;
    setSetuid((special & 4) !== 0);
    setSetgid((special & 2) !== 0);
    setSticky((special & 1) !== 0);
    setPerms({ owner: fromDigit(o), group: fromDigit(g), public: fromDigit(p) });
  }, []);

  const rows: { key: keyof Triple; label: string }[] = [
    { key: "owner", label: "Owner" },
    { key: "group", label: "Group" },
    { key: "public", label: "Public" },
  ];

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

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.octal}
            onClick={() => applyOctal(p.octal)}
            className="px-3 py-1 rounded-full text-xs border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--bg-surface)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wider text-[var(--text-muted)]">
              <th className="text-left p-3 font-medium">Class</th>
              <th className="p-3 font-medium">Read (4)</th>
              <th className="p-3 font-medium">Write (2)</th>
              <th className="p-3 font-medium">Execute (1)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ key, label }) => (
              <tr key={key} className="border-b border-[var(--border)] last:border-0">
                <td className="p-3 text-[var(--text-primary)]">{label}</td>
                {(["r", "w", "x"] as const).map((bit) => (
                  <td key={bit} className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={perms[key][bit]}
                      onChange={() => toggle(key, bit)}
                      className="h-4 w-4 accent-[#6366f1]"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={setuid} onChange={(e) => setSetuid(e.target.checked)} />
          Setuid
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={setgid} onChange={(e) => setSetgid(e.target.checked)} />
          Setgid
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={sticky} onChange={(e) => setSticky(e.target.checked)} />
          Sticky bit
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Octal", value: octal },
          { label: "Symbolic", value: sym },
          { label: "Command", value: command },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
              <CopyChip value={value} label={label} />
            </div>
            {label === "Octal" ? (
              <input
                value={octal}
                onChange={(e) => applyOctal(e.target.value)}
                className="mono text-lg text-[var(--text-primary)] bg-transparent focus:outline-none"
              />
            ) : (
              <code className="mono text-lg text-[var(--text-primary)]">{value}</code>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
