# codinganthem

The developer toolbox you always wanted — fast, free, and private. Growing collection of tools.

🔗 [www.codinganthem.com](https://www.codinganthem.com) &nbsp;·&nbsp; [![Buy Me a Coffee](https://img.shields.io/badge/Support-Buy%20Me%20a%20Coffee-6366f1?style=flat&logo=buy-me-a-coffee&logoColor=white)](https://buymeacoffee.com/codinganthem)

All 38 tools run **100% client-side**. No backend, no database, no sign-up — your data never leaves your machine.

## Tools

### Formatters
- JSON Formatter — beautify, minify, and validate with syntax highlighting
- SQL Formatter — format SQL queries with dialect-aware indentation
- JavaScript Formatter — beautify minified or messy JS
- HTML Formatter — beautify HTML markup
- CSS Formatter — beautify minified CSS
- Markdown Previewer — live rendered HTML preview
- JSON Statistics — node count, depth, type distribution, and size
- JSON Diff — compare two JSON documents (key-sorted, noise-free)

### Encoders
- Base64 Encoder / Decoder
- Image to Base64 — convert any image to a Base64 data URL
- String Escape / Unescape

### Generators
- UUID Generator (v4)
- Lorem Ipsum Generator
- QR Code Generator — generate QR codes from any text or URL

### Converters
- Unix Timestamp Converter
- Color Converter (HEX ↔ RGB ↔ HSL)
- Number Base Converter (binary, octal, decimal, hex)
- Cron Expression Parser
- CSV to JSON
- JSON to CSV
- YAML to JSON
- JSON to YAML
- JSON to TypeScript — generate interfaces from JSON
- SQL IN Generator — turn a list of values into a SQL IN clause

### Text Utils
- Regex Tester — live inline match highlighting
- Case Converter (camelCase, snake_case, PascalCase, kebab-case, …)
- Text Diff — side-by-side comparison
- Word Counter — words, characters, sentences, reading time

### Security
- Hash Generator (MD5, SHA-1, SHA-256, SHA-512)
- Password Generator — cryptographically secure
- JWT Decoder — inspect header, payload, signature
- JWT Generator — sign tokens with HS256/384/512
- JWT Validator — verify JWT signature and expiry

### Web
- URL Encoder / Decoder
- URL Parser — protocol, host, path, query params, hash
- HTML Entities Encoder / Decoder
- Slug Generator
- cURL to Fetch — convert a curl command to a JavaScript fetch() call

## Stack

- [Next.js 16](https://nextjs.org) (App Router, TypeScript)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Lucide React](https://lucide.dev)
- [cmdk](https://cmdk.paco.me) — ⌘K command palette
- [yaml](https://eemeli.org/yaml/) and [marked](https://marked.js.org) for YAML / Markdown parsing
- [sql-formatter](https://sql-formatter-org.github.io/sql-formatter/) for SQL formatting
- [js-beautify](https://github.com/beautifier/js-beautify) for JS / HTML / CSS formatting
- [qrcode](https://www.npmjs.com/package/qrcode) for QR code generation

Tools are statically generated per route and code-split with `next/dynamic`, so each tool only loads its own bundle.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run lint    # lint
```

## Privacy

Every tool runs client-side in your browser using JavaScript and Web APIs. No data is transmitted to any server, there are no accounts, and no tracking beyond privacy-respecting analytics.

## Support

If CodingAnthem saved you time, consider buying a coffee — it helps keep the tools free and growing.

[![Buy Me a Coffee](https://img.shields.io/badge/Support-buymeacoffee.com/codinganthem-6366f1?style=flat&logo=buy-me-a-coffee&logoColor=white)](https://buymeacoffee.com/codinganthem)

## License

Free forever.
