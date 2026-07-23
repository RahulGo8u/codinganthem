import path from "node:path";
import { test, expect } from "@playwright/test";
import { assertToolHeading, gotoTool, uploadHiddenFile } from "./helpers/toolPage";

const png = path.join(__dirname, "fixtures", "sample.png");

test.describe("Image tools", () => {
  test("image-to-base64 encodes uploaded PNG", async ({ page }) => {
    await gotoTool(page, "image-to-base64");
    await assertToolHeading(page, "Image to Base64");
    await uploadHiddenFile(page, png);
    const dataUrlBox = page.locator("textarea[readonly]").first();
    await expect(dataUrlBox).toHaveValue(/^data:image\/png;base64,/, { timeout: 10_000 });
  });

  test("image-compressor accepts upload and shows result", async ({ page }) => {
    await gotoTool(page, "image-compressor");
    await assertToolHeading(page, "Image Compressor");
    await uploadHiddenFile(page, png);
    await expect(page.getByText(/Compressed ·|Kept original ·/).first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByRole("img", { name: "Compressed" })).toBeVisible();
  });

  test("image-resizer accepts upload and shows resized preview", async ({ page }) => {
    await gotoTool(page, "image-resizer");
    await assertToolHeading(page, "Image Resizer");
    await uploadHiddenFile(page, png);
    await expect(page.getByRole("img", { name: "Resized" })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("button", { name: /Download resized image/i })).toBeEnabled();
  });

  test("favicon-generator renders size previews from text mode", async ({ page }) => {
    await gotoTool(page, "favicon-generator");
    await assertToolHeading(page, "Favicon Generator");
    await expect(page.getByRole("img", { name: "16x16" })).toBeVisible();
    await expect(page.getByRole("img", { name: "32x32" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Download all sizes/i })).toBeVisible();
  });
});
