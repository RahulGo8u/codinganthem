import { test, expect } from "@playwright/test";

test.describe("Critical smoke", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/codinganthem/i).first()).toBeVisible();
  });

  test("JSON Formatter formats large-ish JSON", async ({ page }) => {
    await page.goto("/tools/json-formatter");
    await expect(page.getByRole("heading", { name: "JSON Formatter", level: 1 })).toBeVisible();

    const big = JSON.stringify(
      { items: Array.from({ length: 80 }, (_, i) => ({ id: i, name: `n-${i}` })) }
    );
    const input = page.locator("textarea").first();
    await input.fill(big);
    await expect(page.getByText(/Valid|Beautify|Minify/i).first()).toBeVisible();
    // Formatted output should include newlines / indentation in beautify mode
    await expect(page.locator("pre, code, [class*='mono']").filter({ hasText: '"id"' }).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("Token Counter exact count for OpenAI model (bundled tokenizer)", async ({ page }) => {
    await page.goto("/tools/token-counter");
    await expect(page.getByRole("heading", { name: /Token Counter/, level: 1 })).toBeVisible();

    await page.getByRole("button", { name: "GPT-4o", exact: true }).click();
    const input = page.locator("textarea").first();
    await input.fill("Hello from CodingAnthem token counter smoke test.");

    await expect(page.getByText("Failed to load the tokenizer")).toHaveCount(0);
    await expect(page.getByText(/\d[\d,]*\s*tokens|Exact/i).first()).toBeVisible({
      timeout: 20_000,
    });
  });
});
