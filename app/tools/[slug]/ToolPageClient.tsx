"use client";

import { notFound } from "next/navigation";
import { addRecentTool } from "@/components/CommandPalette";
import { getToolBySlug } from "@/lib/tools";
import { useEffect } from "react";

import { JsonFormatter } from "@/components/tools/JsonFormatter";
import { Base64Tool } from "@/components/tools/Base64Tool";
import { UuidGenerator } from "@/components/tools/UuidGenerator";
import { PasswordGenerator } from "@/components/tools/PasswordGenerator";
import { HashGenerator } from "@/components/tools/HashGenerator";
import { TimestampConverter } from "@/components/tools/TimestampConverter";
import { ColorConverter } from "@/components/tools/ColorConverter";
import { RegexTester } from "@/components/tools/RegexTester";
import { CaseConverter } from "@/components/tools/CaseConverter";
import { TextDiff } from "@/components/tools/TextDiff";

const TOOL_MAP: Record<string, React.ComponentType> = {
  "json-formatter": JsonFormatter,
  "base64": Base64Tool,
  "uuid-generator": UuidGenerator,
  "password-generator": PasswordGenerator,
  "hash-generator": HashGenerator,
  "timestamp-converter": TimestampConverter,
  "color-converter": ColorConverter,
  "regex-tester": RegexTester,
  "case-converter": CaseConverter,
  "text-diff": TextDiff,
};

export function ToolPageClient({ slug }: { slug: string }) {
  const tool = getToolBySlug(slug);

  useEffect(() => {
    if (slug) addRecentTool(slug);
  }, [slug]);

  if (!tool) return notFound();

  const ToolComponent = TOOL_MAP[slug];
  if (!ToolComponent) return notFound();

  return <ToolComponent />;
}
