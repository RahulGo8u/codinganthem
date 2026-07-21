"use client";

import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { addRecentTool } from "@/components/CommandPalette";
import { getToolBySlug, getRelatedTools } from "@/lib/tools";
import { ToolCard } from "@/components/ToolCard";
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
  "url-encoder": dynamic(() =>
    import("@/components/tools/UrlEncoderDecoder").then((m) => ({ default: m.UrlEncoderDecoder }))
  ),
  "jwt-decoder": dynamic(() =>
    import("@/components/tools/JwtDecoder").then((m) => ({ default: m.JwtDecoder }))
  ),
  "base-converter": dynamic(() =>
    import("@/components/tools/BaseConverter").then((m) => ({ default: m.BaseConverter }))
  ),
  "lorem-ipsum": dynamic(() =>
    import("@/components/tools/LoremIpsumGenerator").then((m) => ({ default: m.LoremIpsumGenerator }))
  ),
  "csv-to-json": dynamic(() =>
    import("@/components/tools/CsvToJson").then((m) => ({ default: m.CsvToJson }))
  ),
  "html-entities": dynamic(() =>
    import("@/components/tools/HtmlEntities").then((m) => ({ default: m.HtmlEntities }))
  ),
  "yaml-to-json": dynamic(() =>
    import("@/components/tools/YamlToJson").then((m) => ({ default: m.YamlToJson }))
  ),
  "markdown-preview": dynamic(() =>
    import("@/components/tools/MarkdownPreviewer").then((m) => ({ default: m.MarkdownPreviewer }))
  ),
  "word-counter": dynamic(() =>
    import("@/components/tools/WordCounter").then((m) => ({ default: m.WordCounter }))
  ),
  "json-to-yaml": dynamic(() =>
    import("@/components/tools/JsonToYaml").then((m) => ({ default: m.JsonToYaml }))
  ),
  "json-to-csv": dynamic(() =>
    import("@/components/tools/JsonToCsv").then((m) => ({ default: m.JsonToCsv }))
  ),
  "url-parser": dynamic(() =>
    import("@/components/tools/UrlParser").then((m) => ({ default: m.UrlParser }))
  ),
  "slug-generator": dynamic(() =>
    import("@/components/tools/SlugGenerator").then((m) => ({ default: m.SlugGenerator }))
  ),
  "cron-parser": dynamic(() =>
    import("@/components/tools/CronParser").then((m) => ({ default: m.CronParser }))
  ),
  "string-escape": dynamic(() =>
    import("@/components/tools/StringEscape").then((m) => ({ default: m.StringEscape }))
  ),
  "jwt-generator": dynamic(() =>
    import("@/components/tools/JwtGenerator").then((m) => ({ default: m.JwtGenerator }))
  ),
  "json-statistics": dynamic(() =>
    import("@/components/tools/JsonStatistics").then((m) => ({ default: m.JsonStatistics }))
  ),
  "json-diff": dynamic(() =>
    import("@/components/tools/JsonDiff").then((m) => ({ default: m.JsonDiff }))
  ),
  "qr-code-generator": dynamic(() =>
    import("@/components/tools/QrCodeGenerator").then((m) => ({ default: m.QrCodeGenerator }))
  ),
  "sql-formatter": dynamic(() =>
    import("@/components/tools/SqlFormatter").then((m) => ({ default: m.SqlFormatter }))
  ),
  "image-to-base64": dynamic(() =>
    import("@/components/tools/ImageToBase64").then((m) => ({ default: m.ImageToBase64 }))
  ),
  "jwt-validator": dynamic(() =>
    import("@/components/tools/JwtValidator").then((m) => ({ default: m.JwtValidator }))
  ),
  "js-formatter": dynamic(() =>
    import("@/components/tools/JsFormatter").then((m) => ({ default: m.JsFormatter }))
  ),
  "html-formatter": dynamic(() =>
    import("@/components/tools/HtmlFormatter").then((m) => ({ default: m.HtmlFormatter }))
  ),
  "css-formatter": dynamic(() =>
    import("@/components/tools/CssFormatter").then((m) => ({ default: m.CssFormatter }))
  ),
  "sql-in-generator": dynamic(() =>
    import("@/components/tools/SqlInGenerator").then((m) => ({ default: m.SqlInGenerator }))
  ),
  "json-to-typescript": dynamic(() =>
    import("@/components/tools/JsonToTypeScript").then((m) => ({ default: m.JsonToTypeScript }))
  ),
  "curl-to-fetch": dynamic(() =>
    import("@/components/tools/CurlToFetch").then((m) => ({ default: m.CurlToFetch }))
  ),
  "mermaid-viewer": dynamic(() =>
    import("@/components/tools/MermaidViewer").then((m) => ({ default: m.MermaidViewer }))
  ),
  "totp-generator": dynamic(() =>
    import("@/components/tools/TotpGenerator").then((m) => ({ default: m.TotpGenerator }))
  ),
  "user-agent-parser": dynamic(() =>
    import("@/components/tools/UserAgentParser").then((m) => ({ default: m.UserAgentParser }))
  ),
  "xml-formatter": dynamic(() =>
    import("@/components/tools/XmlFormatter").then((m) => ({ default: m.XmlFormatter }))
  ),
  "prompt-template-filler": dynamic(() =>
    import("@/components/tools/PromptTemplateFiller").then((m) => ({ default: m.PromptTemplateFiller }))
  ),
  "mock-data-generator": dynamic(() =>
    import("@/components/tools/MockDataGenerator").then((m) => ({ default: m.MockDataGenerator }))
  ),
  "token-counter": dynamic(() =>
    import("@/components/tools/TokenCounter").then((m) => ({ default: m.TokenCounter }))
  ),
  "xml-to-json": dynamic(() =>
    import("@/components/tools/XmlToJson").then((m) => ({ default: m.XmlToJson }))
  ),
  "color-contrast-checker": dynamic(() =>
    import("@/components/tools/ColorContrastChecker").then((m) => ({ default: m.ColorContrastChecker }))
  ),
  "url-shortener": dynamic(() =>
    import("@/components/tools/UrlShortener").then((m) => ({ default: m.UrlShortener }))
  ),
  "ai-code-explainer": dynamic(() =>
    import("@/components/tools/AiCodeExplainer").then((m) => ({ default: m.AiCodeExplainer }))
  ),
  "ai-sql-generator": dynamic(() =>
    import("@/components/tools/AiSqlGenerator").then((m) => ({ default: m.AiSqlGenerator }))
  ),
  "ai-error-explainer": dynamic(() =>
    import("@/components/tools/AiErrorExplainer").then((m) => ({ default: m.AiErrorExplainer }))
  ),
  "eth-unit-converter": dynamic(() =>
    import("@/components/tools/EthUnitConverter").then((m) => ({ default: m.EthUnitConverter }))
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

  const related = getRelatedTools(slug, tool.category);

  return (
    <>
      <ToolComponent />
      {related.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pb-12 mt-10">
          <div className="border-t border-[var(--border)] pt-10">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">
              Related tools
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {related.map((t) => (
                <ToolCard key={t.slug} tool={t} />
              ))}
            </div>
          </div>
        </div>
      )}

      {tool.explainer && (
        <div className="max-w-7xl mx-auto px-6 pb-16">
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
