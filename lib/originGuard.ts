import type { NextRequest } from "next/server";

const ALLOWED_ORIGINS = new Set([
  "https://codinganthem.com",
  "https://www.codinganthem.com",
]);

// Allow localhost during development
if (process.env.NODE_ENV !== "production") {
  ALLOWED_ORIGINS.add("http://localhost:3000");
}

/**
 * Best-effort check that a request originated from a same-origin browser
 * fetch/form submission, not a direct API call (Postman, curl, another site).
 *
 * `Sec-Fetch-Site` is set by the browser itself — it cannot be forged via a
 * normal `fetch()` call from page JavaScript, and tools like curl/Postman
 * don't send it by default. This blocks casual/naive direct-API testing.
 *
 * Not a true security boundary: a determined attacker can still manually
 * craft this header in a raw HTTP client. Per-IP rate limiting and input
 * validation remain the real backstop and must stay in place regardless.
 */
export function isSameOriginRequest(req: NextRequest): boolean {
  const secFetchSite = req.headers.get("sec-fetch-site");
  if (secFetchSite) {
    return secFetchSite === "same-origin";
  }

  // Fallback for the rare browser/proxy that strips Sec-Fetch-Site
  const origin = req.headers.get("origin");
  if (origin) {
    return ALLOWED_ORIGINS.has(origin);
  }

  // No Sec-Fetch-Site and no Origin header at all is exactly the fingerprint
  // of a bare curl/Postman request — reject.
  return false;
}
