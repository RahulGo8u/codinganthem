import Link from "next/link";
import * as Icons from "lucide-react";
import { ArrowRight } from "lucide-react";
import type { Tool } from "@/lib/tools";
import { CATEGORY_LABELS } from "@/lib/tools";

type IconName = keyof typeof Icons;

function ToolIcon({ name }: { name: string }) {
  const Icon = Icons[name as IconName] as React.ComponentType<{ size?: number; className?: string }> | undefined;
  if (!Icon) return null;
  return <Icon size={18} className="text-[#6366f1]" />;
}

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group relative flex flex-col gap-4 p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[#6366f1]/40 hover:bg-[var(--bg-elevated)] transition-all duration-150"
    >
      {/* Top row: icon + arrow */}
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#6366f1]/10 group-hover:bg-[#6366f1]/20 transition-colors duration-150">
          <ToolIcon name={tool.icon} />
        </div>
        <ArrowRight
          size={14}
          className="text-[var(--border)] group-hover:text-[#6366f1] group-hover:translate-x-0.5 transition-all duration-150 mt-1"
        />
      </div>

      {/* Text */}
      <div className="flex flex-col gap-1.5">
        <h3 className="text-sm font-semibold leading-snug">
          {tool.name}
        </h3>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2">
          {tool.description}
        </p>
      </div>

      {/* Category badge */}
      <div className="mt-auto">
        <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border)] capitalize group-hover:border-[#6366f1]/30 group-hover:text-[#6366f1] transition-colors duration-150">
          {CATEGORY_LABELS[tool.category]}
        </span>
      </div>
    </Link>
  );
}
