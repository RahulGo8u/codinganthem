export interface Segment<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  segments,
  label,
  compact = false,
}: {
  value: T;
  onChange: (value: T) => void;
  segments: Segment<T>[];
  label: string;
  compact?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-1"
    >
      {segments.map((segment) => (
        <button
          key={segment.value}
          type="button"
          disabled={segment.disabled}
          aria-pressed={value === segment.value}
          onClick={() => onChange(segment.value)}
          className={`${compact ? "px-2 py-1 text-[11px]" : "px-3 py-1.5 text-xs"} rounded-md font-medium transition-colors disabled:opacity-40 ${
            value === segment.value
              ? "bg-[var(--bg-base)] text-[var(--text-primary)] border border-[var(--border)]"
              : "text-[var(--text-muted)] border border-transparent hover:text-[var(--text-primary)]"
          }`}
        >
          {segment.label}
        </button>
      ))}
    </div>
  );
}
