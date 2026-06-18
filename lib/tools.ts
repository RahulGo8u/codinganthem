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
      "Paste any JSON string to instantly format it with proper indentation, making it easy to read and debug. The validator highlights syntax errors with plain-English messages so you know exactly what to fix. You can also sort keys alphabetically or minify JSON to reduce payload size — useful before sending data to an API or storing it in a database.",
  },
  {
    slug: "base64",
    name: "Base64 Encoder / Decoder",
    description: "Encode and decode text or files to and from Base64",
    category: "encoders",
    icon: "ArrowLeftRight",
    keywords: ["base64", "encode", "decode", "btoa", "atob"],
    explainer:
      "Base64 is an encoding scheme that converts binary data into ASCII text, commonly used in data URLs, email attachments, JWT tokens, and HTTP Basic Authentication headers. Use this tool to encode plain text or file contents to Base64, or decode a Base64 string back to its original form. All encoding happens in your browser — nothing is sent to a server.",
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    description: "Generate one or multiple UUIDs (v4) instantly",
    category: "generators",
    icon: "Fingerprint",
    keywords: ["uuid", "guid", "generate", "unique", "id", "random"],
    explainer:
      "A UUID (Universally Unique Identifier) is a 128-bit identifier used to uniquely label resources in software systems without central coordination. Version 4 UUIDs are randomly generated, making collisions statistically impossible. Use them as primary keys in databases, session tokens, or any scenario where a unique ID is needed. Generate up to 100 UUIDs at once and copy them all with one click.",
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    description: "Generate strong, random passwords with custom rules",
    category: "generators",
    icon: "KeyRound",
    keywords: ["password", "generate", "random", "secure", "strength"],
    explainer:
      "Generate cryptographically strong random passwords using the Web Crypto API — the same standard used by password managers. Customize the length (up to 128 characters) and choose which character sets to include: uppercase, lowercase, numbers, and symbols. A strength indicator shows how secure the generated password is. Nothing is stored or transmitted — passwords are generated entirely in your browser.",
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes",
    category: "generators",
    icon: "Hash",
    keywords: ["hash", "md5", "sha256", "sha512", "sha1", "checksum", "crypto"],
    explainer:
      "A cryptographic hash function converts any input into a fixed-length string (the hash). Even a single character change in the input produces a completely different hash. Common uses include verifying file integrity, storing passwords securely, and generating checksums. SHA-256 and SHA-512 use the browser's native Web Crypto API for fast, secure hashing. MD5 and SHA-1 are provided for legacy compatibility — they are not recommended for security-sensitive use.",
  },
  {
    slug: "timestamp-converter",
    name: "Unix Timestamp Converter",
    description: "Convert Unix timestamps to human dates and back",
    category: "converters",
    icon: "Clock",
    keywords: ["timestamp", "unix", "epoch", "date", "time", "convert"],
    explainer:
      "A Unix timestamp is the number of seconds (or milliseconds) elapsed since January 1, 1970 00:00:00 UTC — also known as the Unix epoch. It is the standard way to represent time in databases, APIs, and log files because it is timezone-independent. This tool converts a Unix timestamp to a human-readable date in local time, UTC, and ISO 8601 format, and also converts any date string back to its Unix timestamp.",
  },
  {
    slug: "color-converter",
    name: "Color Converter",
    description: "Convert colors between HEX, RGB, and HSL formats",
    category: "converters",
    icon: "Palette",
    keywords: ["color", "hex", "rgb", "hsl", "convert", "colour"],
    explainer:
      "Web colors can be expressed in multiple formats: HEX (e.g. #6366f1), RGB (e.g. rgb(99, 102, 241)), and HSL (e.g. hsl(239, 84%, 67%)). Different tools and languages expect different formats — CSS commonly uses HEX or HSL, while image processing libraries often prefer RGB. Enter any color value and instantly get all three formats with a live color preview.",
  },
  {
    slug: "regex-tester",
    name: "Regex Tester",
    description: "Test regular expressions with live match highlighting",
    category: "text",
    icon: "Regex",
    keywords: ["regex", "regexp", "regular expression", "pattern", "match", "test"],
    explainer:
      "Regular expressions (regex) are patterns used to match, search, and manipulate text. They are supported in every major programming language and are used for input validation, log parsing, search-and-replace, and data extraction. Enter your pattern and test string to see all matches in real time. Toggle flags like global (g), case insensitive (i), and multiline (m) to refine your expression.",
  },
  {
    slug: "case-converter",
    name: "Case Converter",
    description: "Convert text between camelCase, snake_case, PascalCase, and more",
    category: "text",
    icon: "CaseSensitive",
    keywords: ["case", "camel", "snake", "pascal", "kebab", "upper", "lower", "convert"],
    explainer:
      "Different programming languages and conventions use different naming styles. JavaScript typically uses camelCase for variables, Python prefers snake_case, and class names use PascalCase across most languages. URL slugs and CSS class names use kebab-case. This tool converts text between all common case formats instantly, and supports multiple lines so you can convert a whole list at once.",
  },
  {
    slug: "text-diff",
    name: "Text Diff",
    description: "Compare two texts and highlight the differences",
    category: "text",
    icon: "GitCompare",
    keywords: ["diff", "compare", "text", "difference", "changes"],
    explainer:
      "Paste two versions of a text to see exactly what changed between them. Added lines are highlighted in green, removed lines in red, and unchanged lines in grey — the same style used by Git. Useful for comparing configuration files, API responses, code snippets, or any two blocks of text where you need to spot differences quickly.",
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return tools.filter((t) => t.category === category);
}
