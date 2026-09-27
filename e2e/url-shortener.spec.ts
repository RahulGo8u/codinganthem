import { expect, test } from "@playwright/test";
import { normalizeShortLinkOrigin, redirectCacheHeaders } from "../lib/shortLink";

test.describe("URL shortener", () => {
  test("does not show the server data-flow warning", async ({ page }) => {
    await page.goto("/tools/url-shortener");
    await expect(page.getByPlaceholder("https://example.com/very/long/url")).toBeVisible();
    await expect(page.getByText(/Your input is sent to our server/i)).toHaveCount(0);
    await expect(page.getByRole("note").filter({ hasText: /click counts are stored/i })).toHaveCount(0);
  });

  test("rejects an invalid short code without a redirect", async ({ request }) => {
    const response = await request.get("/r/bad_slug", { maxRedirects: 0 });
    expect(response.status()).toBe(400);
    expect(response.headers()["cache-control"]).toContain("no-store");
  });
});

test.describe("short link helpers", () => {
  test("rewrites apex links onto www", () => {
    expect(normalizeShortLinkOrigin("https://codinganthem.com")).toBe("https://www.codinganthem.com");
    expect(normalizeShortLinkOrigin("https://www.codinganthem.com")).toBe("https://www.codinganthem.com");
    expect(normalizeShortLinkOrigin("http://localhost:3000")).toBe("http://localhost:3000");
    expect(normalizeShortLinkOrigin(undefined)).toBe("https://www.codinganthem.com");
  });

  test("caches permanent redirects briefly and expiring redirects only until expiry", () => {
    const now = Date.parse("2026-09-27T00:00:00.000Z");
    const permanent = redirectCacheHeaders(null, now);
    expect(permanent?.cdnCacheControl).toBe("public, s-maxage=300, stale-while-revalidate=86400");

    const soon = redirectCacheHeaders(new Date(now + 120_000), now);
    expect(soon?.cdnCacheControl).toBe("public, s-maxage=120");

    expect(redirectCacheHeaders(new Date(now - 1_000), now)).toBeNull();
  });
});
