import { test, expect } from "@playwright/test";
import { assertToolHeading, gotoTool } from "./helpers/toolPage";

test.describe("Generator tools", () => {
  test("uuid-generator creates v4 UUIDs", async ({ page }) => {
    await gotoTool(page, "uuid-generator");
    await assertToolHeading(page, "UUID Generator");
    await page.getByRole("button", { name: "Generate", exact: true }).click();
    const out = page.locator("textarea[readonly]");
    await expect(out).toHaveValue(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  test("password-generator creates a strong password", async ({ page }) => {
    await gotoTool(page, "password-generator");
    await assertToolHeading(page, "Password Generator");
    await page.getByRole("button", { name: "Generate", exact: true }).click();
    await expect(page.getByText(/Strong|Good/)).toBeVisible();
    const pre = page.locator("pre.mono").first();
    await expect(pre).toBeVisible();
    const text = (await pre.innerText()).trim();
    expect(text.length).toBeGreaterThanOrEqual(16);
  });

  test("lorem-ipsum generates paragraphs", async ({ page }) => {
    await gotoTool(page, "lorem-ipsum");
    await assertToolHeading(page, "Lorem Ipsum Generator");
    await page.getByRole("button", { name: "Generate", exact: true }).click();
    await expect(page.locator("textarea[readonly]")).toHaveValue(/lorem/i);
  });

  test("mock-data-generator Load sample yields JSON rows", async ({ page }) => {
    await gotoTool(page, "mock-data-generator");
    await assertToolHeading(page, "Mock Data Generator");
    await page.getByRole("button", { name: /^Load sample$/i }).click();
    await expect(page.locator("pre").filter({ hasText: /fullName|email/i }).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test("bcrypt-generator hashes and verifies", async ({ page }) => {
    await gotoTool(page, "bcrypt-generator");
    await assertToolHeading(page, "Bcrypt Generator");
    await page.getByPlaceholder("Enter text to hash").fill("codinganthem-secret");
    await page.getByRole("button", { name: "Generate bcrypt hash" }).click();
    const hash = page.locator("code.mono").first();
    await expect(hash).toBeVisible({ timeout: 30_000 });
    await expect(hash).toHaveText(/^\$2[aby]?\$/);
  });

  test("jwt-generator produces a 3-part token on load", async ({ page }) => {
    await gotoTool(page, "jwt-generator");
    await assertToolHeading(page, "JWT Generator");
    const out = page.locator("textarea[readonly]");
    await expect
      .poll(async () => (await out.inputValue()).trim())
      .toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  });

  test("totp-generator shows a 6-digit code", async ({ page }) => {
    await gotoTool(page, "totp-generator");
    await assertToolHeading(page, "TOTP / OTP Generator");
    await expect(page.getByRole("button", { name: /^\d{6}$/ })).toBeVisible({ timeout: 10_000 });
  });
});
