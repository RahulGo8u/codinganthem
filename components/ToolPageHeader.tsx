import type { ReactNode } from "react";
import type { Tool } from "@/lib/tools";
import { Breadcrumb } from "@/components/Breadcrumb";

/**
 * Standard page chrome for custom-layout tools (non-ToolShell):
 * breadcrumb (not H1) + large title + optional description / trailing actions.
 */
export function ToolPageHeader({
  tool,
  trailing,
  showDescription = true,
}: {
  tool: Tool;
  trailing?: ReactNode;
  showDescription?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Breadcrumb current={tool.name} asHeading={false} />
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1.5 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
            {tool.name}
          </h1>
          {showDescription && tool.description && (
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-2xl">
              {tool.description}
            </p>
          )}
        </div>
        {trailing}
      </div>
    </div>
  );
}
