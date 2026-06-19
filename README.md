# codinganthem

Fast, free developer tools that run entirely in your browser — and pair well with AI workflows.

🔗 [www.codinganthem.com](https://www.codinganthem.com)

All 28 tools run **100% client-side**. No backend, no database, no sign-up — your data never leaves your machine.

## Tools

### Formatters
- JSON Formatter — beautify, minify, and validate with syntax highlighting
- Markdown Previewer — live rendered HTML preview
- JSON Statistics — node count, depth, type distribution, and size
- JSON Diff — compare two JSON documents (key-sorted, noise-free)

### Encoders
- Base64 Encoder / Decoder
- String Escape / Unescape

### Generators
- UUID Generator (v4)
- Lorem Ipsum Generator

### Converters
- Unix Timestamp Converter
- Color Converter (HEX ↔ RGB ↔ HSL)
- Number Base Converter (binary, octal, decimal, hex)
- Cron Expression Parser
- CSV to JSON
- JSON to CSV
- YAML to JSON
- JSON to YAML

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

### Web
- URL Encoder / Decoder
- URL Parser — protocol, host, path, query params, hash
- HTML Entities Encoder / Decoder
- Slug Generator

## Stack

- [Next.js 16](https://nextjs.org) (App Router, TypeScript)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Lucide React](https://lucide.dev)
- [cmdk](https://cmdk.paco.me) — ⌘K command palette
- [yaml](https://eemeli.org/yaml/) and [marked](https://marked.js.org) for YAML / Markdown parsing

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

## License

Free forever.
