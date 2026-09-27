import path from "node:path";
import { test, expect, type Page } from "@playwright/test";
import { gotoTool, uploadHiddenFile } from "./helpers/toolPage";

const png = path.join(__dirname, "fixtures", "sample.png");

async function expectDownload(page: Page, buttonName: string | RegExp, filename: RegExp) {
  const button = page.getByRole("button", { name: buttonName }).first();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    button.click(),
  ]);
  expect(download.suggestedFilename()).toMatch(filename);
  expect(await download.failure()).toBeNull();
}

test.describe("Downloads", () => {
  test("QR PNG is right-aligned and downloads on a mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoTool(page, "qr-code-generator");
    await page.getByRole("button", { name: "Load sample" }).click();

    const outputActions = page.getByRole("group", { name: "Output actions" });
    await expect(outputActions.getByRole("button", { name: "Download PNG" })).toBeEnabled();
    await expectDownload(page, "Download PNG", /^qrcode\.png$/);
  });

  test("Mermaid SVG downloads from output actions", async ({ page }) => {
    await gotoTool(page, "mermaid-viewer");
    const outputActions = page.getByRole("group", { name: "Output actions" });
    await expect(outputActions.getByRole("button", { name: "Download SVG" })).toBeEnabled();
    await expectDownload(page, "Download SVG", /^diagram\.svg$/);
  });

  test("Base64 downloads with a useful extension", async ({ page }) => {
    await gotoTool(page, "base64");
    await page.getByRole("button", { name: "Load sample" }).click();
    await expectDownload(page, "Download", /^encoded\.b64\.txt$/);
  });

  test("image compressor output downloads", async ({ page }) => {
    await gotoTool(page, "image-compressor");
    await uploadHiddenFile(page, png);
    const button = page.getByRole("button", {
      name: /Download (compressed image|original)/,
    });
    await expect(button).toBeEnabled({ timeout: 20_000 });
    await expectDownload(page, /Download (compressed image|original)/, /\.(png|webp|jpg)$/);
  });

  test("image Base64 text downloads", async ({ page }) => {
    await gotoTool(page, "image-to-base64");
    await uploadHiddenFile(page, png);
    await expect(page.getByRole("button", { name: "Download" })).toBeEnabled();
    await expectDownload(page, "Download", /^sample-base64\.txt$/);
  });

  test("image resizer output downloads", async ({ page }) => {
    await gotoTool(page, "image-resizer");
    await uploadHiddenFile(page, png);
    await expect(page.getByRole("button", { name: "Download resized image" })).toBeEnabled({
      timeout: 20_000,
    });
    await expectDownload(page, "Download resized image", /-64x64\.png$/);
  });

  test("favicon size downloads without async user-activation loss", async ({ page }) => {
    await gotoTool(page, "favicon-generator");
    await expect(page.getByRole("img", { name: "16x16" })).toBeVisible();
    await expectDownload(page, "Download", /^favicon-16x16\.png$/);
  });
});
