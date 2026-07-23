import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const fixtures = path.join(__dirname, "fixtures");

test.describe("JSON Compare", () => {
  test("loads large fixtures and navigates change hunks", async ({ page }) => {
    const left = fs.readFileSync(path.join(fixtures, "large-a.json"), "utf8");
    const right = fs.readFileSync(path.join(fixtures, "large-b.json"), "utf8");

    await page.goto("/tools/json-diff");
    await expect(page.getByRole("heading", { name: "JSON Compare", level: 1 })).toBeVisible();

    const areas = page.locator("textarea");
    await areas.nth(0).fill(left);
    await areas.nth(1).fill(right);

    await expect(page.getByText(/added/i).first()).toBeVisible();
    await expect(page.getByText(/removed/i).first()).toBeVisible();

    const nav = page.getByRole("group", { name: "Navigate differences" });
    await expect(nav).toBeVisible();
    await expect(nav.getByText(/1 of \d+/)).toBeVisible();

    const next = page.getByRole("button", { name: "Next difference" });
    await next.click();
    await expect(nav.getByText(/2 of \d+/)).toBeVisible();

    const prev = page.getByRole("button", { name: "Previous difference" });
    await prev.click();
    await expect(nav.getByText(/1 of \d+/)).toBeVisible();
  });

  test("shows parse error for invalid JSON", async ({ page }) => {
    await page.goto("/tools/json-diff");
    await page.locator("textarea").nth(0).fill("{ not json");
    await page.locator("textarea").nth(1).fill('{"ok":true}');
    await expect(page.getByText(/JSON|Unexpected|Expected|position/i).first()).toBeVisible();
  });
});
