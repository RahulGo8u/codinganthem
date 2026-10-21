const RAW = `{"id":1,"name":"CodingAnthem","tags":["fast","free","private"],"active":true}`;
const FORMATTED = JSON.stringify(JSON.parse(RAW), null, 2);

/**
 * Static preview of a JSON formatter result. Keeping the above-the-fold demo
 * stable avoids continuous timer-driven renders while the page establishes
 * its Largest Contentful Paint.
 */
export function HeroDemo() {
  return (
    <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-left" aria-hidden="true">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
        <div className="px-3 py-2 border-b border-[var(--border)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
          Input
        </div>
        <pre className="mono text-xs p-3 h-36 overflow-hidden text-[var(--text-primary)] whitespace-pre-wrap break-words leading-relaxed">
          {RAW}
        </pre>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
        <div className="px-3 py-2 border-b border-[var(--border)] flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Output</span>
          <span className="text-[10px] text-[#22c55e]">● Valid JSON</span>
        </div>
        <pre className="mono text-xs p-3 h-36 overflow-hidden text-[var(--text-primary)] whitespace-pre-wrap break-words leading-relaxed">
          {FORMATTED}
        </pre>
      </div>
    </div>
  );
}
