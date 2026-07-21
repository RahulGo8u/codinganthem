import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ShortUrl from "@/lib/models/ShortUrl";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Basic slug sanitisation
  if (!slug || !/^[a-z0-9-]+$/i.test(slug) || slug.length > 50) {
    return NextResponse.json({ error: "Invalid link." }, { status: 400 });
  }

  try {
    await connectDB();
  } catch (err) {
    console.error("[redirect] DB connection error:", err);
    return NextResponse.json(
      { error: "Service temporarily unavailable." },
      { status: 503 }
    );
  }

  const record = await ShortUrl.findOne({ slug: slug.toLowerCase() }).lean();

  if (!record) {
    return NextResponse.json(
      { error: "This short link does not exist." },
      { status: 404 }
    );
  }

  // Check expiry
  if (record.expiresAt && new Date(record.expiresAt) < new Date()) {
    return NextResponse.json(
      { error: "This short link has expired." },
      { status: 410 }
    );
  }

  // Validate the stored URL is still safe before redirecting (defense in depth)
  const url = record.originalUrl;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return NextResponse.json({ error: "Invalid destination." }, { status: 400 });
  }

  // Increment click count asynchronously — don't block the redirect
  ShortUrl.updateOne({ slug: slug.toLowerCase() }, { $inc: { clicks: 1 } }).exec();

  return NextResponse.redirect(url, { status: 308 });
}
