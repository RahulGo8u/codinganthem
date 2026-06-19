export type ToolCategory =
  | "formatters"
  | "encoders"
  | "generators"
  | "converters"
  | "text"
  | "security"
  | "web";

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
  security: "Security",
  web: "Web",
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
    category: "security",
    icon: "KeyRound",
    keywords: ["password", "generate", "random", "secure", "strength"],
    explainer:
      "Generate strong, random passwords using the Web Crypto API — the same standard used by password managers.\n\n• Customize length up to 128 characters\n• Choose character sets: uppercase, lowercase, numbers, symbols\n• Strength indicator shows how secure each password is\n• Generate multiple passwords at once — nothing is stored or transmitted",
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes",
    category: "security",
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
  {
    slug: "url-encoder",
    name: "URL Encoder / Decoder",
    description: "Encode and decode URLs and query string parameters",
    category: "web",
    icon: "Link",
    keywords: ["url", "encode", "decode", "percent", "uri", "query", "string", "escape"],
    explainer:
      "Encode and decode URLs instantly — no libraries, no server.\n\n• Encode special characters to percent-encoded format for safe use in URLs\n• Decode percent-encoded strings back to readable text\n• Handles full URLs and individual query parameter values\n• Essential when building APIs, query strings, or parsing redirect URLs",
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    description: "Decode and inspect JWT tokens — header, payload, and signature",
    category: "security",
    icon: "KeySquare",
    keywords: ["jwt", "json web token", "decode", "token", "auth", "bearer", "header", "payload"],
    explainer:
      "Decode and inspect JWT tokens instantly — entirely in your browser.\n\n• Reveals the header algorithm, payload claims, and raw signature\n• Useful for debugging auth issues, checking expiry (exp), and reading claims\n• Signature is NOT verified — this tool only decodes, it does not validate\n• Nothing is sent to a server — your tokens stay private",
  },
  {
    slug: "base-converter",
    name: "Number Base Converter",
    description: "Convert numbers between binary, octal, decimal, and hexadecimal",
    category: "converters",
    icon: "Binary",
    keywords: ["binary", "hex", "hexadecimal", "octal", "decimal", "base", "convert", "number"],
    explainer:
      "Convert any number between binary, octal, decimal, and hex instantly.\n\n• Enter a number in any base and see all four representations at once\n• Supports binary (base 2), octal (base 8), decimal (base 10), and hex (base 16)\n• Validates digits against the selected input base\n• Useful for bitwise operations, memory addresses, and color values",
  },
  {
    slug: "lorem-ipsum",
    name: "Lorem Ipsum Generator",
    description: "Generate placeholder lorem ipsum text for designs and mockups",
    category: "generators",
    icon: "AlignLeft",
    keywords: ["lorem", "ipsum", "placeholder", "text", "dummy", "generate", "paragraph"],
    explainer:
      "Generate classic lorem ipsum placeholder text in seconds.\n\n• Choose how many paragraphs to generate (1–10)\n• Classic lorem ipsum words used by designers and developers worldwide\n• Copy all generated text in one click\n• Useful for wireframes, UI mockups, and testing text-heavy layouts",
  },
  {
    slug: "csv-to-json",
    name: "CSV to JSON",
    description: "Convert CSV data to a JSON array instantly",
    category: "converters",
    icon: "Table",
    keywords: ["csv", "json", "convert", "table", "data", "spreadsheet", "parse"],
    explainer:
      "Convert CSV files or pasted data to JSON in one click.\n\n• First row is used as the key names in the JSON output\n• Handles quoted fields, commas inside quotes, and missing values\n• Output is a properly formatted JSON array ready to use in code\n• Useful when importing spreadsheet data into APIs or databases",
  },
  {
    slug: "html-entities",
    name: "HTML Entities Encoder / Decoder",
    description: "Encode and decode HTML entities like &amp;lt; and &amp;gt;",
    category: "web",
    icon: "Code",
    keywords: ["html", "entities", "encode", "decode", "escape", "unescape", "amp", "lt", "gt"],
    explainer:
      "Encode and decode HTML entities instantly — no setup required.\n\n• Encode <, >, &, \", and ' into safe HTML entity equivalents\n• Decode named and numeric entities back to their original characters\n• Essential for safely embedding user content in HTML\n• Useful when writing HTML emails, templates, or sanitizing output",
  },
  {
    slug: "yaml-to-json",
    name: "YAML to JSON",
    description: "Convert YAML configuration to JSON format instantly",
    category: "converters",
    icon: "FileJson",
    keywords: ["yaml", "json", "convert", "config", "yml", "parse", "transform"],
    explainer:
      "Convert YAML to JSON instantly — useful for config file transformations.\n\n• Paste any YAML document and get properly formatted JSON output\n• Handles nested objects, arrays, multi-line strings, and anchors\n• Common use: converting docker-compose.yml, GitHub Actions, or Kubernetes configs\n• Syntax errors are reported with a plain-English message",
  },
  {
    slug: "markdown-preview",
    name: "Markdown Previewer",
    description: "Write Markdown and see a live rendered HTML preview",
    category: "formatters",
    icon: "FileText",
    keywords: ["markdown", "preview", "render", "html", "md", "format", "readme"],
    explainer:
      "Write Markdown and see a live rendered preview as you type.\n\n• Supports standard Markdown: headings, bold, italic, lists, links, code blocks\n• Preview updates in real time with no submit button\n• Useful for drafting READMEs, documentation, and blog posts\n• Runs entirely in the browser — nothing is sent to a server",
  },
  {
    slug: "word-counter",
    name: "Word Counter",
    description: "Count words, characters, sentences, and estimate reading time",
    category: "text",
    icon: "AlignLeft",
    keywords: ["word", "counter", "character", "count", "reading", "time", "text", "length"],
    explainer:
      "Count words, characters, sentences, and paragraphs instantly — paste any text and see results live.\n\n• Word count, character count with and without spaces\n• Sentence and paragraph count\n• Estimated reading time at 200 words per minute\n• Updates in real time as you type or paste",
  },
  {
    slug: "json-to-yaml",
    name: "JSON to YAML",
    description: "Convert JSON to YAML format instantly",
    category: "converters",
    icon: "FileJson",
    keywords: ["json", "yaml", "convert", "config", "yml", "transform"],
    explainer:
      "Convert JSON to YAML instantly — the reverse of YAML to JSON.\n\n• Paste any valid JSON and get clean, readable YAML output\n• Handles nested objects, arrays, and all JSON value types\n• Common use: converting API responses to config file format\n• Syntax errors in the input JSON are reported clearly",
  },
  {
    slug: "json-to-csv",
    name: "JSON to CSV",
    description: "Convert a JSON array to CSV format",
    category: "converters",
    icon: "Table",
    keywords: ["json", "csv", "convert", "table", "data", "spreadsheet", "export"],
    explainer:
      "Convert a JSON array to CSV in one click — ready to open in Excel or Google Sheets.\n\n• First object's keys become the CSV header row\n• All rows are flattened to string values\n• Handles null and missing fields gracefully\n• Useful for exporting API data to spreadsheets or databases",
  },
  {
    slug: "url-parser",
    name: "URL Parser",
    description: "Break a URL into its components — protocol, host, path, query params, and hash",
    category: "web",
    icon: "Link",
    keywords: ["url", "parse", "components", "query", "params", "hostname", "path", "hash", "protocol"],
    explainer:
      "Parse any URL into its individual components instantly.\n\n• Shows protocol, hostname, port, pathname, query parameters, and hash\n• Each query parameter displayed as a separate key-value pair\n• Useful for debugging redirect URLs, OAuth callbacks, and API endpoints\n• Uses the browser's built-in URL parser — handles all edge cases correctly",
  },
  {
    slug: "slug-generator",
    name: "Slug Generator",
    description: "Convert any text into a URL-friendly slug",
    category: "web",
    icon: "Link2",
    keywords: ["slug", "url", "kebab", "snake", "case", "generate", "permalink", "friendly"],
    explainer:
      "Convert any text to a clean, URL-friendly slug instantly.\n\n• Converts spaces and special characters to hyphens or underscores\n• Strips accents, punctuation, and non-ASCII characters\n• Choose between kebab-case (hello-world) and snake_case (hello_world)\n• Useful for blog post URLs, API route names, and file names",
  },
  {
    slug: "cron-parser",
    name: "Cron Expression Parser",
    description: "Decode cron expressions into plain-English schedules",
    category: "converters",
    icon: "Timer",
    keywords: ["cron", "schedule", "expression", "parse", "crontab", "job", "timer", "interval"],
    explainer:
      "Decode any cron expression into plain English — no more guessing what * * * * * means.\n\n• Supports standard 5-field and extended 6-field (with seconds) cron syntax\n• Handles *, */n, ranges (n-m), and lists (n,m)\n• Shows the next 5 scheduled run times\n• Useful for debugging crontabs, CI schedules, and cloud functions",
  },
  {
    slug: "string-escape",
    name: "String Escape / Unescape",
    description: "Escape or unescape special characters in strings",
    category: "text",
    icon: "Braces",
    keywords: ["escape", "unescape", "string", "json", "backslash", "newline", "special", "characters"],
    explainer:
      "Escape or unescape special characters in strings for use in code or JSON payloads.\n\n• Escape mode: converts newlines, tabs, quotes, and backslashes to their escaped equivalents\n• Unescape mode: reverses escaped sequences back to raw characters\n• Useful when embedding strings in JSON, debugging API responses, or copying code\n• Updates live as you type",
  },
  {
    slug: "jwt-generator",
    name: "JWT Generator",
    description: "Create signed JWT tokens with HS256, HS384, or HS512 using WebCrypto",
    category: "security",
    icon: "ShieldCheck",
    keywords: ["jwt", "json web token", "generate", "sign", "hs256", "hmac", "token", "auth", "bearer"],
    explainer:
      "Generate signed JWT tokens for testing — entirely in your browser using the Web Crypto API.\n\n• Choose algorithm: HS256, HS384, or HS512\n• Edit the payload JSON — add any claims you need (sub, exp, iat, etc.)\n• Enter a secret key to sign the token\n• Output is a ready-to-use JWT — paste it into Postman, curl, or your app",
  },
  {
    slug: "json-statistics",
    name: "JSON Statistics",
    description: "Analyze JSON structure — node count, depth, type distribution, and size",
    category: "formatters",
    icon: "BarChart2",
    keywords: ["json", "statistics", "analyze", "stats", "count", "depth", "size", "structure"],
    explainer:
      "Analyze the structure and shape of any JSON document instantly.\n\n• Total node count, maximum nesting depth, and file size\n• Type distribution: how many strings, numbers, booleans, arrays, objects, and nulls\n• Key count for objects and length stats for arrays\n• Useful for understanding large API responses or validating data structure",
  },
  {
    slug: "json-diff",
    name: "JSON Diff",
    description: "Compare two JSON documents and highlight every addition, removal, and change",
    category: "formatters",
    icon: "GitCompare",
    keywords: ["json", "diff", "compare", "difference", "changes", "json diff", "compare json"],
    explainer:
      "Compare two JSON documents side by side — keys are sorted so formatting differences don't create noise.\n\n• Added keys shown in green, removed in red, unchanged in grey\n• JSON-aware: reorders keys before diffing so only real changes show\n• Useful for comparing API responses, config files, or database snapshots\n• Handles nested objects and arrays of any depth",
  },
  {
    slug: "qr-code-generator",
    name: "QR Code Generator",
    description: "Generate a QR code for any text or URL instantly",
    category: "generators",
    icon: "QrCode",
    keywords: ["qr", "qr code", "generate", "barcode", "scan", "url", "link"],
    explainer:
      "Generate a QR code for any text, URL, or data instantly — entirely in your browser.\n\n• Works with URLs, plain text, email addresses, phone numbers, and more\n• Choose output size: 128px, 256px, or 512px\n• Download as PNG with one click\n• Nothing is sent to a server — all generation happens locally",
  },
  {
    slug: "sql-formatter",
    name: "SQL Formatter",
    description: "Format and beautify SQL queries with dialect-aware indentation",
    category: "formatters",
    icon: "Database",
    keywords: ["sql", "format", "beautify", "query", "mysql", "postgresql", "sqlite", "database"],
    explainer:
      "Format SQL queries instantly — supports multiple dialects with proper indentation and keyword casing.\n\n• Supports SQL, MySQL, PostgreSQL, SQLite, and more\n• Uppercase keywords, consistent indentation, clean output\n• Paste minified or messy SQL and get readable formatted output\n• Useful before sharing queries, adding to documentation, or code review",
  },
  {
    slug: "image-to-base64",
    name: "Image to Base64",
    description: "Convert any image to a Base64 data URL instantly",
    category: "encoders",
    icon: "Image",
    keywords: ["image", "base64", "encode", "data url", "png", "jpg", "svg", "convert"],
    explainer:
      "Convert any image to a Base64 data URL instantly — entirely in your browser.\n\n• Supports PNG, JPG, JPEG, GIF, WebP, and SVG\n• Output includes the full data URL and the raw Base64 string separately\n• Useful for embedding images in CSS, HTML, or JSON without a file reference\n• Nothing is uploaded — the conversion happens locally in your browser",
  },
  {
    slug: "jwt-validator",
    name: "JWT Validator",
    description: "Verify a JWT token's signature and check its expiry",
    category: "security",
    icon: "ShieldCheck",
    keywords: ["jwt", "json web token", "validate", "verify", "signature", "hmac", "auth", "bearer"],
    explainer:
      "Verify a JWT token's HMAC signature and check expiry — entirely in your browser.\n\n• Validates HS256, HS384, and HS512 signed tokens\n• Enter the secret key to verify the signature cryptographically\n• Shows expiry status (valid / expired) and decoded claims\n• Note: only HMAC (shared secret) tokens can be verified — RS256/ES256 require a public key",
  },
  {
    slug: "js-formatter",
    name: "JavaScript Formatter",
    description: "Format and beautify JavaScript code with proper indentation",
    category: "formatters",
    icon: "FileCode",
    keywords: ["javascript", "js", "format", "beautify", "prettify", "indent", "code"],
    explainer:
      "Format and beautify messy or minified JavaScript instantly.\n\n• Proper indentation, consistent spacing, and readable structure\n• Paste minified JS and get clean, formatted output\n• Useful for reading bundled code, debugging, or code review\n• Runs entirely in the browser — your code never leaves your machine",
  },
  {
    slug: "html-formatter",
    name: "HTML Formatter",
    description: "Format and beautify HTML markup with proper indentation",
    category: "formatters",
    icon: "FileCode",
    keywords: ["html", "format", "beautify", "prettify", "indent", "markup"],
    explainer:
      "Format and beautify HTML markup instantly.\n\n• Proper nesting indentation and clean structure\n• Paste minified HTML and get readable output\n• Useful for inspecting page source, email templates, or generated markup\n• Runs entirely in the browser — nothing is sent to a server",
  },
  {
    slug: "css-formatter",
    name: "CSS Formatter",
    description: "Format and beautify CSS with proper indentation",
    category: "formatters",
    icon: "FileCode",
    keywords: ["css", "format", "beautify", "prettify", "indent", "stylesheet"],
    explainer:
      "Format and beautify minified or messy CSS instantly.\n\n• Each rule and property on its own line with consistent indentation\n• Paste minified CSS and get readable output\n• Useful for inspecting compiled stylesheets or third-party CSS\n• Runs entirely in the browser — nothing leaves your machine",
  },
  {
    slug: "sql-in-generator",
    name: "SQL IN Generator",
    description: "Turn a list of values into a SQL IN clause",
    category: "converters",
    icon: "Database",
    keywords: ["sql", "in", "clause", "list", "comma", "query", "where", "ids"],
    explainer:
      "Turn a list of IDs or values into a ready-to-use SQL IN clause.\n\n• Paste values one per line — get them comma-separated inside IN (...)\n• Choose to quote values (for strings) or leave them bare (for numbers)\n• Optionally add a column name and WHERE prefix\n• Saves you from manually adding commas and quotes to long lists",
  },
  {
    slug: "json-to-typescript",
    name: "JSON to TypeScript",
    description: "Generate TypeScript interfaces from a JSON object",
    category: "converters",
    icon: "Braces",
    keywords: ["json", "typescript", "interface", "type", "convert", "ts", "types"],
    explainer:
      "Generate TypeScript interfaces from any JSON object instantly.\n\n• Recursively infers types for nested objects and arrays\n• Produces clean interface definitions ready to paste into your code\n• Useful when consuming an API and you need types for the response\n• Runs entirely in the browser — your data never leaves your machine",
  },
  {
    slug: "curl-to-fetch",
    name: "cURL to Fetch",
    description: "Convert a cURL command into a JavaScript fetch() call",
    category: "web",
    icon: "Terminal",
    keywords: ["curl", "fetch", "convert", "http", "request", "javascript", "api"],
    explainer:
      "Convert a cURL command into an equivalent JavaScript fetch() call.\n\n• Parses the method, headers, and request body from any curl command\n• Produces a ready-to-use fetch() snippet with options\n• Useful when copying curl commands from DevTools, Postman, or API docs\n• Runs entirely in the browser — nothing is sent to a server",
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return tools.filter((t) => t.category === category);
}

/**
 * Pick related tools for a given tool: prefer same category, then fall back to
 * other tools to fill up to `count`. Deterministic so it works with SSG.
 */
export function getRelatedTools(slug: string, category: ToolCategory, count = 4): Tool[] {
  const sameCategory = tools.filter((t) => t.slug !== slug && t.category === category);
  if (sameCategory.length >= count) return sameCategory.slice(0, count);
  const others = tools.filter((t) => t.slug !== slug && t.category !== category);
  return [...sameCategory, ...others].slice(0, count);
}
