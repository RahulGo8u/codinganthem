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

    const weiInput = page.locator("label", { hasText: /^Wei$/ }).locator("..").locator("input");
    const etherInput = page.locator("label", { hasText: /^Ether$/ }).locator("..").locator("input");
    await expect(etherInput).toHaveValue("1");
    await expect(weiInput).toHaveValue("1000000000000000000");
  });
});
