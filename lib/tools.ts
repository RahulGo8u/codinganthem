export type ToolCategory =
  | "formatters"
  | "encoders"
  | "generators"
  | "converters"
  | "text";

export type Tool = {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string; // lucide-react icon name
  keywords: string[];
};

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  formatters: "Formatters",
  encoders: "Encoders",
  generators: "Generators",
  converters: "Converters",
  text: "Text Utils",
};

export const tools: Tool[] = [
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    description: "Format, validate, and minify JSON instantly",
    category: "formatters",
    icon: "Braces",
    keywords: ["json", "format", "validate", "beautify", "minify", "pretty"],
  },
  {
    slug: "base64",
    name: "Base64 Encoder / Decoder",
    description: "Encode and decode text or files to and from Base64",
    category: "encoders",
    icon: "ArrowLeftRight",
    keywords: ["base64", "encode", "decode", "btoa", "atob"],
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    description: "Generate one or multiple UUIDs (v4) instantly",
    category: "generators",
    icon: "Fingerprint",
    keywords: ["uuid", "guid", "generate", "unique", "id", "random"],
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    description: "Generate strong, random passwords with custom rules",
    category: "generators",
    icon: "KeyRound",
    keywords: ["password", "generate", "random", "secure", "strength"],
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes",
    category: "generators",
    icon: "Hash",
    keywords: ["hash", "md5", "sha256", "sha512", "sha1", "checksum", "crypto"],
  },
  {
    slug: "timestamp-converter",
    name: "Unix Timestamp Converter",
    description: "Convert Unix timestamps to human dates and back",
    category: "converters",
    icon: "Clock",
    keywords: ["timestamp", "unix", "epoch", "date", "time", "convert"],
  },
  {
    slug: "color-converter",
    name: "Color Converter",
    description: "Convert colors between HEX, RGB, and HSL formats",
    category: "converters",
    icon: "Palette",
    keywords: ["color", "hex", "rgb", "hsl", "convert", "colour"],
  },
  {
    slug: "regex-tester",
    name: "Regex Tester",
    description: "Test regular expressions with live match highlighting",
    category: "text",
    icon: "Regex",
    keywords: ["regex", "regexp", "regular expression", "pattern", "match", "test"],
  },
  {
    slug: "case-converter",
    name: "Case Converter",
    description: "Convert text between camelCase, snake_case, PascalCase, and more",
    category: "text",
    icon: "CaseSensitive",
    keywords: ["case", "camel", "snake", "pascal", "kebab", "upper", "lower", "convert"],
  },
  {
    slug: "text-diff",
    name: "Text Diff",
    description: "Compare two texts and highlight the differences",
    category: "text",
    icon: "GitCompare",
    keywords: ["diff", "compare", "text", "difference", "changes"],
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return tools.filter((t) => t.category === category);
}
