# Large-data QA checklist

Manual pass/fail matrix for CodingAnthem tools.

**Automated coverage:** `npm run test:e2e` runs load smoke for all 60 tools plus happy-path interaction (Load sample / Generate / upload / mocked API) for every slug. Deep large-payload and hunk-nav checks remain for JSON/Text/PDF Compare and Regex Tester.

**How to use this checklist:** for each tool, paste/upload the large-input recipe below, confirm the expected behavior, tick Pass/Fail.

**Global expects:** page loads; no blank screen; UI stays responsive (progress shown if >3s); Clear / reset works; no uncaught console errors for happy path.

| Pass | Fail | Tool | Route | Large-input recipe | Expected |
|:----:|:----:|------|-------|--------------------|----------|
| ☐ | ☐ | AI Code Explainer | `/tools/ai-code-explainer` | ~80-line function (Gemini) | 200 + useful response (or honest rate-limit message) |
| ☐ | ☐ | AI Error Message Explainer | `/tools/ai-error-explainer` | Multi-frame stack trace | 200 + useful response (or honest rate-limit message) |
| ☐ | ☐ | AI Text-to-SQL Generator | `/tools/ai-sql-generator` | Long plain-English query (~300 chars) | 200 + useful response (or honest rate-limit message) |
| ☐ | ☐ | Base64 Encoder / Decoder | `/tools/base64` | Long string / medium file | Renders correct output; no crash |
| ☐ | ☐ | Bcrypt Generator | `/tools/bcrypt-generator` | Long token/hash input | Renders correct output; no crash |
| ☐ | ☐ | Case Converter | `/tools/case-converter` | Long multi-line text | Renders correct output; no crash |
| ☐ | ☐ | chmod Calculator | `/tools/chmod-calculator` | Bulk / high-count generation | Renders correct output; no crash |
| ☐ | ☐ | Color Contrast Checker | `/tools/color-contrast-checker` | Large structured document (50KB+) | Renders correct output; no crash |
| ☐ | ☐ | Color Converter | `/tools/color-converter` | Large structured document (50KB+) | Renders correct output; no crash |
| ☐ | ☐ | Cron Expression Parser | `/tools/cron-parser` | Large structured document (50KB+) | Renders correct output; no crash |
| ☐ | ☐ | CSS Formatter | `/tools/css-formatter` | Large minified payload (50–200KB) | Renders correct output; no crash |
| ☐ | ☐ | CSS Gradient Generator | `/tools/css-gradient-generator` | Complex gradient config | Renders correct output; no crash |
| ☐ | ☐ | CSV to JSON | `/tools/csv-to-json` | Large structured document (50KB+) | Renders correct output; no crash |
| ☐ | ☐ | cURL to Fetch | `/tools/curl-to-fetch` | Long URL / HTML / meta content | Renders correct output; no crash |
| ☐ | ☐ | ETH Unit Converter | `/tools/eth-unit-converter` | Large Wei/Ether values | Renders correct output; no crash |
| ☐ | ☐ | Favicon Generator | `/tools/favicon-generator` | 1024×1024 PNG source | Renders correct output; no crash |
| ☐ | ☐ | Hash Generator | `/tools/hash-generator` | Long token/hash input | Renders correct output; no crash |
| ☐ | ☐ | HTML Entities Encoder / Decoder | `/tools/html-entities` | Long URL / HTML / meta content | Renders correct output; no crash |
| ☐ | ☐ | HTML Formatter | `/tools/html-formatter` | Large minified payload (50–200KB) | Renders correct output; no crash |
| ☐ | ☐ | Image Compressor | `/tools/image-compressor` | 8–10MB JPG/PNG near 10MB limit | Renders correct output; no crash |
| ☐ | ☐ | Image Resizer | `/tools/image-resizer` | Large PNG (5–10MB) | Renders correct output; no crash |
| ☐ | ☐ | Image to Base64 | `/tools/image-to-base64` | Long string / medium file | Renders correct output; no crash |
| ☐ | ☐ | JavaScript Formatter | `/tools/js-formatter` | Large minified payload (50–200KB) | Renders correct output; no crash |
| ☐ | ☐ | JSON Compare | `/tools/json-diff` | e2e/fixtures/large-a.json vs large-b.json | Stats + Comparison panel; Prev/Next hunks; last hunk reachable without full manual scroll |
| ☐ | ☐ | JSON Formatter | `/tools/json-formatter` | 50–100KB nested JSON (array of 200 objects) | Renders correct output; no crash |
| ☐ | ☐ | JSON Statistics | `/tools/json-statistics` | Large minified payload (50–200KB) | Renders correct output; no crash |
| ☐ | ☐ | JSON to CSV | `/tools/json-to-csv` | Large structured document (50KB+) | Renders correct output; no crash |
| ☐ | ☐ | JSON to TypeScript | `/tools/json-to-typescript` | Large structured document (50KB+) | Renders correct output; no crash |
| ☐ | ☐ | JSON to YAML | `/tools/json-to-yaml` | Large structured document (50KB+) | Renders correct output; no crash |
| ☐ | ☐ | JWT Decoder | `/tools/jwt-decoder` | Long token/hash input | Renders correct output; no crash |
| ☐ | ☐ | JWT Generator | `/tools/jwt-generator` | Long token/hash input | Renders correct output; no crash |
| ☐ | ☐ | JWT Validator | `/tools/jwt-validator` | Long token/hash input | Renders correct output; no crash |
| ☐ | ☐ | Lorem Ipsum Generator | `/tools/lorem-ipsum` | Bulk / high-count generation | Renders correct output; no crash |
| ☐ | ☐ | Markdown Previewer | `/tools/markdown-preview` | 10–20KB markdown with tables/code | Renders correct output; no crash |
| ☐ | ☐ | Mermaid Diagram Viewer | `/tools/mermaid-viewer` | Large flowchart (80+ nodes) | Renders correct output; no crash |
| ☐ | ☐ | Meta Tag Generator | `/tools/meta-tag-generator` | Long URL / HTML / meta content | Renders correct output; no crash |
| ☐ | ☐ | Mock Data Generator | `/tools/mock-data-generator` | Generate 200–500 rows JSON | Renders correct output; no crash |
| ☐ | ☐ | Number Base Converter | `/tools/base-converter` | Large structured document (50KB+) | Renders correct output; no crash |
| ☐ | ☐ | Password Generator | `/tools/password-generator` | Long token/hash input | Renders correct output; no crash |
| ☐ | ☐ | PDF Compare | `/tools/pdf-compare` | Two multi-page PDFs ≤10MB / ≤50 pages (sample-a/b.pdf) | Compare finishes; Next diff skips identical pages; reject invalid PDF |
| ☐ | ☐ | Prompt Template Filler | `/tools/prompt-template-filler` | Long prompt within tool limits | Renders correct output; no crash |
| ☐ | ☐ | QR Code Generator | `/tools/qr-code-generator` | Bulk / high-count generation | Renders correct output; no crash |
| ☐ | ☐ | Regex Tester | `/tools/regex-tester` | e2e/fixtures/regex-haystack.txt + email pattern | Match count accurate; Prev/Next steps highlights |
| ☐ | ☐ | Slug Generator | `/tools/slug-generator` | Long URL / HTML / meta content | Renders correct output; no crash |
| ☐ | ☐ | SQL Formatter | `/tools/sql-formatter` | Large minified payload (50–200KB) | Renders correct output; no crash |
| ☐ | ☐ | SQL IN Generator | `/tools/sql-in-generator` | Large structured document (50KB+) | Renders correct output; no crash |
| ☐ | ☐ | String Escape / Unescape | `/tools/string-escape` | Long string / medium file | Renders correct output; no crash |
| ☐ | ☐ | Text Compare | `/tools/text-diff` | e2e/fixtures/large-a.txt vs large-b.txt (~400 lines) | Stats + Comparison panel; Prev/Next hunks; last hunk reachable without full manual scroll |
| ☐ | ☐ | Token Counter & Estimator | `/tools/token-counter` | 5–20KB prompt; GPT-4o Exact badge | Exact tokens for GPT (no tokenizer error) |
| ☐ | ☐ | TOTP / OTP Generator | `/tools/totp-generator` | Long token/hash input | Renders correct output; no crash |
| ☐ | ☐ | Unix Timestamp Converter | `/tools/timestamp-converter` | Large structured document (50KB+) | Renders correct output; no crash |
| ☐ | ☐ | URL Encoder / Decoder | `/tools/url-encoder` | Long URL / HTML / meta content | Renders correct output; no crash |
| ☐ | ☐ | URL Parser | `/tools/url-parser` | Long URL / HTML / meta content | Renders correct output; no crash |
| ☐ | ☐ | URL Shortener | `/tools/url-shortener` | Staging only — do not spam production | Skip on prod unless intentional |
| ☐ | ☐ | User-Agent Parser | `/tools/user-agent-parser` | Long URL / HTML / meta content | Renders correct output; no crash |
| ☐ | ☐ | UUID Generator | `/tools/uuid-generator` | Bulk / high-count generation | Renders correct output; no crash |
| ☐ | ☐ | Word Counter | `/tools/word-counter` | Long multi-line text | Renders correct output; no crash |
| ☐ | ☐ | XML Formatter | `/tools/xml-formatter` | Large minified payload (50–200KB) | Renders correct output; no crash |
| ☐ | ☐ | XML to JSON | `/tools/xml-to-json` | Large structured document (50KB+) | Renders correct output; no crash |
| ☐ | ☐ | YAML to JSON | `/tools/yaml-to-json` | Large structured document (50KB+) | Renders correct output; no crash |

## Compare tools — expanded cases

### JSON Compare (`/tools/json-diff`)
- [ ] Identical JSONs → 0 hunks / no nav (or empty change set)
- [ ] Only last keys differ → Next reaches final hunk
- [ ] Swap + Clear work
- [ ] Invalid JSON shows error, no crash
- [ ] `[` / `]` jump when focus is not in a textarea

### Text Compare (`/tools/text-diff`)
- [ ] Large files (~400+ lines) with multiple distant hunks
- [ ] Copy diff produces unified text
- [ ] Prev wraps / Next advances counter

### PDF Compare (`/tools/pdf-compare`)
- [ ] 4+ page docs where only some pages differ → Next diff skips identical
- [ ] Oversize / non-PDF rejected with clear message
- [ ] Side by side + Highlight view modes

### Regex Tester (`/tools/regex-tester`)
- [ ] 40+ matches → Next/Prev counter
- [ ] Invalid pattern shows error
