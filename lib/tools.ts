export type ToolCategory =
  | "formatters"
  | "encoders"
  | "generators"
  | "converters"
  | "text"
  | "security"
  | "web"
  | "visualizers"
  | "ai"
  | "web3"
  | "images"
  | "css";

/**
 * Where a tool's data is processed.
 * - "client": everything happens in the browser; nothing is sent to a server.
 * - "server": the tool sends input to a backend or third-party API to work
 *   (e.g. URL Shortener → our DB, AI tools → Google's Gemini API).
 *
 * This drives honest, per-tool copy (FAQ answers, structured data) so we never
 * claim "nothing is sent to a server" on a tool that actually does. Defaults to
 * "client" when omitted, since the large majority of tools are client-only.
 */
export type ToolDataFlow = "client" | "server";

export type Tool = {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string; // lucide-react icon name
  keywords: string[];
  explainer: string; // short SEO paragraph shown below the tool
  /** Data-processing model. Omit for client-only tools (the default). */
  dataFlow?: ToolDataFlow;
  /**
   * Keyword-targeted <title>/OG/Twitter title, distinct from the on-page `name`.
   * `name` stays a clean, generic label used in the UI (H1, cards, breadcrumbs);
   * `seoTitle` is written to target the actual search phrase a user would type,
   * so every tool page has a unique, differentiated title tag instead of the
   * same "{name} — Free Online Tool" boilerplate. Falls back to that boilerplate
   * when omitted.
   */
  seoTitle?: string;
  /** Highlight recently shipped tools on cards / homepage. Remove when no longer “new”. */
  isNew?: boolean;
};

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  formatters: "Formatters",
  encoders: "Encoders",
  generators: "Generators",
  converters: "Converters",
  text: "Text Utils",
  security: "Security",
  web: "Web",
  visualizers: "Visualizers",
  ai: "AI",
  web3: "Web3",
  images: "Images",
  css: "CSS",
};

/**
 * Per-category metadata for the /category/[category] hub pages.
 * `title` and `intro` give each hub unique, non-thin content (avoids being seen
 * as a duplicate of the homepage filter), and target the head keyword for the
 * cluster. Keep these human-written, not templated.
 */
export const CATEGORY_META: Record<
  ToolCategory,
  { title: string; tagline: string; intro: string }
> = {
  formatters: {
    title: "Code & Data Formatters",
    tagline: "Format, beautify, and validate code and data",
    intro:
      "Free online formatters for JSON, SQL, HTML, CSS, JavaScript, and XML. Paste messy or minified code and get clean, readable output instantly — with validation and syntax highlighting. Everything runs in your browser, so nothing you paste is sent to a server.",
  },
  encoders: {
    title: "Encoders & Decoders",
    tagline: "Encode and decode text, strings, and images",
    intro:
      "Free online encoders and decoders for Base64, string escaping, and images. Convert data to and from Base64, escape special characters, and turn images into data URLs — instantly and privately in your browser.",
  },
  generators: {
    title: "Generators",
    tagline: "Generate UUIDs, passwords, QR codes, and mock data",
    intro:
      "Free online generators for UUIDs, placeholder text, QR codes, chmod permissions, and realistic mock data. Create test fixtures, seed data, and unique identifiers on demand — no sign-up, and everything runs locally in your browser.",
  },
  converters: {
    title: "Data Converters",
    tagline: "Convert between JSON, CSV, YAML, XML, and more",
    intro:
      "Free online converters for JSON, CSV, YAML, XML, TypeScript, colors, timestamps, and number bases. Transform data from one format to another instantly — great for wrangling API responses, config files, and exports right in your browser.",
  },
  text: {
    title: "Text Utilities",
    tagline: "Compare, count, and transform text",
    intro:
      "Free online text tools to test regular expressions, convert case, diff two texts, and count words and characters. Fast, browser-based utilities for everyday writing, coding, and content work.",
  },
  security: {
    title: "Security & Crypto Tools",
    tagline: "Hashes, passwords, JWTs, and one-time passwords",
    intro:
      "Free online security tools to generate hashes (MD5, SHA-256, bcrypt, and more), create strong passwords, work with JWTs, and generate TOTP codes. All cryptography runs in your browser — no secrets ever leave your machine.",
  },
  web: {
    title: "Web Developer Tools",
    tagline: "URLs, HTML entities, slugs, meta tags, and cURL",
    intro:
      "Free online web development tools to encode and parse URLs, escape HTML entities, generate SEO meta/Open Graph tags, create slugs, convert cURL commands to fetch(), parse User-Agent strings, and shorten links. Everyday utilities for frontend and backend work.",
  },
  visualizers: {
    title: "Visualizers & Previewers",
    tagline: "Preview Markdown and render diagrams",
    intro:
      "Free online visualizers to preview Markdown as rendered HTML and turn Mermaid code into flowcharts, sequence diagrams, and more. See your content and diagrams come to life instantly in your browser.",
  },
  ai: {
    title: "AI Developer Tools",
    tagline: "Prompt tooling, token counting, and AI code help",
    intro:
      "Free AI-powered developer tools: fill in prompt templates, count tokens and estimate API cost for GPT, Claude, and Gemini, and get AI explanations for code, SQL, and error messages. Some tools send your input to an AI API to work — see each tool's description and our Privacy Policy for details.",
  },
  web3: {
    title: "Web3 & Ethereum Tools",
    tagline: "Unit conversions and utilities for Ethereum development",
    intro:
      "Free online Web3 tools for Ethereum development — convert between Wei, Gwei, and Ether with exact precision, and more utilities on the way. Everything runs in your browser; only paste public data like addresses, never a private key or seed phrase.",
  },
  images: {
    title: "Image Tools",
    tagline: "Compress, resize, and generate favicons in your browser",
    intro:
      "Free online image tools to compress JPG/PNG/WebP, resize images to exact dimensions, and generate favicon packs — all processed locally in your browser. No uploads, no watermarks, no sign-up.",
  },
  css: {
    title: "CSS Generators",
    tagline: "Visual CSS tools with copy-ready code",
    intro:
      "Free online CSS generators for gradients and more. Build production-ready CSS visually, preview live, and copy the code — everything runs in your browser.",
  },
};

