"use client";

import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { addRecentTool } from "@/components/CommandPalette";
import { getToolBySlug } from "@/lib/tools";
import { useEffect } from "react";

const TOOL_MAP: Record<string, React.ComponentType> = {
  "json-formatter": dynamic(() =>
    import("@/components/tools/JsonFormatter").then((m) => ({ default: m.JsonFormatter }))
  ),
  "base64": dynamic(() =>
    import("@/components/tools/Base64Tool").then((m) => ({ default: m.Base64Tool }))
  ),
  "uuid-generator": dynamic(() =>
    import("@/components/tools/UuidGenerator").then((m) => ({ default: m.UuidGenerator }))
  ),
  "password-generator": dynamic(() =>
    import("@/components/tools/PasswordGenerator").then((m) => ({ default: m.PasswordGenerator }))
  ),
  "hash-generator": dynamic(() =>
    import("@/components/tools/HashGenerator").then((m) => ({ default: m.HashGenerator }))
  ),
  "timestamp-converter": dynamic(() =>
    import("@/components/tools/TimestampConverter").then((m) => ({ default: m.TimestampConverter }))
  ),
  "color-converter": dynamic(() =>
    import("@/components/tools/ColorConverter").then((m) => ({ default: m.ColorConverter }))
  ),
  "regex-tester": dynamic(() =>
    import("@/components/tools/RegexTester").then((m) => ({ default: m.RegexTester }))
  ),
  "case-converter": dynamic(() =>
    import("@/components/tools/CaseConverter").then((m) => ({ default: m.CaseConverter }))
  ),
  "text-diff": dynamic(() =>
    import("@/components/tools/TextDiff").then((m) => ({ default: m.TextDiff }))
  ),
};

export function ToolPageClient({ slug }: { slug: string }) {
  const tool = getToolBySlug(slug);

  useEffect(() => {
    if (slug) addRecentTool(slug);
  }, [slug]);

  if (!tool) return notFound();

  const ToolComponent = TOOL_MAP[slug];
  if (!ToolComponent) return notFound();

  return (
    <>
      <ToolComponent />
      {tool.explainer && (
        <div className="max-w-7xl mx-auto px-6 pb-12">
          <div className="border-t border-[var(--border)] pt-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
              About {tool.name}
            </h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-3xl whitespace-pre-line">
              {tool.explainer}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
