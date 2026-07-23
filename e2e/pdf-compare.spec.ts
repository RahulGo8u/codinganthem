import { test, expect } from "@playwright/test";
import path from "node:path";

const fixtures = path.join(__dirname, "fixtures");

test.describe("PDF Compare", () => {
  test("compares two PDFs and jumps to differing pages", async ({ page }) => {
    await page.goto("/tools/pdf-compare");
    await expect(page.getByRole("heading", { name: "PDF Compare", level: 1 })).toBeVisible();

    const pdfA = path.join(fixtures, "sample-a.pdf");
    const pdfB = path.join(fixtures, "sample-b.pdf");

    // Hidden file inputs inside dropzones
    const inputs = page.locator('input[type="file"]');
    await inputs.nth(0).setInputFiles(pdfA);
    await inputs.nth(1).setInputFiles(pdfB);

    await expect(page.getByText(/page/i).first()).toBeVisible({ timeout: 20_000 });

    await page.getByRole("button", { name: "Compare", exact: true }).click();

    await expect(
      page.getByText(/page.*(differ|identical)|No visual differences/i).first()
    ).toBeVisible({ timeout: 60_000 });

    const nextDiff = page.getByRole("button", { name: "Next differing page" });
    if (await nextDiff.isVisible()) {
      await nextDiff.click();
      const pageChip = page.getByRole("button", { name: /Page \d+, differs/ });
      await expect(pageChip.first()).toBeVisible();
    }
  });

  test("rejects a non-PDF upload", async ({ page }) => {
    await page.goto("/tools/pdf-compare");
    const fake = path.join(fixtures, "large-a.txt");
    // Rename via setInputFiles name override
    await page.locator('input[type="file"]').nth(0).setInputFiles({
      name: "not-a-pdf.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("this is not a pdf"),
    });
    await expect(page.getByText(/does not look like a valid PDF|Only PDF|valid PDF/i)).toBeVisible({
      timeout: 15_000,
    });
    void fake;
  });
});
