import Link from "next/link";
import { ICON_MAP, type IconName } from "@/lib/icons";
import type { Tool } from "@/lib/tools";
import { CATEGORY_LABELS } from "@/lib/tools";

function ToolIcon({ name }: { name: string }) {
  const Icon = ICON_MAP[name as IconName] as React.ComponentType<{ size?: number; className?: string }> | undefined;
  if (!Icon) return null;
  return <Icon size={20} className="text-[#6366f1]" />;
}

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group relative flex flex-col gap-4 p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[#6366f1]/40 hover:bg-[var(--bg-elevated)] transition-all duration-150"
    >
      {/* Top row: icon + category / New tag */}
      <div className="flex items-start justify-between gap-2">
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#6366f1]/10 group-hover:bg-[#6366f1]/20 transition-colors duration-150">
          <ToolIcon name={tool.icon} />
        </div>
        <div className="flex items-center gap-1.5">
          {tool.isNew && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6366f1] bg-[#6366f1]/10 px-1.5 py-0.5 rounded">
              New
            </span>
          )}
          <span className="text-[10px] font-medium text-[var(--text-muted)] group-hover:text-[#6366f1] transition-colors duration-150 capitalize">
            {CATEGORY_LABELS[tool.category]}
          </span>
        </div>
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
    </Link>
  );
}
