import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ShortUrl from "@/lib/models/ShortUrl";
import { checkRateLimit } from "@/lib/rateLimit";
import {
  validateUrl,
  validateSlug,
  generateSlug,
  RESERVED_SLUGS,
} from "@/lib/urlValidation";

const RATE_LIMIT = 10;        // requests
const RATE_WINDOW = 60_000;   // 1 minute

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

  const { url, slug: rawSlug, expiry = "never" } = body;

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

  // Resolve final slug
  let finalSlug = rawSlug?.toLowerCase().trim() || "";

  if (finalSlug) {
    // Check custom slug is not taken
    const existing = await ShortUrl.findOne({ slug: finalSlug }).lean();
    if (existing) {
      return NextResponse.json(
        { error: `The slug "${finalSlug}" is already taken. Try a different one.` },
        { status: 409 }
      );
    }
    if (RESERVED_SLUGS.has(finalSlug)) {
      return NextResponse.json(
        { error: `"${finalSlug}" is reserved and cannot be used.` },
        { status: 422 }
      );
    }
  } else {
    // Auto-generate unique slug
    let attempts = 0;
    while (attempts < 5) {
      const candidate = generateSlug(8);
      const taken = await ShortUrl.exists({ slug: candidate });
      if (!taken) { finalSlug = candidate; break; }
      attempts++;
    }
    if (!finalSlug) {
      return NextResponse.json(
        { error: "Could not generate a unique slug. Please try again." },
        { status: 500 }
      );
    }
  }

  // Calculate expiry date
  const expiryMs = EXPIRY_MAP[expiry];
  const expiresAt = expiryMs ? new Date(Date.now() + expiryMs) : null;

  // Save to DB
  try {
    await ShortUrl.create({
      slug: finalSlug,
      originalUrl: url,
      clicks: 0,
      expiresAt,
    });
  } catch (err: unknown) {
    // Handle duplicate key race condition
    if ((err as { code?: number }).code === 11000) {
      return NextResponse.json(
        { error: "That slug was just taken. Please try again." },
        { status: 409 }
      );
    }
    console.error("[shorten] DB error:", err);
    return NextResponse.json(
      { error: "Failed to save. Please try again." },
      { status: 500 }
    );
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
