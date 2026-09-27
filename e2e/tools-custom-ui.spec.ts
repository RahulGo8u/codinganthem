import { test, expect } from "@playwright/test";
import { assertToolHeading, gotoTool } from "./helpers/toolPage";

test.describe("Custom UI tools", () => {
  test("chmod-calculator defaults to 644 and updates on preset", async ({ page }) => {
    await gotoTool(page, "chmod-calculator");
    await assertToolHeading(page, "chmod Calculator");
    await expect(page.locator("code").filter({ hasText: "chmod 644" })).toBeVisible();
    await page.getByRole("button", { name: "755", exact: true }).click();
    await expect(page.locator("code").filter({ hasText: "chmod 755" })).toBeVisible();
    await expect(page.locator("code").filter({ hasText: "rwxr-xr-x" })).toBeVisible();
  });

  test("css-gradient-generator renders CSS on load", async ({ page }) => {
    await gotoTool(page, "css-gradient-generator");
    await assertToolHeading(page, "CSS Gradient Generator");
    await expect(page.locator("code").filter({ hasText: /linear-gradient|radial-gradient/ }).first()).toBeVisible();
  });

  test("meta-tag-generator shows OG tags from defaults", async ({ page }) => {
    await gotoTool(page, "meta-tag-generator");
    await assertToolHeading(page, "Meta Tag Generator");
    const pre = page.locator("pre").filter({ hasText: "og:title" }).first();
    await expect(pre).toBeVisible();
    await expect(pre).toContainText("twitter:card");
  });

  test("color-contrast-checker shows ratio for defaults", async ({ page }) => {
    await gotoTool(page, "color-contrast-checker");
    await assertToolHeading(page, "Color Contrast Checker");
    await expect(
      page.locator(".result-card").filter({ hasText: "Contrast Ratio" }).first()
    ).toBeVisible();
    await expect(
      page.locator(".result-card").filter({ hasText: "Contrast Ratio" }).locator(".mono")
    ).toHaveText(/\d+(\.\d+)?:1/);
    await expect(page.getByText("PASS").first()).toBeVisible();
  });

  test("eth-unit-converter quick-fill 1 ETH converts units", async ({ page }) => {
    await gotoTool(page, "eth-unit-converter");
    await assertToolHeading(page, "ETH Unit Converter");
    await page.getByRole("button", { name: "1 ETH", exact: true }).click();

    const weiInput = page.getByRole("textbox", { name: "Wei amount", exact: true });
    const etherInput = page.getByRole("textbox", { name: "Ether amount", exact: true });
    await expect(etherInput).toHaveValue("1");
    await expect(weiInput).toHaveValue("1000000000000000000");
  });

  test("eth-unit-converter accepts grouped Wei and estimates gas exactly", async ({ page }) => {
    await gotoTool(page, "eth-unit-converter");

    const weiInput = page.getByRole("textbox", { name: "Wei amount", exact: true });
    await weiInput.fill("1,000,000,000");
    await expect(page.getByRole("textbox", { name: "Gwei amount", exact: true })).toHaveValue("1");

    await page.getByLabel("Gas limit").fill("21000");
    await page.getByLabel("Max gas price in Gwei").fill("20");
    await expect(page.getByText("0.00042 ETH", { exact: true })).toBeVisible();
    await expect(page.getByText("420,000,000,000,000", { exact: true })).toBeVisible();
  });
});
