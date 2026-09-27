import { test, expect } from "@playwright/test";

test.describe("Critical smoke", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/codinganthem/i).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Frequently asked questions" })).toBeVisible();
    await expect(page.getByText("Which tools send my input to a server?")).toBeVisible();
    await expect(page.getByText("Does CodingAnthem include Ethereum tools?")).toBeVisible();
    await expect(page.getByText(/alongside AI tools/)).toHaveCount(0);
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

  test("Token Counter plans current-model context and API cost locally", async ({ page }) => {
    await page.goto("/tools/token-counter");
    await expect(page.getByRole("heading", { name: /Token Counter/, level: 1 })).toBeVisible();

    await page.getByRole("button", { name: /GPT-5.6 Terra/ }).click();
    const input = page.locator("textarea").first();
    await input.fill("Hello from CodingAnthem token counter smoke test.");

    await expect(page.getByText("Failed to load the local tokenizer")).toHaveCount(0);
    await expect(page.getByText("Exact plain text")).toBeVisible({
      timeout: 20_000,
    });
    await page.getByRole("spinbutton", { name: "Expected output tokens" }).fill("2000");
    const monthlyCost = page.getByTestId("monthly-cost");
    const standardMonthlyCost = await monthlyCost.innerText();
    await page.getByLabel("Cached input percentage").fill("50");
    await page.getByLabel("Requests per day").fill("250");
    await page.getByLabel(/Batch API/).check();

    await expect(monthlyCost).not.toHaveText(standardMonthlyCost);
    await expect(page.getByText("30-day total").first()).toBeVisible();
    await expect(page.getByText("Model comparison", { exact: true })).toBeVisible();
    await expect(page.getByText(/tokens remain in the context window/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /Official OpenAI source/i })).toBeVisible();

    await page.getByRole("button", { name: "Google", exact: true }).click();
    await page.getByRole("button", { name: /Gemini 3.8 Flash/ }).click();
    await expect(page.getByText("Estimated")).toBeVisible();
    await expect(page.getByText(/character-based estimate/i)).toBeVisible();
  });
});
