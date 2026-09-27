const FALLBACK_ORIGIN = "https://www.codinganthem.com";

/** Fresh CDN lifetime for links that never expire, in seconds. */
const PERMANENT_FRESH_SECONDS = 300;
/** Serve a stale permanent redirect while the edge refreshes it, in seconds. */
const PERMANENT_STALE_SECONDS = 86_400;
/** Upper bound for caching a link that has an expiry, in seconds. */
const EXPIRING_MAX_SECONDS = 86_400;

/**
 * Origin used in newly created short links.
 * Apex `codinganthem.com` is rewritten to `www` because the apex host 308s
 * to www before the short-link handler runs.
 */
export function normalizeShortLinkOrigin(raw: string | undefined): string {
  const value = raw?.trim() || FALLBACK_ORIGIN;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return FALLBACK_ORIGIN;
    if (url.hostname === "codinganthem.com") url.hostname = "www.codinganthem.com";
    return url.origin;
  } catch {
    return FALLBACK_ORIGIN;
  }
}

export function publicShortLinkOrigin(): string {
  return normalizeShortLinkOrigin(process.env.NEXT_PUBLIC_BASE_URL);
}

export function redirectCacheHeaders(
  expiresAt: Date | null,
  now = Date.now()
): { cacheControl: string; cdnCacheControl: string } | null {
  if (expiresAt && expiresAt.getTime() <= now) return null;

  const browser = "public, max-age=0, must-revalidate";
  if (!expiresAt) {
    return {
      cacheControl: browser,
      cdnCacheControl: `public, s-maxage=${PERMANENT_FRESH_SECONDS}, stale-while-revalidate=${PERMANENT_STALE_SECONDS}`,
    };
  }

  const remaining = Math.floor((expiresAt.getTime() - now) / 1000);
  const sMaxAge = Math.max(1, Math.min(remaining, EXPIRING_MAX_SECONDS));
  return {
    cacheControl: browser,
    cdnCacheControl: `public, s-maxage=${sMaxAge}`,
  };
}
