"use client";

import { useMemo, useState } from "react";
import { ToolShell } from "@/components/ToolShell";
import { CopyChip } from "@/components/CopyChip";
import { getToolBySlug } from "@/lib/tools";
import { parseCidr } from "@/lib/cidr";

const tool = getToolBySlug("cidr-calculator")!;

const EXAMPLES = ["192.168.1.0/24", "10.0.0.0/8", "172.16.5.10/32", "10.1.1.0/31"];

export function CidrCalculator() {
  const [input, setInput] = useState("192.168.1.0/24");
  const parsed = useMemo(() => {
    try {
      return { info: parseCidr(input), error: "" };
    } catch (err) {
      return { info: null, error: err instanceof Error ? err.message : "Invalid CIDR." };
    }
  }, [input]);

  const output = parsed.info
    ? [
        `Network: ${parsed.info.network}`,
        `Broadcast: ${parsed.info.broadcast}`,
        `First host: ${parsed.info.firstHost}`,
        `Last host: ${parsed.info.lastHost}`,
        `Netmask: ${parsed.info.netmask}`,
        `Usable hosts: ${parsed.info.usableHosts}`,
      ].join("\n")
    : "";

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      error={parsed.error || undefined}
      hideInputPane
      hideFileActions
      outputLabel="Subnet details"
      downloadFileName="subnet.txt"
      outputContent={
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-muted)]">
            IPv4 CIDR
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              spellCheck={false}
              aria-label="IPv4 CIDR"
              placeholder="192.168.1.0/24"
              className="mono h-11 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-primary)]"
            />
          </label>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setInput(example)}
                className="rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                {example}
              </button>
            ))}
          </div>
          {parsed.info && (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                <Result label="Network" value={parsed.info.network} />
                <Result label="Broadcast" value={parsed.info.broadcast} />
                <Result label="First host" value={parsed.info.firstHost} />
                <Result label="Last host" value={parsed.info.lastHost} />
                <Result label="Netmask" value={parsed.info.netmask} />
                <Result label="Wildcard" value={parsed.info.wildcard} />
                <Result label="Total addresses" value={parsed.info.totalAddresses.toLocaleString()} copyValue={String(parsed.info.totalAddresses)} />
                <Result label="Usable hosts" value={parsed.info.usableHosts.toLocaleString()} copyValue={String(parsed.info.usableHosts)} />
              </div>
              <p className="text-xs leading-relaxed text-[var(--text-muted)]">{parsed.info.note}</p>
            </>
          )}
        </div>
      }
    />
  );
}

function Result({ label, value, copyValue = value }: { label: string; value: string; copyValue?: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="mono text-sm text-[var(--text-primary)]">{value}</p>
        <CopyChip value={copyValue} label={label} />
      </div>
    </div>
  );
}
