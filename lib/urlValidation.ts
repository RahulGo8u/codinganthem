// Reserved slugs that cannot be used as short URL aliases
export const RESERVED_SLUGS = new Set([
  "api", "r", "s", "tools", "about", "blog", "admin", "dashboard",
  "login", "logout", "signup", "register", "sitemap", "robots",
  "favicon", "manifest", "health", "status", "ping",
]);

// Private/local IP ranges to block (SSRF prevention)
const BLOCKED_HOSTNAMES = [
  /^localhost$/i,
  /^127\.\d+\.\d+\.\d+$/,
  /^10\.\d+\.\d+\.\d+$/,
  /^192\.168\.\d+\.\d+$/,
  /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/,
  /^0\.0\.0\.0$/,
  /^::1$/,
  /^fc[0-9a-f]{2}:/i,  // IPv6 ULA
];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateUrl(url: string): ValidationResult {
  if (!url || url.length > 2048) {
    return { valid: false, error: "URL must be between 1 and 2048 characters." };
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { valid: false, error: "Invalid URL format. Must start with http:// or https://" };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { valid: false, error: "Only http:// and https:// URLs are allowed." };
  }

  const hostname = parsed.hostname.toLowerCase();
  for (const pattern of BLOCKED_HOSTNAMES) {
    if (pattern.test(hostname)) {
      return { valid: false, error: "URLs pointing to private or local addresses are not allowed." };
    }
  }

  return { valid: true };
}

export function validateSlug(slug: string): ValidationResult {
  if (!slug) return { valid: true }; // empty = auto-generate, that's fine

  if (slug.length < 3 || slug.length > 20) {
    return { valid: false, error: "Custom slug must be between 3 and 20 characters." };
  }

  if (!/^[a-z0-9-]+$/.test(slug.toLowerCase())) {
    return { valid: false, error: "Slug may only contain lowercase letters, numbers, and hyphens." };
  }

  if (RESERVED_SLUGS.has(slug.toLowerCase())) {
    return { valid: false, error: `"${slug}" is a reserved word and cannot be used as a slug.` };
  }

  return { valid: true };
}

export function generateSlug(length = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  // Use crypto for randomness if available (Node.js 15+)
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (const byte of array) {
    result += chars[byte % chars.length];
  }
  return result;
}
