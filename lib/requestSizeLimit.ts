import type { NextRequest } from "next/server";

/**
 * Rejects requests with an oversized body before we ever call req.json(),
 * as a basic guard against large-payload DoS attempts. Relies on the
 * Content-Length header — not foolproof against a chunked request that lies
 * about its length, but catches the overwhelming majority of naive abuse.
 */
export function isBodyTooLarge(req: NextRequest, maxBytes: number): boolean {
  const contentLength = req.headers.get("content-length");
  if (!contentLength) return false; // let JSON parsing fail naturally if absent
  const size = Number.parseInt(contentLength, 10);
  return Number.isFinite(size) && size > maxBytes;
}