export const tools: Tool[] = [
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    seoTitle: "Free JSON Formatter & Validator Online",
    description: "Format, validate, and minify JSON online for free. Instantly catch syntax errors, apply clean indentation, and minify with one click — no sign-up needed.",
    category: "formatters",
    icon: "Braces",
    keywords: ["json", "format", "validate", "beautify", "minify", "pretty"],
    explainer:
      "Format, validate, and transform JSON instantly — no setup, no server.\n\n• Paste messy JSON to get it properly indented and readable\n• Syntax errors are shown in plain English so you know exactly what's wrong\n• Live Valid / Invalid badge updates as you type\n• Minify to strip whitespace before sending payloads to an API",
  },
  {
    slug: "base64",
    name: "Base64 Encoder / Decoder",
    seoTitle: "Base64 Encode & Decode Online — Free Converter",
    description: "Encode or decode Base64 text and files instantly online. Free Base64 converter for JWTs, data URLs, and auth headers — everything runs in your browser.",
    category: "encoders",
    icon: "ArrowLeftRight",
    keywords: ["base64", "encode", "decode", "btoa", "atob"],
    explainer:
      "Encode or decode Base64 in one click — entirely in your browser.\n\n• Encode plain text to Base64 for use in JWTs, data URLs, or auth headers\n• Decode a Base64 string back to its original form instantly\n• Switch between encode and decode mode with one click\n• Nothing is sent to a server — all processing stays local",
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    seoTitle: "Free UUID v4 Generator Online — Bulk & Instant",
    description: "Generate one or hundreds of random v4 UUIDs instantly online, for free. Perfect for database primary keys, session tokens, and API request IDs.",
    category: "generators",
    icon: "Fingerprint",
    keywords: ["uuid", "guid", "generate", "unique", "id", "random"],
    explainer:
      "Generate one or hundreds of v4 UUIDs instantly — no libraries needed.\n\n• Cryptographically random — collisions are statistically impossible\n• Use as database primary keys, session tokens, or request IDs\n• Generate up to 100 at once and copy them all in one click\n• Runs entirely in the browser using the native crypto API",
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    seoTitle: "Strong Random Password Generator — Free & Secure",
    description: "Generate strong, random passwords online using the Web Crypto API. Customize length and character sets, with a built-in strength indicator — free.",
    category: "security",
    icon: "KeyRound",
    keywords: ["password", "generate", "random", "secure", "strength"],
    explainer:
      "Generate strong, random passwords using the Web Crypto API — the same standard used by password managers.\n\n• Customize length up to 128 characters\n• Choose character sets: uppercase, lowercase, numbers, symbols\n• Strength indicator shows how secure each password is\n• Generate multiple passwords at once — nothing is stored or transmitted",
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    seoTitle: "MD5, SHA-256 & SHA-512 Hash Generator Online",
    description: "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes instantly online, for free. Useful for checksums, file integrity checks, and password hashing.",
    category: "security",
    icon: "Hash",
    keywords: ["hash", "md5", "sha256", "sha512", "sha1", "checksum", "crypto"],
    explainer:
      "Compute cryptographic hashes instantly — live as you type.\n\n• SHA-256 and SHA-512 use the browser's native Web Crypto API\n• MD5 and SHA-1 included for legacy compatibility (not recommended for security use)\n• Any single character change produces a completely different hash\n• Common uses: checksums, file integrity verification, password storage",
  },
  {
    slug: "timestamp-converter",
    name: "Unix Timestamp Converter",
    seoTitle: "Unix Timestamp to Date Converter — Free Online Tool",
    description: "Convert Unix timestamps to human-readable dates and back, instantly online. Supports local time, UTC, and ISO 8601 — free, no sign-up required.",
    category: "converters",
    icon: "Clock",
    keywords: ["timestamp", "unix", "epoch", "date", "time", "convert"],
    explainer:
      "Convert Unix timestamps to readable dates and back — instantly.\n\n• Paste a timestamp (seconds or milliseconds) to see it in local time, UTC, and ISO 8601\n• Enter any date string to get its Unix timestamp\n• Timestamps are timezone-independent — the standard for APIs, databases, and logs\n• Current time shown automatically so you always have a reference point",
  },
  {
    slug: "color-converter",
    name: "Color Converter",
    seoTitle: "HEX to RGB to HSL Color Converter — Free, Live Preview",
    description: "Convert colors between HEX, RGB, and HSL instantly online with a live preview. Free color converter for CSS, Figma, and Tailwind workflows.",
    category: "converters",
    icon: "Palette",
    keywords: ["color", "hex", "rgb", "hsl", "convert", "colour"],
    explainer:
      "Convert any color between HEX, RGB, and HSL instantly — with a live preview.\n\n• Paste a HEX code, RGB value, or HSL string to get all three formats at once\n• Live color swatch updates as you type\n• Copy any format individually with one click\n• Useful when switching between CSS, Figma, Tailwind, and image processing tools",
  },
  {
    slug: "regex-tester",
    name: "Regex Tester",
    seoTitle: "Free Online Regex Tester with Live Match Highlighting",
    description: "Test and debug regular expressions online with live match highlighting. See match counts and positions instantly — free, no console needed.",
    category: "text",
    icon: "Regex",
    keywords: ["regex", "regexp", "regular expression", "pattern", "match", "test"],
    explainer:
      "Test and debug regular expressions in real time — no console needed.\n\n• See all matches highlighted as you type the pattern\n• Toggle flags: global (g), case insensitive (i), multiline (m)\n• Match count and positions shown for each result\n• Works with any regex supported by JavaScript's RegExp engine",
  },
  {
    slug: "case-converter",
    name: "Case Converter",
    seoTitle: "camelCase, snake_case & PascalCase Converter — Free",
    description: "Convert text between camelCase, snake_case, PascalCase, kebab-case, and more, instantly online. Free tool for renaming variables and API fields.",
    category: "text",
    icon: "CaseSensitive",
    keywords: ["case", "camel", "snake", "pascal", "kebab", "upper", "lower", "convert"],
    explainer:
      "Convert text between any naming convention instantly — paste a whole list at once.\n\n• Supports camelCase, snake_case, PascalCase, kebab-case, UPPER_CASE, and more\n• Multi-line input — convert an entire list of variable names in one go\n• Useful when migrating codebases, renaming API fields, or generating slugs\n• Results update live as you type",
  },
  {
    slug: "text-diff",
    name: "Text Diff",
    seoTitle: "Free Online Text Compare & Diff Checker Tool",
    description: "Compare two blocks of text and highlight every change, line by line, instantly online. Free diff checker for code, configs, and API responses.",
    category: "text",
    icon: "GitCompare",
    keywords: ["diff", "compare", "text", "difference", "changes"],
    explainer:
      "Spot exactly what changed between two texts — line by line, instantly.\n\n• Added lines highlighted in green, removed in red — same style as Git diffs\n• Paste config files, API responses, code snippets, or any two blocks of text\n• Useful for reviewing changes before committing or debugging response differences\n• No size limit — compares as much text as you paste",
  },
  {
    slug: "url-encoder",
    name: "URL Encoder / Decoder",
    seoTitle: "URL Encoder & Decoder Online — Free Percent-Encoding Tool",
    description: "Encode and decode URLs and query string parameters online, instantly. Supports value encoding, full URL encoding, and decoding — free tool.",
    category: "web",
    icon: "Link",
    keywords: ["url", "encode", "decode", "percent", "uri", "query", "string", "escape"],
    explainer:
      "Encode and decode URLs with the right mode for every situation — no libraries, no server.\n\n• Encode value mode: encodes everything including / : ? & — use for query parameter values\n• Encode URL mode: preserves URL structure like / : ? — use for full URLs\n• Decode mode: reverses percent-encoded strings back to readable text\n• Each mode includes a hint explaining when to use it",
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    seoTitle: "Free JWT Decoder Online — Inspect Token Header & Payload",
    description: "Decode JWT tokens online and inspect the header, payload, and signature instantly. Free JWT decoder for debugging auth — no data ever sent anywhere.",
    category: "security",
    icon: "KeySquare",
    keywords: ["jwt", "json web token", "decode", "token", "auth", "bearer", "header", "payload"],
    explainer:
      "Decode and inspect JWT tokens instantly — entirely in your browser.\n\n• Reveals the header algorithm, payload claims, and raw signature\n• Useful for debugging auth issues, checking expiry (exp), and reading claims\n• Signature is NOT verified — this tool only decodes, it does not validate\n• Nothing is sent to a server — your tokens stay private",
  },
  {
    slug: "base-converter",
    name: "Number Base Converter",
    seoTitle: "Binary, Octal, Decimal & Hex Converter — Free Online Tool",
    description: "Convert numbers between binary, octal, decimal, and hexadecimal instantly online. Free number base converter for bitwise ops and memory addresses.",
    category: "converters",
    icon: "Binary",
    keywords: ["binary", "hex", "hexadecimal", "octal", "decimal", "base", "convert", "number"],
    explainer:
      "Convert any number between binary, octal, decimal, and hex instantly.\n\n• Enter a number in any base and see all four representations at once\n• Supports binary (base 2), octal (base 8), decimal (base 10), and hex (base 16)\n• Validates digits against the selected input base\n• Useful for bitwise operations, memory addresses, and color values",
  },
  {
    slug: "lorem-ipsum",
    name: "Lorem Ipsum Generator",
    seoTitle: "Lorem Ipsum Generator — Free Placeholder Text Online",
    description: "Generate classic lorem ipsum placeholder text online, instantly. Choose how many paragraphs you need for wireframes and mockups — free, no sign-up.",
    category: "generators",
    icon: "AlignLeft",
    keywords: ["lorem", "ipsum", "placeholder", "text", "dummy", "generate", "paragraph"],
    explainer:
      "Generate classic lorem ipsum placeholder text in seconds.\n\n• Choose how many paragraphs to generate (1–10)\n• Classic lorem ipsum words used by designers and developers worldwide\n• Copy all generated text in one click\n• Useful for wireframes, UI mockups, and testing text-heavy layouts",
  },
  {
    slug: "csv-to-json",
    name: "CSV to JSON",
    seoTitle: "CSV to JSON Converter Online — Free & Instant",
    description: "Convert CSV data or spreadsheet files to a JSON array instantly online, for free. Perfect for importing data into APIs and databases — no sign-up.",
    category: "converters",
    icon: "Table",
    keywords: ["csv", "json", "convert", "table", "data", "spreadsheet", "parse"],
    explainer:
      "Convert CSV files or pasted data to JSON in one click.\n\n• First row is used as the key names in the JSON output\n• Handles quoted fields, commas inside quotes, and missing values\n• Output is a properly formatted JSON array ready to use in code\n• Useful when importing spreadsheet data into APIs or databases",
  },
  {
    slug: "html-entities",
    name: "HTML Entities Encoder / Decoder",
    seoTitle: "HTML Entity Encoder & Decoder — Free Online Tool",
    description: "Encode and decode HTML entities like &lt; and &gt; instantly online. Free tool for safely embedding user content in HTML, emails, and templates.",
    category: "web",
    icon: "Code",
    keywords: ["html", "entities", "encode", "decode", "escape", "unescape", "amp", "lt", "gt"],
    explainer:
      "Encode and decode HTML entities instantly — no setup required.\n\n• Encode <, >, &, \", and ' into safe HTML entity equivalents\n• Decode named and numeric entities back to their original characters\n• Essential for safely embedding user content in HTML\n• Useful when writing HTML emails, templates, or sanitizing output",
  },
  {
    slug: "yaml-to-json",
    name: "YAML to JSON",
    seoTitle: "YAML to JSON Converter Online — Free & Instant",
    description: "Convert YAML configuration files to JSON format instantly online, for free. Perfect for docker-compose, GitHub Actions, and Kubernetes configs.",
    category: "converters",
    icon: "FileJson",
    keywords: ["yaml", "json", "convert", "config", "yml", "parse", "transform"],
    explainer:
      "Convert YAML to JSON instantly — useful for config file transformations.\n\n• Paste any YAML document and get properly formatted JSON output\n• Handles nested objects, arrays, multi-line strings, and anchors\n• Common use: converting docker-compose.yml, GitHub Actions, or Kubernetes configs\n• Syntax errors are reported with a plain-English message",
  },
  {
    slug: "markdown-preview",
    name: "Markdown Previewer",
    seoTitle: "Free Online Markdown Live Preview Editor",
    description: "Write Markdown online and see a live rendered HTML preview instantly. Free Markdown previewer for drafting READMEs, docs, and blog posts.",
    category: "visualizers",
    icon: "FileText",
    keywords: ["markdown", "preview", "render", "html", "md", "format", "readme"],
    explainer:
      "Write Markdown and see a live rendered preview as you type.\n\n• Supports standard Markdown: headings, bold, italic, lists, links, code blocks\n• Preview updates in real time with no submit button\n• Useful for drafting READMEs, documentation, and blog posts\n• Runs entirely in the browser — nothing is sent to a server",
  },
  {
    slug: "word-counter",
    name: "Word Counter",
    seoTitle: "Free Word & Character Counter with Reading Time",
    description: "Count words, characters, sentences, and estimate reading time instantly online. Free word counter that updates live as you type or paste text.",
    category: "text",
    icon: "AlignLeft",
    keywords: ["word", "counter", "character", "count", "reading", "time", "text", "length"],
    explainer:
      "Count words, characters, sentences, and paragraphs instantly — paste any text and see results live.\n\n• Word count, character count with and without spaces\n• Sentence and paragraph count\n• Estimated reading time at 200 words per minute\n• Updates in real time as you type or paste",
  },
  {
    slug: "json-to-yaml",
    name: "JSON to YAML",
    seoTitle: "JSON to YAML Converter Online — Free & Instant",
    description: "Convert JSON to YAML format instantly online, for free. Paste any valid JSON and get clean, readable YAML output for config file conversions.",
    category: "converters",
    icon: "FileJson",
    keywords: ["json", "yaml", "convert", "config", "yml", "transform"],
    explainer:
      "Convert JSON to YAML instantly — the reverse of YAML to JSON.\n\n• Paste any valid JSON and get clean, readable YAML output\n• Handles nested objects, arrays, and all JSON value types\n• Common use: converting API responses to config file format\n• Syntax errors in the input JSON are reported clearly",
  },
  {
    slug: "json-to-csv",
    name: "JSON to CSV",
    seoTitle: "JSON to CSV Converter Online — Free, Excel-Ready Output",
    description: "Convert a JSON array to CSV format instantly online, for free. Ready to open in Excel or Google Sheets — great for exporting API data.",
    category: "converters",
    icon: "Table",
    keywords: ["json", "csv", "convert", "table", "data", "spreadsheet", "export"],
    explainer:
      "Convert a JSON array to CSV in one click — ready to open in Excel or Google Sheets.\n\n• First object's keys become the CSV header row\n• All rows are flattened to string values\n• Handles null and missing fields gracefully\n• Useful for exporting API data to spreadsheets or databases",
  },
  {
    slug: "url-parser",
    name: "URL Parser",
    seoTitle: "Free URL Parser Online — Break Down Any URL Instantly",
    description: "Parse any URL into its components online — protocol, host, path, query params, and hash. Free URL parser for debugging redirects and OAuth callbacks.",
    category: "web",
    icon: "Link",
    keywords: ["url", "parse", "components", "query", "params", "hostname", "path", "hash", "protocol"],
    explainer:
      "Parse any URL into its individual components instantly.\n\n• Shows protocol, hostname, port, pathname, query parameters, and hash\n• Each query parameter displayed as a separate key-value pair\n• Useful for debugging redirect URLs, OAuth callbacks, and API endpoints\n• Uses the browser's built-in URL parser — handles all edge cases correctly",
  },
  {
    slug: "slug-generator",
    name: "Slug Generator",
    seoTitle: "Free Slug Generator — Convert Text to URL-Friendly Slugs",
    description: "Convert any text into a clean, URL-friendly slug instantly online. Free slug generator for blog post URLs, API routes, and file names.",
    category: "web",
    icon: "Link2",
    keywords: ["slug", "url", "kebab", "snake", "case", "generate", "permalink", "friendly"],
    explainer:
      "Convert any text to a clean, URL-friendly slug instantly.\n\n• Converts spaces and special characters to hyphens or underscores\n• Strips accents, punctuation, and non-ASCII characters\n• Choose between kebab-case (hello-world) and snake_case (hello_world)\n• Useful for blog post URLs, API route names, and file names",
  },
  {
    slug: "cron-parser",
    name: "Cron Expression Parser",
    seoTitle: "Cron Expression Parser — Free Online Cron Job Decoder",
    description: "Decode any cron expression into plain English online, instantly. Free cron parser that shows the next scheduled run times — no more guessing.",
    category: "converters",
    icon: "Timer",
    keywords: ["cron", "schedule", "expression", "parse", "crontab", "job", "timer", "interval"],
    explainer:
      "Decode any cron expression into plain English — no more guessing what * * * * * means.\n\n• Supports standard 5-field and extended 6-field (with seconds) cron syntax\n• Handles *, */n, ranges (n-m), and lists (n,m)\n• Shows the next 5 scheduled run times\n• Useful for debugging crontabs, CI schedules, and cloud functions",
  },
  {
    slug: "string-escape",
    name: "String Escape / Unescape",
    seoTitle: "String Escape & Unescape Tool — Free Online",
    description: "Escape or unescape special characters in strings instantly online. Free tool for embedding strings in JSON, debugging APIs, and copying code.",
    category: "encoders",
    icon: "Braces",
    keywords: ["escape", "unescape", "string", "json", "backslash", "newline", "special", "characters"],
    explainer:
      "Escape or unescape special characters in strings for use in code or JSON payloads.\n\n• Escape mode: converts newlines, tabs, quotes, and backslashes to their escaped equivalents\n• Unescape mode: reverses escaped sequences back to raw characters\n• Useful when embedding strings in JSON, debugging API responses, or copying code\n• Updates live as you type",
  },
  {
    slug: "jwt-generator",
    name: "JWT Generator",
    seoTitle: "Free JWT Generator Online — Sign Tokens with HS256/384/512",
    description: "Create signed JWT tokens online using HS256, HS384, or HS512 via the Web Crypto API. Free JWT generator for testing auth flows — no server calls.",
    category: "security",
    icon: "ShieldCheck",
    keywords: ["jwt", "json web token", "generate", "sign", "hs256", "hmac", "token", "auth", "bearer"],
    explainer:
      "Generate signed JWT tokens for testing — entirely in your browser using the Web Crypto API.\n\n• Choose algorithm: HS256, HS384, or HS512\n• Edit the payload JSON — add any claims you need (sub, exp, iat, etc.)\n• Enter a secret key to sign the token\n• Output is a ready-to-use JWT — paste it into Postman, curl, or your app",
  },
  {
    slug: "json-statistics",
    name: "JSON Statistics",
    seoTitle: "JSON Structure Analyzer — Free Online JSON Stats Tool",
    description: "Analyze any JSON document's structure online — node count, depth, size, and type distribution. Free tool for understanding large API responses.",
    category: "formatters",
    icon: "BarChart2",
    keywords: ["json", "statistics", "analyze", "stats", "count", "depth", "size", "structure"],
    explainer:
      "Analyze the structure and shape of any JSON document instantly.\n\n• Total node count, maximum nesting depth, and file size\n• Type distribution: how many strings, numbers, booleans, arrays, objects, and nulls\n• Key count for objects and length stats for arrays\n• Useful for understanding large API responses or validating data structure",
  },
  {
    slug: "json-diff",
    name: "JSON Diff",
    seoTitle: "Free Online JSON Diff Tool — Compare Two JSON Files",
    description: "Compare two JSON documents online and highlight every addition, removal, and change. Free JSON diff tool with key-sorted, noise-free comparisons.",
    category: "formatters",
    icon: "GitCompare",
    keywords: ["json", "diff", "compare", "difference", "changes", "json diff", "compare json"],
    explainer:
      "Compare two JSON documents side by side — keys are sorted so formatting differences don't create noise.\n\n• Added keys shown in green, removed in red, unchanged in grey\n• JSON-aware: reorders keys before diffing so only real changes show\n• Useful for comparing API responses, config files, or database snapshots\n• Handles nested objects and arrays of any depth",
  },
  {
    slug: "qr-code-generator",
    name: "QR Code Generator",
    seoTitle: "Free QR Code Generator Online — Instant & Downloadable",
    description: "Generate a QR code for any text, URL, or contact info instantly online. Free QR code generator with downloadable PNG output — no sign-up needed.",
    category: "generators",
    icon: "QrCode",
    keywords: ["qr", "qr code", "generate", "barcode", "scan", "url", "link"],
    explainer:
      "Generate a QR code for any text, URL, or data instantly — entirely in your browser.\n\n• Works with URLs, plain text, email addresses, phone numbers, and more\n• Choose output size: 128px, 256px, or 512px\n• Download as PNG with one click\n• Nothing is sent to a server — all generation happens locally",
  },
  {
    slug: "sql-formatter",
    name: "SQL Formatter",
    seoTitle: "Free SQL Formatter & Beautifier (MySQL, Postgres, SQLite)",
    description: "Format and beautify SQL queries online with dialect-aware indentation, for free. Supports MySQL, PostgreSQL, SQLite, and more — no sign-up.",
    category: "formatters",
    icon: "Database",
    keywords: ["sql", "format", "beautify", "query", "mysql", "postgresql", "sqlite", "database"],
    explainer:
      "Format SQL queries instantly — supports multiple dialects with proper indentation and keyword casing.\n\n• Supports SQL, MySQL, PostgreSQL, SQLite, and more\n• Uppercase keywords, consistent indentation, clean output\n• Paste minified or messy SQL and get readable formatted output\n• Useful before sharing queries, adding to documentation, or code review",
  },
  {
    slug: "image-to-base64",
    name: "Image to Base64",
    seoTitle: "Image to Base64 Converter — Free Online Data URL Tool",
    description: "Convert any image to a Base64 data URL instantly online, for free. Supports PNG, JPG, GIF, WebP, and SVG — great for embedding images in CSS.",
    category: "encoders",
    icon: "Image",
    keywords: ["image", "base64", "encode", "data url", "png", "jpg", "svg", "convert"],
    explainer:
      "Convert any image to a Base64 data URL instantly — entirely in your browser.\n\n• Supports PNG, JPG, JPEG, GIF, WebP, and SVG\n• Output includes the full data URL and the raw Base64 string separately\n• Useful for embedding images in CSS, HTML, or JSON without a file reference\n• Nothing is uploaded — the conversion happens locally in your browser",
  },
  {
    slug: "jwt-validator",
    name: "JWT Validator",
    seoTitle: "Free JWT Validator Online — Verify Signature & Expiry",
    description: "Verify a JWT token's HMAC signature and check its expiry online, instantly. Free JWT validator for HS256, HS384, and HS512 signed tokens.",
    category: "security",
    icon: "ShieldCheck",
    keywords: ["jwt", "json web token", "validate", "verify", "signature", "hmac", "auth", "bearer"],
    explainer:
      "Verify a JWT token's HMAC signature and check expiry — entirely in your browser.\n\n• Validates HS256, HS384, and HS512 signed tokens\n• Enter the secret key to verify the signature cryptographically\n• Shows expiry status (valid / expired) and decoded claims\n• Note: only HMAC (shared secret) tokens can be verified — RS256/ES256 require a public key",
  },
  {
    slug: "js-formatter",
    name: "JavaScript Formatter",
    seoTitle: "Free JavaScript Formatter & Beautifier Online",
    description: "Format and beautify messy or minified JavaScript code online, instantly. Free JS formatter for readable, properly indented output — no sign-up.",
    category: "formatters",
    icon: "FileCode",
    keywords: ["javascript", "js", "format", "beautify", "prettify", "indent", "code"],
    explainer:
      "Format and beautify messy or minified JavaScript instantly.\n\n• Proper indentation, consistent spacing, and readable structure\n• Paste minified JS and get clean, formatted output\n• Useful for reading bundled code, debugging, or code review\n• Runs entirely in the browser — your code never leaves your machine",
  },
  {
    slug: "html-formatter",
    name: "HTML Formatter",
    seoTitle: "Free HTML Formatter & Beautifier Online",
    description: "Format and beautify HTML markup online with proper indentation, instantly. Free HTML formatter for inspecting page source and email templates.",
    category: "formatters",
    icon: "FileCode",
    keywords: ["html", "format", "beautify", "prettify", "indent", "markup"],
    explainer:
      "Format and beautify HTML markup instantly.\n\n• Proper nesting indentation and clean structure\n• Paste minified HTML and get readable output\n• Useful for inspecting page source, email templates, or generated markup\n• Runs entirely in the browser — nothing is sent to a server",
  },
  {
    slug: "css-formatter",
    name: "CSS Formatter",
    seoTitle: "Free CSS Formatter & Beautifier Online",
    description: "Format and beautify minified or messy CSS online, instantly. Free CSS formatter with clean, consistent indentation for every rule and property.",
    category: "formatters",
    icon: "FileCode",
    keywords: ["css", "format", "beautify", "prettify", "indent", "stylesheet"],
    explainer:
      "Format and beautify minified or messy CSS instantly.\n\n• Each rule and property on its own line with consistent indentation\n• Paste minified CSS and get readable output\n• Useful for inspecting compiled stylesheets or third-party CSS\n• Runs entirely in the browser — nothing leaves your machine",
  },
  {
    slug: "sql-in-generator",
    name: "SQL IN Generator",
    seoTitle: "SQL IN Clause Generator — Free Online Tool",
    description: "Turn a list of values into a ready-to-use SQL IN clause instantly online. Free tool that adds commas and quotes automatically — no sign-up.",
    category: "converters",
    icon: "Database",
    keywords: ["sql", "in", "clause", "list", "comma", "query", "where", "ids"],
    explainer:
      "Turn a list of IDs or values into a ready-to-use SQL IN clause.\n\n• Paste values one per line — get them comma-separated inside IN (...)\n• Choose to quote values (for strings) or leave them bare (for numbers)\n• Optionally add a column name and WHERE prefix\n• Saves you from manually adding commas and quotes to long lists",
  },
  {
    slug: "json-to-typescript",
    name: "JSON to TypeScript",
    seoTitle: "JSON to TypeScript Interface Generator — Free Online",
    description: "Generate TypeScript interfaces from any JSON object instantly online, for free. Great for typing API responses — nothing leaves your browser.",
    category: "converters",
    icon: "Braces",
    keywords: ["json", "typescript", "interface", "type", "convert", "ts", "types"],
    explainer:
      "Generate TypeScript interfaces from any JSON object instantly.\n\n• Recursively infers types for nested objects and arrays\n• Produces clean interface definitions ready to paste into your code\n• Useful when consuming an API and you need types for the response\n• Runs entirely in the browser — your data never leaves your machine",
  },
  {
    slug: "curl-to-fetch",
    name: "cURL to Fetch",
    seoTitle: "cURL to Fetch() Converter — Free Online Tool",
    description: "Convert a cURL command into a JavaScript fetch() call instantly online, for free. Perfect for copying requests from DevTools or Postman.",
    category: "web",
    icon: "Terminal",
    keywords: ["curl", "fetch", "convert", "http", "request", "javascript", "api"],
    explainer:
      "Convert a cURL command into an equivalent JavaScript fetch() call.\n\n• Parses the method, headers, and request body from any curl command\n• Produces a ready-to-use fetch() snippet with options\n• Useful when copying curl commands from DevTools, Postman, or API docs\n• Runs entirely in the browser — nothing is sent to a server",
  },
  {
    slug: "mermaid-viewer",
    name: "Mermaid Diagram Viewer",
    seoTitle: "Free Mermaid Diagram Renderer & Live Viewer Online",
    description: "Render Mermaid diagram code into live flowcharts, sequence, ER, and class diagrams online. Free Mermaid viewer with zoom, pan, and SVG export.",
    category: "visualizers",
    icon: "GitBranch",
    keywords: ["mermaid", "diagram", "flowchart", "sequence", "chart", "render", "visualize", "er diagram", "class diagram", "gantt"],
    explainer:
      "Render Mermaid diagram syntax into a live diagram — entirely in your browser.\n\n• Supports flowcharts, sequence diagrams, ER diagrams, class diagrams, and Gantt charts\n• Live preview updates as you type, with clear error messages for invalid syntax\n• Zoom and pan the rendered diagram, then download it as an SVG\n• Great for pasting Mermaid code generated by ChatGPT, Copilot, or documentation tools",
  },
  {
    slug: "totp-generator",
    name: "TOTP / OTP Generator",
    seoTitle: "Free TOTP Generator Online — Test 2FA Codes (RFC 6238)",
    description: "Generate RFC 6238 time-based one-time passwords (TOTP) online from a secret key. Free TOTP generator for testing 2FA flows — no sign-up needed.",
    category: "security",
    icon: "Smartphone",
    keywords: ["totp", "otp", "2fa", "mfa", "authenticator", "one-time password", "hmac", "rfc6238"],
    explainer:
      "Generate RFC 6238 time-based one-time passwords (TOTP) — the same codes produced by apps like Google Authenticator.\n\n• Enter a Base32 secret key to generate a live, auto-refreshing 6-digit code\n• Countdown ring shows exactly when the code will rotate (every 30 seconds)\n• Uses the Web Crypto API (HMAC-SHA1) — no libraries, no server calls\n• Useful for testing 2FA flows without reaching for your phone",
  },
  {
    slug: "user-agent-parser",
    name: "User-Agent Parser",
    seoTitle: "User-Agent String Parser — Free Online Tool",
    description: "Parse any User-Agent string into browser, engine, OS, and device details online. Free User-Agent parser for debugging logs and analytics data.",
    category: "web",
    icon: "Monitor",
    keywords: ["user agent", "useragent", "browser", "os", "device", "parse", "navigator"],
    explainer:
      "Parse any User-Agent string into readable browser, engine, OS, and device details.\n\n• Automatically loads and parses your current browser's User-Agent\n• Paste any other User-Agent string to debug logs, analytics, or API requests\n• Detects browser name and version, rendering engine, operating system, and device type\n• Runs entirely in the browser — no data is sent anywhere",
  },
  {
    slug: "xml-formatter",
    name: "XML Formatter",
    seoTitle: "Free XML Formatter & Validator Online",
    description: "Format, validate, and beautify XML markup online with proper indentation, for free. Great for SOAP payloads, RSS feeds, and config files.",
    category: "formatters",
    icon: "FileCode",
    keywords: ["xml", "format", "beautify", "validate", "prettify", "indent", "markup"],
    explainer:
      "Format and validate XML instantly — no setup, no server.\n\n• Paste minified or messy XML to get it properly indented and readable\n• Well-formedness errors are shown in plain English so you know exactly what's wrong\n• Handles nested elements, attributes, and namespaces\n• Useful for SOAP payloads, RSS feeds, config files, and API responses",
  },
  {
    slug: "prompt-template-filler",
    name: "Prompt Template Filler",
    seoTitle: "AI Prompt Template Filler — Free Online Tool for ChatGPT",
    description: "Fill in {{variables}} in any AI prompt template instantly online, for free. Open the resolved prompt directly in ChatGPT with one click.",
    category: "ai",
    icon: "Sparkles",
    keywords: ["prompt", "template", "variables", "placeholder", "ai", "llm", "fill", "chatgpt", "prompt engineering"],
    explainer:
      "Fill in {{variables}} in any prompt template instantly — no setup, no server.\n\n• Paste a template with {{placeholders}} and a field appears for each one automatically\n• Output updates live as you fill in values\n• Unfilled variables stay visible in the output so you never send an incomplete prompt\n• Open the resolved prompt directly in ChatGPT with one click — nothing is sent automatically, it just pre-fills the input box",
  },
  {
    slug: "mock-data-generator",
    name: "Mock Data Generator",
    seoTitle: "Free Mock Data Generator Online — Fake JSON & CSV Data",
    description: "Generate realistic mock data online for testing APIs, seeding databases, or prototypes. Free tool exporting to JSON or CSV — no sign-up needed.",
    category: "generators",
    icon: "Database",
    keywords: ["fake data", "mock data", "test data", "faker", "generate", "random", "dummy", "seed", "json", "csv"],
    explainer:
      "Generate realistic mock data for testing APIs, seeding databases, or populating UI prototypes — entirely in your browser.\n\n• Pick exactly which fields you need: names, emails, addresses, UUIDs, and more\n• Generate up to 100 rows at once and export as JSON or CSV\n• Powered by the industry-standard faker.js library, loaded locally — nothing is sent to a server\n• Copy the output directly into Postman, your database seed script, or your test fixtures",
  },
  {
    slug: "token-counter",
    name: "Token Counter & Estimator",
    seoTitle: "AI Token Counter for GPT, Claude & Gemini — Free Online",
    description: "Count tokens and estimate API cost for GPT, Claude, and Gemini models online, instantly. Free token counter using OpenAI's real tiktoken tokenizer.",
    category: "ai",
    icon: "Calculator",
    keywords: ["token counter", "gpt tokenizer", "tiktoken", "llm tokens", "context window", "ai cost calculator", "claude tokens", "gemini tokens"],
    explainer:
      "Count tokens and estimate API cost before you send a single request — entirely in your browser.\n\n• Exact counts for GPT-4o, GPT-4.1, and GPT-3.5 via OpenAI's real tiktoken tokenizer\n• Character-based estimates for Claude and Gemini, since those providers don't publish a public tokenizer\n• Shows how much of the model's context window your text uses, plus estimated cost for this prompt\n• Tokenizer data loads on first use — nothing you paste is ever sent to a server",
  },
  {
    slug: "xml-to-json",
    name: "XML to JSON",
    seoTitle: "XML to JSON Converter Online — Free & Instant",
    description: "Convert XML markup to a clean JSON object instantly online, for free. Perfect for parsing SOAP responses, RSS feeds, and legacy XML APIs.",
    category: "converters",
    icon: "FileJson",
    keywords: ["xml", "json", "convert", "parse", "transform", "xml to json", "soap", "rss"],
    explainer:
      "Convert XML to JSON instantly — no setup, no server.\n\n• Paste any well-formed XML and get a clean JSON object\n• Attributes are preserved with an @ prefix, repeated sibling tags become arrays\n• Well-formedness errors are shown in plain English\n• Useful for SOAP responses, RSS feeds, and legacy XML APIs",
  },
  {
    slug: "color-contrast-checker",
    name: "Color Contrast Checker",
    seoTitle: "WCAG Color Contrast Checker — Free Accessibility Tool",
    description: "Check WCAG contrast ratio between any two colors online, instantly. Free accessibility checker showing Pass/Fail for WCAG AA and AAA levels.",
    category: "converters",
    icon: "Eye",
    keywords: ["contrast checker", "wcag", "accessibility", "color contrast", "a11y", "aa", "aaa", "text contrast"],
    explainer:
      "Check WCAG contrast ratio between any two colors — entirely in your browser.\n\n• Enter a text color and background color to see the exact contrast ratio\n• Instantly see Pass/Fail for WCAG AA and AAA at normal and large text sizes\n• Live preview shows how real text looks at that contrast\n• Useful for accessible web design, design systems, and color palette audits",
  },
  {
    slug: "url-shortener",
    name: "URL Shortener",
    seoTitle: "Free URL Shortener Online — Short Links with Expiry",
    description: "Shorten any URL online and get a free, shareable codinganthem.com/r/ link instantly. Optional link expiry and click tracking — no sign-up needed.",
    category: "web",
    icon: "Link",
    dataFlow: "server",
    keywords: ["url", "shorten", "short link", "link", "redirect", "tiny url"],
    explainer:
      "Paste any long URL to generate a short, shareable link at codinganthem.com/r/[code], with a randomly generated 5-character code. Links can have an optional expiry (1 hour, 24 hours, 7 days, or 30 days). Click counts are tracked so you can see how many times your link was visited.",
  },
  {
    slug: "ai-code-explainer",
    name: "AI Code Explainer",
    seoTitle: "AI Code Explainer — Free Online Tool to Explain Any Code",
    description: "Paste any code snippet and get a plain-English explanation instantly, powered by AI. Free tool for understanding unfamiliar code in any language.",
    category: "ai",
    icon: "Sparkles",
    dataFlow: "server",
    keywords: ["ai", "code explainer", "explain code", "gemini", "understand code", "code review"],
    explainer:
      "Paste any code snippet — in any language — and get a plain-English summary plus a breakdown of what each part does, powered by Google's Gemini AI. Useful for understanding unfamiliar code, reviewing a pull request, or learning from an example. Your code is sent to Google's Gemini API to generate the explanation — see the Privacy Policy for details.",
  },
  {
    slug: "ai-sql-generator",
    name: "AI Text-to-SQL Generator",
    seoTitle: "AI Text-to-SQL Generator — Free Online Query Builder",
    description: "Describe the query you need in plain English and get a ready-to-use SQL statement, powered by AI. Free tool with dialect support.",
    category: "ai",
    icon: "Database",
    dataFlow: "server",
    keywords: ["ai", "sql generator", "text to sql", "natural language to sql", "gemini", "query generator"],
    explainer:
      "Describe what you want to query in plain English — for example, \"top 5 customers by total order value this year\" — and get back a ready-to-use SQL statement plus a plain-English explanation of what it does, powered by Google's Gemini AI. Supports MySQL, PostgreSQL, and SQLite dialects. Your description is sent to Google's Gemini API to generate the query — see the Privacy Policy for details.",
  },
  {
    slug: "ai-error-explainer",
    name: "AI Error Message Explainer",
    seoTitle: "AI Error Message Explainer — Free Online Debug Helper",
    description: "Paste any error message or stack trace and get a plain-English diagnosis with a suggested fix, powered by AI. Free, no sign-up.",
    category: "ai",
    icon: "AlertTriangle",
    dataFlow: "server",
    keywords: ["ai", "error explainer", "stack trace", "debug", "gemini", "fix error"],
    explainer:
      "Paste any cryptic error message or stack trace and get a plain-English diagnosis of what went wrong, its likely cause, and a suggested fix, powered by Google's Gemini AI. Works across languages and environments — just select the closest match if you know it. Your error message is sent to Google's Gemini API to generate the explanation — see the Privacy Policy for details.",
  },
  {
    slug: "eth-unit-converter",
    name: "ETH Unit Converter",
    seoTitle: "ETH Unit Converter — Free Wei, Gwei & Ether Calculator",
    description: "Convert between Wei, Gwei, and Ether with exact BigInt precision, instantly online. Free Ethereum unit converter — no rounding errors, no sign-up.",
    category: "web3",
    icon: "Coins",
    keywords: ["eth", "wei", "gwei", "ether", "ethereum", "unit converter", "gas price", "web3"],
    isNew: true,
    explainer:
      "Convert between Wei, Kwei, Mwei, Gwei, Szabo, Finney, and Ether instantly — all seven fields stay in sync as you type.\n\n• Uses BigInt arithmetic, not floating-point, so large values (like 1 ETH = 1,000,000,000,000,000,000 Wei) are always exact\n• Quick-fill chips for common values: 1 ETH, a typical 20 Gwei gas price, and the 21000 Wei base gas cost of a simple transfer\n• Useful for reading gas estimates, RPC logs, and contract values that come back in raw Wei\n• Runs entirely in your browser — never paste a private key or seed phrase into this or any online tool",
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    seoTitle: "Free Image Compressor Online — Compress JPG, PNG & WebP",
    description: "Compress JPG, PNG, and WebP images online with a quality slider and before/after size comparison. Free, private, and 100% browser-based — no upload to a server.",
    category: "images",
    icon: "Minimize2",
    keywords: ["image compressor", "compress jpg", "compress png", "webp compressor", "reduce image size", "optimize image"],
    isNew: true,
    explainer:
      "Shrink image file size without leaving your browser. Upload a JPG, PNG, WebP, or GIF, tune quality, pick an output format, and download the result.\n\n• Before/after preview with exact byte savings\n• JPEG, WebP, and PNG output\n• Everything runs locally via the Canvas API — your images are never uploaded",
  },
  {
    slug: "image-resizer",
    name: "Image Resizer",
    seoTitle: "Free Image Resizer Online — Resize Photos by Exact Pixels",
    description: "Resize images to exact pixel dimensions online with optional aspect-ratio lock. Free image resizer for JPG, PNG, and WebP — runs entirely in your browser.",
    category: "images",
    icon: "Scaling",
    keywords: ["image resizer", "resize image", "resize photo", "change image size", "scale image online"],
    isNew: true,
    explainer:
      "Set exact width and height, lock aspect ratio if you want, and download a resized copy instantly.\n\n• Works with PNG, JPG, WebP, and GIF\n• Live preview of original vs resized\n• No uploads — resizing happens on your device",
  },
  {
    slug: "favicon-generator",
    name: "Favicon Generator",
    seoTitle: "Free Favicon Generator Online — From Text or Image",
    description: "Generate favicon PNGs (16, 32, 48) and an Apple Touch icon from text or an uploaded image. Free favicon maker — no sign-up, runs in your browser.",
    category: "images",
    icon: "AppWindow",
    keywords: ["favicon generator", "favicon maker", "apple touch icon", "create favicon", "favicon from text"],
    isNew: true,
    explainer:
      "Create a favicon pack from initials/text or a source image. Download 16×16, 32×32, 48×48, and 180×180 (Apple Touch) PNGs ready for your site.\n\n• Text mode with background and foreground colors\n• Image mode with cover-crop to square\n• Fully client-side — nothing is uploaded",
  },
  {
    slug: "css-gradient-generator",
    name: "CSS Gradient Generator",
    seoTitle: "CSS Gradient Generator — Free Linear, Radial & Conic Builder",
    description: "Create beautiful CSS gradients visually — linear, radial, and conic — with live preview and copy-ready CSS. Free online CSS gradient generator.",
    category: "css",
    icon: "Blend",
    keywords: ["css gradient generator", "linear gradient", "radial gradient", "conic gradient", "css background gradient"],
    isNew: true,
    explainer:
      "Build linear, radial, or conic gradients with up to six color stops, live preview, and one-click copy of the CSS background rule.\n\n• Angle control for linear and conic gradients\n• Editable hex colors and stop positions\n• Perfect for hero backgrounds, buttons, and UI accents",
  },
  {
    slug: "meta-tag-generator",
    name: "Meta Tag Generator",
    seoTitle: "Free Meta Tag & Open Graph Generator Online",
    description: "Generate SEO meta tags, Open Graph, and Twitter Card tags with live Google and social previews. Free meta tag generator — copy-ready HTML.",
    category: "web",
    icon: "Tags",
    keywords: ["meta tag generator", "open graph generator", "og tags", "twitter card generator", "seo meta tags"],
    isNew: true,
    explainer:
      "Fill in title, description, URL, and image — get complete <title>, description, canonical, Open Graph, and Twitter Card tags.\n\n• Live Google SERP preview and social card preview\n• Character-length hints for title and description\n• Copy the full HTML snippet in one click",
  },
  {
    slug: "bcrypt-generator",
    name: "Bcrypt Generator",
    seoTitle: "Bcrypt Hash Generator & Verifier — Free Online Tool",
    description: "Generate and verify bcrypt password hashes online with a configurable cost factor. Free bcrypt tool — runs entirely in your browser with bcryptjs.",
    category: "security",
    icon: "LockKeyhole",
    keywords: ["bcrypt generator", "bcrypt hash", "bcrypt verifier", "password hash", "bcrypt online"],
    isNew: true,
    explainer:
      "Hash passwords with bcrypt and verify existing hashes. Choose cost rounds (4–14); 10–12 is typical for production.\n\n• Generate and verify in one page\n• Uses bcryptjs — your password never leaves the browser\n• Useful for testing fixtures and checking hashes from logs (never paste production secrets into any online tool if you can avoid it)",
  },
  {
    slug: "chmod-calculator",
    name: "chmod Calculator",
    seoTitle: "chmod Calculator Online — Unix File Permissions Generator",
    description: "Calculate Unix file permissions visually and get octal, symbolic, and chmod command output. Free chmod calculator with common presets (644, 755, and more).",
    category: "generators",
    icon: "FileCog",
    keywords: ["chmod calculator", "unix permissions", "file permissions", "chmod 755", "chmod generator"],
    isNew: true,
    explainer:
      "Toggle read/write/execute for owner, group, and public — instantly see octal (e.g. 755), symbolic (rwxr-xr-x), and a ready-to-paste chmod command.\n\n• Presets for 644, 755, 600, 700, and 777\n• Optional setuid, setgid, and sticky bit\n• Edit octal directly to update the checkboxes",
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return tools.filter((t) => t.category === category);
}

