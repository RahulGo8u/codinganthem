# CodingAnthem — Free Online Developer Tools

[![Live](https://img.shields.io/badge/Live-codinganthem.com-6366f1?style=flat)](https://www.codinganthem.com)
[![GitHub stars](https://img.shields.io/github/stars/RahulGo8u/codinganthem?style=flat&color=6366f1)](https://github.com/RahulGo8u/codinganthem)
[![Buy Me a Coffee](https://img.shields.io/badge/Support-Buy%20Me%20a%20Coffee-6366f1?style=flat&logo=buy-me-a-coffee&logoColor=white)](https://buymeacoffee.com/codinganthem)

**CodingAnthem** is a free online developer toolbox — JSON formatter, Base64 encoder/decoder, JWT decoder, UUID generator, regex tester, image compressor, bcrypt hash generator, and 50+ more utilities. No sign-up, no ads. Most tools run **100% client-side** in your browser.

🔗 [www.codinganthem.com](https://www.codinganthem.com) · [X / Twitter](https://x.com/codinganthem) · [YouTube](https://www.youtube.com/@codinganthem)

A few tools (like URL Shortener) use a lightweight backend, and AI tools send input to Google's Gemini API — always noted on the tool page.

## Top tools

| Tool | What it does |
|------|----------------|
| [JSON Formatter](https://www.codinganthem.com/tools/json-formatter) | Beautify, minify, and validate JSON |
| [Base64 Encoder / Decoder](https://www.codinganthem.com/tools/base64) | Encode and decode Base64 strings |
| [JWT Decoder](https://www.codinganthem.com/tools/jwt-decoder) | Inspect header, payload, and signature |
| [Image Compressor](https://www.codinganthem.com/tools/image-compressor) | Compress JPG, PNG, and WebP in-browser |
| [Password Generator](https://www.codinganthem.com/tools/password-generator) | Cryptographically secure passwords |
| [Meta Tag Generator](https://www.codinganthem.com/tools/meta-tag-generator) | SEO, Open Graph, and Twitter Card tags |
| [Bcrypt Generator](https://www.codinganthem.com/tools/bcrypt-generator) | Hash and verify bcrypt passwords |
| [Word Counter](https://www.codinganthem.com/tools/word-counter) | Words, characters, reading time |

## Tools

### AI
- AI Code Explainer — paste any code snippet and get a plain-English explanation, powered by Gemini
- AI Error Message Explainer — paste an error or stack trace and get a diagnosis, likely cause, and fix, powered by Gemini
- AI Text-to-SQL Generator — describe a query in plain English and get a ready-to-use SQL statement, powered by Gemini
- Prompt Template Filler — fill in {{variables}} in a prompt template and open the result directly in ChatGPT
- Token Counter & Estimator — count tokens and estimate API cost for GPT, Claude, and Gemini models

### Converters
- Color Contrast Checker — check WCAG contrast ratio between two colors for accessibility
- Color Converter (HEX ↔ RGB ↔ HSL)
- Cron Expression Parser
- CSV to JSON
- JSON to CSV
- JSON to TypeScript — generate interfaces from JSON
- JSON to YAML
- Number Base Converter (binary, octal, decimal, hex)
- SQL IN Generator — turn a list of values into a SQL IN clause
- Unix Timestamp Converter
- XML to JSON
- YAML to JSON

### CSS
- CSS Gradient Generator — visual linear, radial, and conic gradients with copy-ready CSS

### Encoders
- Base64 Encoder / Decoder
- Image to Base64 — convert any image to a Base64 data URL
- String Escape / Unescape

### Formatters
- CSS Formatter — beautify minified CSS
- HTML Formatter — beautify HTML markup
- JavaScript Formatter — beautify minified or messy JS
- JSON Diff — compare two JSON documents (key-sorted, noise-free)
- JSON Formatter — beautify, minify, and validate with syntax highlighting
- JSON Statistics — node count, depth, type distribution, and size
- SQL Formatter — format SQL queries with dialect-aware indentation
- XML Formatter — format and validate XML with syntax highlighting

### Generators
- chmod Calculator — Unix file permissions to octal, symbolic, and chmod command
- Lorem Ipsum Generator
- Mock Data Generator — generate realistic fake data (names, emails, addresses, and more)
- QR Code Generator — generate QR codes from any text or URL
- UUID Generator (v4)

### Images
- Favicon Generator — create favicon PNGs from text or an image
- Image Compressor — compress JPG, PNG, and WebP with quality control
- Image Resizer — resize images to exact pixel dimensions

### Security
- Bcrypt Generator — generate and verify bcrypt password hashes
- Hash Generator (MD5, SHA-1, SHA-256, SHA-512)
- JWT Decoder — inspect header, payload, signature
- JWT Generator — sign tokens with HS256/384/512
- JWT Validator — verify JWT signature and expiry
- Password Generator — cryptographically secure
- TOTP / OTP Generator — RFC 6238 time-based one-time passwords

### Text Utils
- Case Converter (camelCase, snake_case, PascalCase, kebab-case, …)
- Regex Tester — live inline match highlighting
- Text Diff — side-by-side comparison
- Word Counter — words, characters, sentences, reading time

### Visualizers
- Markdown Previewer — live rendered HTML preview
- Mermaid Diagram Viewer — render flowcharts, sequence, ER, class, and Gantt diagrams with zoom, pan, and fullscreen

### Web
- cURL to Fetch — convert a curl command to a JavaScript fetch() call
- HTML Entities Encoder / Decoder
- Meta Tag Generator — SEO, Open Graph, and Twitter Card tags with live preview
- Slug Generator
- URL Encoder / Decoder
- URL Parser — protocol, host, path, query params, hash
- URL Shortener — shorten any URL and get a shareable codinganthem.com/r/ link (uses a backend — see Privacy below)
- User-Agent Parser — browser, engine, OS, and device detection

### Web3
- ETH Unit Converter — convert between Wei, Kwei, Mwei, Gwei, Szabo, Finney, and Ether with exact BigInt precision

## Stack

- [Next.js 16](https://nextjs.org) (App Router, TypeScript)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Lucide React](https://lucide.dev)
- [cmdk](https://cmdk.paco.me) — ⌘K command palette
- [yaml](https://eemeli.org/yaml/) and [marked](https://marked.js.org) for YAML / Markdown parsing
- [mermaid](https://mermaid.js.org) for diagram rendering
- [sql-formatter](https://sql-formatter-org.github.io/sql-formatter/) for SQL formatting
- [js-beautify](https://www.npmjs.com/package/js-beautify) for JS / HTML / CSS formatting
- [qrcode](https://www.npmjs.com/package/qrcode) for QR code generation
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) for client-side bcrypt hashing
- [Mongoose](https://mongoosejs.com) + MongoDB Atlas for the URL Shortener backend and AI usage tracking
- [Google Gemini API](https://ai.google.dev) for the AI-powered tools
- [@vercel/analytics](https://vercel.com/docs/analytics) and [Plausible](https://plausible.io) for privacy-respecting usage analytics

Tools are statically generated per route and code-split with `next/dynamic`, so each tool only loads its own bundle.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Requires a few environment variables to run the URL Shortener and AI tools locally — see [`ENVIRONMENT_VARIABLES.md`](ENVIRONMENT_VARIABLES.md) for the full list and setup steps. Tools that don't need a backend work without any setup.

```bash
npm run build   # production build
npm run lint    # lint
```

## Privacy

Most tools run client-side in your browser using JavaScript and Web APIs — nothing is transmitted anywhere. A small number of tools (like URL Shortener) require server-side storage to work; those tools only send the minimum data needed to function, and this is always disclosed on the tool page. The AI tools send your input to Google's Gemini API to generate a response — a distinct, third-party data flow, separate from the client-side and server-side categories above. There are no accounts, and no tracking beyond privacy-respecting analytics. Full details: [`/privacy`](https://www.codinganthem.com/privacy).

## Support

If CodingAnthem saved you time, consider buying a coffee — it helps keep the tools free and growing.

[![Buy Me a Coffee](https://img.shields.io/badge/Support-buymeacoffee.com/codinganthem-6366f1?style=flat&logo=buy-me-a-coffee&logoColor=white)](https://buymeacoffee.com/codinganthem)

## License

Free forever.
