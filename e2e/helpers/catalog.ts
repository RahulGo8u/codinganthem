import { tools } from "../../lib/tools";

/** Every slug from the product registry. */
export const ALL_SLUGS = tools.map((t) => t.slug);

export function toolName(slug: string): string {
  const t = tools.find((x) => x.slug === slug);
  if (!t) throw new Error(`Unknown tool slug: ${slug}`);
  return t.name;
}

/**
 * Tools validated primarily via "Load sample" (or prefilled sample) in
 * tools-with-sample.spec.ts. Deep-compare tools are intentionally omitted
 * here — they have dedicated specs.
 */
export const LOAD_SAMPLE_SLUGS = [
  "json-formatter",
  "base64",
  "hash-generator",
  "timestamp-converter",
  "color-converter",
  "case-converter",
  "url-encoder",
  "jwt-decoder",
  "base-converter",
  "csv-to-json",
  "html-entities",
  "yaml-to-json",
  "markdown-preview",
  "word-counter",
  "json-to-yaml",
  "json-to-csv",
  "url-parser",
  "slug-generator",
  "cron-parser",
  "string-escape",
  "json-statistics",
  "qr-code-generator",
  "sql-formatter",
  "jwt-validator",
  "js-formatter",
  "html-formatter",
  "css-formatter",
  "sql-in-generator",
  "json-to-typescript",
  "curl-to-fetch",
  "mermaid-viewer",
  "user-agent-parser",
  "xml-formatter",
  "prompt-template-filler",
  "token-counter",
  "xml-to-json",
] as const;

/** Covered by dedicated interaction specs (not the Load-sample table). */
export const DEDICATED_INTERACTION_SLUGS = [
  // Existing deep specs
  "json-diff",
  "text-diff",
  "pdf-compare",
  "regex-tester",
  // Generators / custom / image / API
  "uuid-generator",
  "password-generator",
  "lorem-ipsum",
  "mock-data-generator",
  "bcrypt-generator",
  "jwt-generator",
  "totp-generator",
  "chmod-calculator",
  "css-gradient-generator",
  "meta-tag-generator",
  "color-contrast-checker",
  "eth-unit-converter",
  "image-to-base64",
  "image-compressor",
  "image-resizer",
  "favicon-generator",
  "url-shortener",
  "ai-code-explainer",
  "ai-sql-generator",
  "ai-error-explainer",
] as const;

export const INTERACTION_SLUGS = new Set<string>([
  ...LOAD_SAMPLE_SLUGS,
  ...DEDICATED_INTERACTION_SLUGS,
]);
