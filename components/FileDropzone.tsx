"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export function FileDropzone({
  accept,
  onFile,
  title,
  description,
  disabled = false,
  children,
}: {
  accept: string;
  onFile: (file: File) => void;
  title: string;
  description?: string;
  disabled?: boolean;
  children?: ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function open() {
    if (!disabled) inputRef.current?.click();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open();
    }
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label={title}
      onClick={open}
      onKeyDown={handleKeyDown}
      onDragOver={(event) => {
        if (disabled) return;
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (disabled) return;
        const file = event.dataTransfer.files?.[0];
        if (file) onFile(file);
      }}
      className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
        disabled
          ? "cursor-not-allowed opacity-50 border-[var(--border)]"
          : dragging
            ? "cursor-copy border-[#6366f1] bg-[#6366f1]/10"
            : "cursor-pointer border-[var(--border)] bg-[var(--bg-surface)] hover:border-[#6366f1]/50"
      }`}
    >
      {children ?? (
        <>
          <p className="text-sm font-medium text-[var(--text-primary)]">{title}</p>
          {description && (
            <p className="mt-1 text-xs text-[var(--text-muted)]">{description}</p>
          )}
          <span className="mt-3 inline-flex rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)]">
            Choose file
          </span>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}
