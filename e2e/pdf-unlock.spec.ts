import { test, expect } from "@playwright/test";
import path from "node:path";

const fixtures = path.join(__dirname, "fixtures");

test.describe("PDF Unlock", () => {
  test("unlocks a password-protected PDF and enables download", async ({ page }) => {
    await page.goto("/tools/pdf-unlock");
    await expect(page.getByRole("heading", { name: "PDF Unlock", level: 1 })).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles(path.join(fixtures, "sample-locked.pdf"));

    await expect(page.getByText(/password required/i)).toBeVisible({ timeout: 30_000 });

    await page.getByPlaceholder(/enter the pdf password/i).fill("secret123");
    await page.getByRole("button", { name: "Unlock PDF" }).click();

    await expect(page.getByText(/unlocked pdf ready/i)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("button", { name: /Download unlocked PDF/i })).toBeEnabled();
  });

  test("rejects an incorrect password", async ({ page }) => {
    await page.goto("/tools/pdf-unlock");
    await page.locator('input[type="file"]').setInputFiles(path.join(fixtures, "sample-locked.pdf"));
    await expect(page.getByText(/password required/i)).toBeVisible({ timeout: 30_000 });

    await page.getByPlaceholder(/enter the pdf password/i).fill("wrong-password");
    await page.getByRole("button", { name: "Unlock PDF" }).click();

    await expect(page.getByText(/wrong|incorrect password/i)).toBeVisible();
  });

  test("reports when a PDF is not password-protected", async ({ page }) => {
    await page.goto("/tools/pdf-unlock");
    await page.locator('input[type="file"]').setInputFiles(path.join(fixtures, "sample-a.pdf"));

    await expect(page.getByText(/not password-protected/i)).toBeVisible({ timeout: 30_000 });
  });

  test("rejects a non-PDF upload", async ({ page }) => {
    await page.goto("/tools/pdf-unlock");
    await page.locator('input[type="file"]').setInputFiles({
      name: "not-a-pdf.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("this is not a pdf"),
    });
    await expect(page.getByText(/does not look like a valid PDF|Only PDF|valid PDF/i)).toBeVisible({
      timeout: 15_000,
    });
  });
});