/** Type guard: is `value` a valid tool category slug? */
export function isToolCategory(value: string): value is ToolCategory {
  // Object.hasOwn (not `in`) so inherited keys like "__proto__"/"constructor"
  // aren't accepted as categories, which would bypass notFound() on bad URLs.
  return Object.hasOwn(CATEGORY_LABELS, value);
}

/** Returns a new array of tools sorted alphabetically by name. */
export function sortToolsByName(items: Tool[]): Tool[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

/** Category keys sorted alphabetically by their display label. */
export const CATEGORY_ORDER: ToolCategory[] = (Object.keys(CATEGORY_LABELS) as ToolCategory[]).sort(
  (a, b) => CATEGORY_LABELS[a].localeCompare(CATEGORY_LABELS[b])
);

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

/** True when the tool processes everything locally and sends nothing to a server. */
export function isClientSideOnly(tool: Tool): boolean {
  return (tool.dataFlow ?? "client") === "client";
}

/**
 * Honest answer to "Is {tool} free?" that also states the data-flow model, so
 * the copy (and the FAQ structured data built from it) never contradicts a
 * tool that actually sends data to a backend or third-party API.
 */
export function getIsFreeFaqAnswer(tool: Tool): string {
  if (isClientSideOnly(tool)) {
    return `Yes, ${tool.name} is completely free. No account or sign-up required, and all processing happens in your browser — nothing is sent to a server.`;
  }
  return `Yes, ${tool.name} is completely free — no account or sign-up required. This tool sends your input to a backend service to work (see the tool description and our Privacy Policy for exactly what's sent and why).`;
}

/**
 * Honest answer to "Is my data safe when I use {tool}?", generated from the
 * same `dataFlow` field so it's systematic rather than hand-written per tool.
 */
export function getDataSafetyFaqAnswer(tool: Tool): string {
  if (isClientSideOnly(tool)) {
    return `Yes. ${tool.name} runs entirely in your browser using JavaScript and Web APIs — your input is never uploaded, transmitted, or stored on any server.`;
  }
  return `${tool.name} sends your input to a backend service (or third-party API) to work, so it isn't purely local like most CodingAnthem tools. We only send what's needed to produce the result, and don't use it for anything else — see the Privacy Policy for exactly what's sent and why.`;
}
