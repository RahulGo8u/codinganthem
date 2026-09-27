import Link from "next/link";

export function DataFlowNotice({
  destination = "a third-party AI service",
}: {
  destination?: string;
}) {
  return (
    <div
      role="note"
      className="flex items-start gap-2 rounded-lg border border-[#f59e0b]/35 bg-[#f59e0b]/8 px-3 py-2.5 text-xs leading-relaxed text-[var(--text-muted)]"
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
        className="mt-0.5 shrink-0 text-[#f59e0b]"
      >
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z" />
      </svg>
      <span>
        Your input is sent to {destination} to generate the result. Do not paste
        secrets or confidential data.{" "}
        <Link href="/privacy" className="text-[var(--accent-text)] hover:underline">
          Privacy details
        </Link>
      </span>
    </div>
  );
}
