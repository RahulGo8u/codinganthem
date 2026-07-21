import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ShortUrl from "@/lib/models/ShortUrl";
import { checkRateLimit } from "@/lib/rateLimit";
import { isSameOriginRequest } from "@/lib/originGuard";
import { isBodyTooLarge } from "@/lib/requestSizeLimit";
import {
  validateUrl,
  validateSlug,
  generateSlug,
  RESERVED_SLUGS,
} from "@/lib/urlValidation";

// Colocate with the MongoDB Atlas cluster (AWS Mumbai / ap-south-1) to avoid
// cross-region round trips on every connection + query.
export const preferredRegion = "bom1";

const RATE_LIMIT = 10;        // requests
const RATE_WINDOW = 60_000;   // 1 minute
const MAX_BODY_BYTES = 10_000; // generous for a URL + slug + expiry payload

const EXPIRY_MAP: Record<string, number | null> = {
  "1h":   60 * 60 * 1000,
  "24h":  24 * 60 * 60 * 1000,
  "7d":   7 * 24 * 60 * 60 * 1000,
  "30d":  30 * 24 * 60 * 60 * 1000,
  "never": null,
};

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  // Block direct API calls (Postman/curl/other sites) — see lib/originGuard.ts
  // for what this does and does not protect against.
  if (!isSameOriginRequest(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (isBodyTooLarge(req, MAX_BODY_BYTES)) {
    return NextResponse.json({ error: "Request body too large." }, { status: 413 });
  }

  // Rate limit by IP
  const ip = getClientIp(req);
  const rl = checkRateLimit(`${ip}:shorten`, RATE_LIMIT, RATE_WINDOW);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // Parse body
  let body: { url?: string; slug?: string; expiry?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Explicitly coerce to string — req.json() returns `any` at runtime, so a
  // malformed body could otherwise pass an object (e.g. a Mongo operator
  // like { $ne: null }) where a string is expected. The TS annotation on
  // `body` above is compile-time only and gives no runtime guarantee.
  const url = typeof body.url === "string" ? body.url : "";
  const rawSlug = typeof body.slug === "string" ? body.slug : "";
  const expiry = typeof body.expiry === "string" ? body.expiry : "never";

  // Validate URL
  const urlResult = validateUrl(url ?? "");
  if (!urlResult.valid) {
    return NextResponse.json({ error: urlResult.error }, { status: 422 });
  }

  // Validate slug
  const slugResult = validateSlug(rawSlug ?? "");
  if (!slugResult.valid) {
    return NextResponse.json({ error: slugResult.error }, { status: 422 });
  }

  // Validate expiry
  if (!(expiry in EXPIRY_MAP)) {
    return NextResponse.json(
      { error: "Invalid expiry. Use: 1h, 24h, 7d, 30d, or never." },
      { status: 422 }
    );
  }

  // Connect to DB
  try {
    await connectDB();
  } catch (err) {
    console.error("[shorten] DB connection error:", err);
    return NextResponse.json(
      { error: "Service temporarily unavailable. Please try again." },
      { status: 503 }
    );
  }

  const customSlug = rawSlug?.toLowerCase().trim() || "";

  // Reserved-word check is a cheap in-memory lookup — do it before touching the DB
  if (customSlug && RESERVED_SLUGS.has(customSlug)) {
    return NextResponse.json(
      { error: `"${customSlug}" is reserved and cannot be used.` },
      { status: 422 }
    );
  }

  // Calculate expiry date
  const expiryMs = EXPIRY_MAP[expiry];
  const expiresAt = expiryMs ? new Date(Date.now() + expiryMs) : null;

  // Rely on the unique index on `slug` instead of a separate existence check
  // beforehand — this cuts the request down to a single DB round trip in the
  // common (non-collision) case, which matters a lot on a cross-region
  // connection. Duplicate-key errors (code 11000) tell us the slug was taken.
  let finalSlug = customSlug;
  const MAX_AUTO_ATTEMPTS = 5;

  for (let attempt = 0; ; attempt++) {
    if (!finalSlug) finalSlug = generateSlug(5);

    try {
      await ShortUrl.create({
        slug: finalSlug,
        originalUrl: url,
        clicks: 0,
        expiresAt,
      });
      break; // success
    } catch (err: unknown) {
      const isDuplicateKey = (err as { code?: number }).code === 11000;

      if (!isDuplicateKey) {
        console.error("[shorten] DB error:", err);
        return NextResponse.json(
          { error: "Failed to save. Please try again." },
          { status: 500 }
        );
      }

      if (customSlug) {
        // User-chosen slug is taken — nothing to retry, surface it directly
        return NextResponse.json(
          { error: `The slug "${customSlug}" is already taken. Try a different one.` },
          { status: 409 }
        );
      }

      // Auto-generated slug collided (astronomically rare) — retry with a new one
      finalSlug = "";
      if (attempt >= MAX_AUTO_ATTEMPTS - 1) {
        return NextResponse.json(
          { error: "Could not generate a unique slug. Please try again." },
          { status: 500 }
        );
      }
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://codinganthem.com";

  return NextResponse.json(
    {
      shortUrl: `${baseUrl}/r/${finalSlug}`,
      slug: finalSlug,
      expiresAt: expiresAt?.toISOString() ?? null,
    },
    { status: 201 }
  );
}
