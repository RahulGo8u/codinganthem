import { after, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ShortUrl from "@/lib/models/ShortUrl";
import { redirectCacheHeaders } from "@/lib/shortLink";

// Node.js functions ignore preferredRegion (it only applies to the Edge
// runtime). vercel.json pins every function to bom1, next to the Atlas
// cluster in Mumbai. The default region is iad1, and that cross-region
// lookup is what made redirects slow.
export const preferredRegion = "bom1";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

const MEMORY_TTL_MS = 15_000;

type LinkRecord = {
  url: string;
  expiresAtMs: number | null;
  freshUntil: number;
};

const memory = new Map<string, LinkRecord>();
const pending = new Map<string, Promise<LinkRecord | "missing">>();

function noStore(error: string, status: number) {
  return NextResponse.json(
    { error },
    { status, headers: { "Cache-Control": "private, no-store" } }
  );
}

async function lookup(slug: string): Promise<LinkRecord | "missing"> {
  const current = pending.get(slug);
  if (current) return current;

  const task = (async () => {
    await connectDB();
    const record = await ShortUrl.findOne({ slug })
      .select({ originalUrl: 1, expiresAt: 1, _id: 0 })
      .lean<{ originalUrl: string; expiresAt: Date | null } | null>();

    if (!record) return "missing" as const;

    const entry: LinkRecord = {
      url: record.originalUrl,
      expiresAtMs: record.expiresAt ? new Date(record.expiresAt).getTime() : null,
      freshUntil: Date.now() + MEMORY_TTL_MS,
    };
    memory.set(slug, entry);
    return entry;
  })().finally(() => {
    pending.delete(slug);
  });

  pending.set(slug, task);
  return task;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: raw } = await params;

  if (!raw || !/^[a-z0-9-]+$/i.test(raw) || raw.length > 50) {
    return noStore("Invalid link.", 400);
  }

  const slug = raw.toLowerCase();
  const cached = memory.get(slug);
  let record: LinkRecord | "missing";

  try {
    record = cached && cached.freshUntil > Date.now() ? cached : await lookup(slug);
  } catch (err) {
    console.error("[redirect] DB connection error:", err);
    return noStore("Service temporarily unavailable.", 503);
  }

  if (record === "missing") {
    return noStore("This short link does not exist.", 404);
  }

  if (record.expiresAtMs !== null && record.expiresAtMs <= Date.now()) {
    memory.delete(slug);
    return noStore("This short link has expired.", 410);
  }

  if (!record.url.startsWith("http://") && !record.url.startsWith("https://")) {
    return noStore("Invalid destination.", 400);
  }

  // Count the visit after the redirect is sent. Cached edge hits do not
  // reach this function, so click totals track origin lookups.
  after(() => {
    void ShortUrl.updateOne({ slug }, { $inc: { clicks: 1 } })
      .exec()
      .catch((err) => {
        console.error("[redirect] click increment failed:", err);
      });
  });

  const cache = redirectCacheHeaders(
    record.expiresAtMs === null ? null : new Date(record.expiresAtMs)
  );
  const response = NextResponse.redirect(record.url, 302);
  if (cache) {
    response.headers.set("Cache-Control", cache.cacheControl);
    response.headers.set("CDN-Cache-Control", cache.cdnCacheControl);
    response.headers.set("Vercel-CDN-Cache-Control", cache.cdnCacheControl);
  }
  return response;
}
