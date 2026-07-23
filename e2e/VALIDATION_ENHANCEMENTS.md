# Validation follow-ups

Full Playwright suite covers all 60 tools (load smoke + happy-path).

**Status:** the definite enhancements listed below were **implemented** (shared `ToolPageHeader`, Load sample / auto-generate, Clear/JWT/compressor/AI Copy fixes, `role="alert"` on image errors).

## Implemented

### Heading chrome
- `ai-code-explainer`, `ai-sql-generator`, `ai-error-explainer`, `url-shortener`, `image-to-base64`, `totp-generator`, `jwt-generator`, `json-diff`, `text-diff`, `regex-tester` → `ToolPageHeader` (breadcrumb + real H1)

### Empty first paint
- AI tools + `bcrypt-generator` → Load sample
- `eth-unit-converter` → prefills 1 ETH
- `uuid-generator` / `lorem-ipsum` → generate on mount; Regenerate always enabled

### UX bugs
- `password-generator` Clear clears output only
- `jwt-validator` hint when token present / secret empty
- `image-compressor` Download original when kept
- `ai-error-explainer` Copy button

### A11y
- `role="alert"` on image tool (and related) error messages

## Re-run

```bash
npm run build && npm run test:e2e
```
