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
  explainer: string; // short SEO paragraph shown below the tool
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
    explainer:
      "Format, validate, and transform JSON instantly — no setup, no server.\n\n• Paste messy JSON to get it properly indented and readable\n• Syntax errors are shown in plain English so you know exactly what's wrong\n• Sort keys alphabetically to normalize structure before diffing or storing\n• Minify to strip whitespace before sending payloads to an API",
  },
  {
    slug: "base64",
    name: "Base64 Encoder / Decoder",
    description: "Encode and decode text or files to and from Base64",
    category: "encoders",
    icon: "ArrowLeftRight",
    keywords: ["base64", "encode", "decode", "btoa", "atob"],
    explainer:
      "Encode or decode Base64 in one click — entirely in your browser.\n\n• Encode plain text to Base64 for use in JWTs, data URLs, or auth headers\n• Decode a Base64 string back to its original form instantly\n• Switch between encode and decode mode with one click\n• Nothing is sent to a server — all processing stays local",
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    description: "Generate one or multiple UUIDs (v4) instantly",
    category: "generators",
    icon: "Fingerprint",
    keywords: ["uuid", "guid", "generate", "unique", "id", "random"],
    explainer:
      "Generate one or hundreds of v4 UUIDs instantly — no libraries needed.\n\n• Cryptographically random — collisions are statistically impossible\n• Use as database primary keys, session tokens, or request IDs\n• Generate up to 100 at once and copy them all in one click\n• Runs entirely in the browser using the native crypto API",
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    description: "Generate strong, random passwords with custom rules",
    category: "generators",
    icon: "KeyRound",
    keywords: ["password", "generate", "random", "secure", "strength"],
    explainer:
      "Generate strong, random passwords using the Web Crypto API — the same standard used by password managers.\n\n• Customize length up to 128 characters\n• Choose character sets: uppercase, lowercase, numbers, symbols\n• Strength indicator shows how secure each password is\n• Generate multiple passwords at once — nothing is stored or transmitted",
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes",
    category: "generators",
    icon: "Hash",
    keywords: ["hash", "md5", "sha256", "sha512", "sha1", "checksum", "crypto"],
    explainer:
      "Compute cryptographic hashes instantly — live as you type.\n\n• SHA-256 and SHA-512 use the browser's native Web Crypto API\n• MD5 and SHA-1 included for legacy compatibility (not recommended for security use)\n• Any single character change produces a completely different hash\n• Common uses: checksums, file integrity verification, password storage",
  },
  {
    slug: "timestamp-converter",
    name: "Unix Timestamp Converter",
    description: "Convert Unix timestamps to human dates and back",
    category: "converters",
    icon: "Clock",
    keywords: ["timestamp", "unix", "epoch", "date", "time", "convert"],
    explainer:
      "Convert Unix timestamps to readable dates and back — instantly.\n\n• Paste a timestamp (seconds or milliseconds) to see it in local time, UTC, and ISO 8601\n• Enter any date string to get its Unix timestamp\n• Timestamps are timezone-independent — the standard for APIs, databases, and logs\n• Current time shown automatically so you always have a reference point",
  },
  {
    slug: "color-converter",
    name: "Color Converter",
    description: "Convert colors between HEX, RGB, and HSL formats",
    category: "converters",
    icon: "Palette",
    keywords: ["color", "hex", "rgb", "hsl", "convert", "colour"],
    explainer:
      "Convert any color between HEX, RGB, and HSL instantly — with a live preview.\n\n• Paste a HEX code, RGB value, or HSL string to get all three formats at once\n• Live color swatch updates as you type\n• Copy any format individually with one click\n• Useful when switching between CSS, Figma, Tailwind, and image processing tools",
  },
  {
    slug: "regex-tester",
    name: "Regex Tester",
    description: "Test regular expressions with live match highlighting",
    category: "text",
    icon: "Regex",
    keywords: ["regex", "regexp", "regular expression", "pattern", "match", "test"],
    explainer:
      "Test and debug regular expressions in real time — no console needed.\n\n• See all matches highlighted as you type the pattern\n• Toggle flags: global (g), case insensitive (i), multiline (m)\n• Match count and positions shown for each result\n• Works with any regex supported by JavaScript's RegExp engine",
  },
  {
    slug: "case-converter",
    name: "Case Converter",
    description: "Convert text between camelCase, snake_case, PascalCase, and more",
    category: "text",
    icon: "CaseSensitive",
    keywords: ["case", "camel", "snake", "pascal", "kebab", "upper", "lower", "convert"],
    explainer:
      "Convert text between any naming convention instantly — paste a whole list at once.\n\n• Supports camelCase, snake_case, PascalCase, kebab-case, UPPER_CASE, and more\n• Multi-line input — convert an entire list of variable names in one go\n• Useful when migrating codebases, renaming API fields, or generating slugs\n• Results update live as you type",
  },
  {
    slug: "text-diff",
    name: "Text Diff",
    description: "Compare two texts and highlight the differences",
    category: "text",
    icon: "GitCompare",
    keywords: ["diff", "compare", "text", "difference", "changes"],
    explainer:
      "Spot exactly what changed between two texts — line by line, instantly.\n\n• Added lines highlighted in green, removed in red — same style as Git diffs\n• Paste config files, API responses, code snippets, or any two blocks of text\n• Useful for reviewing changes before committing or debugging response differences\n• No size limit — compares as much text as you paste",
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return tools.filter((t) => t.category === category);
}
