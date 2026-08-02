import type { ButtonHTMLAttributes } from "react";

interface DownloadButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  compact?: boolean;
}

/** Consistent high-emphasis action for every downloadable tool output. */
export function DownloadButton({
  compact = false,
  className = "",
  children,
  type = "button",
  ...props
}: DownloadButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold border border-[#6366f1]/60 bg-[#6366f1] text-white shadow-sm shadow-[#6366f1]/20 hover:bg-[#4f46e5] hover:border-[#4f46e5] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all ${
        compact ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm"
      } ${className}`}
      {...props}
    >
      <svg
        width={compact ? 12 : 14}
        height={compact ? 12 : 14}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
      </svg>
      {children}
    </button>
  );
}
