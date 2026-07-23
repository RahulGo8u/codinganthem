import { test, expect } from "@playwright/test";
import { assertToolHeading, gotoTool } from "./helpers/toolPage";

test.describe("Backend tools (mocked APIs)", () => {
  test("url-shortener shows short URL from mock", async ({ page }) => {
    await page.route("**/api/shorten", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          shortUrl: "https://codinganthem.com/r/abc123",
          slug: "abc123",
          expiresAt: null,
        }),
      });
    });

    await gotoTool(page, "url-shortener");
    await assertToolHeading(page, "URL Shortener");
    await page.getByPlaceholder(/https?:\/\//i).fill("https://example.com/path");
    await page.getByRole("button", { name: /Shorten URL/i }).click();
    await expect(page.getByText("https://codinganthem.com/r/abc123")).toBeVisible();
    await expect(page.getByRole("button", { name: /Shorten another URL/i })).toBeVisible();
  });

  test("ai-code-explainer renders mocked explanation", async ({ page }) => {
    await page.route("**/api/ai/code-explainer", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          summary: "Adds two numbers.",
          breakdown: "Returns a + b.",
        }),
      });
    });

    await gotoTool(page, "ai-code-explainer");
    await assertToolHeading(page, "AI Code Explainer");
    await page.locator("textarea").first().fill("function add(a,b){return a+b}");
    await page.getByRole("button", { name: /Explain Code/i }).click();
    await expect(page.getByText("Adds two numbers.")).toBeVisible();
    await expect(page.getByText("Returns a + b.")).toBeVisible();
  });

  test("ai-sql-generator renders mocked SQL", async ({ page }) => {
    await page.route("**/api/ai/sql-generator", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          sql: "SELECT id, email FROM users WHERE active = true;",
          explanation: "Fetches active users.",
        }),
      });
    });

    await gotoTool(page, "ai-sql-generator");
    await assertToolHeading(page, "AI Text-to-SQL Generator");
    await page.locator("textarea").first().fill("List all active users with id and email");
    await page.getByRole("button", { name: /Generate SQL/i }).click();
    await expect(page.locator("pre").filter({ hasText: /SELECT id, email FROM users/i })).toBeVisible();
    await expect(page.getByText("Fetches active users.")).toBeVisible();
  });

  test("ai-error-explainer renders mocked diagnosis", async ({ page }) => {
    await page.route("**/api/ai/error-explainer", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          diagnosis: "Null reference when reading user.",
          likelyCause: "user is undefined before property access.",
          suggestedFix: "Guard with optional chaining or an early return.",
        }),
      });
    });

    await gotoTool(page, "ai-error-explainer");
    await assertToolHeading(page, "AI Error Message Explainer");
    await page
      .locator("textarea")
      .first()
      .fill("TypeError: Cannot read properties of undefined (reading 'name')");
    await page.getByRole("button", { name: /Explain Error/i }).click();
    await expect(page.getByText("Null reference when reading user.")).toBeVisible();
    await expect(page.getByText("user is undefined before property access.")).toBeVisible();
    await expect(page.getByText("Guard with optional chaining or an early return.")).toBeVisible();
  });
});
