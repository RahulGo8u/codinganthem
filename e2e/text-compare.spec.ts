import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const fixtures = path.join(__dirname, "fixtures");

test.describe("Text Compare", () => {
  test("loads large text and navigates hunks", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    const left = fs.readFileSync(path.join(fixtures, "large-a.txt"), "utf8");
    const right = fs.readFileSync(path.join(fixtures, "large-b.txt"), "utf8");

    await page.goto("/tools/text-diff");
    await expect(page.getByRole("heading", { name: "Text Compare", level: 1 })).toBeVisible();

    const areas = page.locator("textarea");
    await areas.nth(0).fill(left);
    await areas.nth(1).fill(right);

    const nav = page.getByRole("group", { name: "Navigate differences" });
    await expect(nav).toBeVisible();
    await expect(nav.getByText(/1 of \d+/)).toBeVisible();

    await page.getByRole("button", { name: "Next difference" }).click();
    await expect(nav.getByText(/2 of \d+/)).toBeVisible();

    await page.getByRole("button", { name: "Copy diff" }).click();
    await expect(page.getByRole("button", { name: /Copied/ })).toBeVisible();
  });
});
