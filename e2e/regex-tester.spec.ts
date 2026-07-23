import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const fixtures = path.join(__dirname, "fixtures");

test.describe("Regex Tester", () => {
  test("navigates matches in a long haystack", async ({ page }) => {
    const haystack = fs.readFileSync(path.join(fixtures, "regex-haystack.txt"), "utf8");

    await page.goto("/tools/regex-tester");
    await expect(page.getByRole("heading", { name: "Regex Tester", level: 1 })).toBeVisible();

    const pattern = page.locator('input[type="text"]').first();
    await pattern.fill("\\b\\w+@\\w+\\.\\w+\\b");

    await page.locator("textarea").fill(haystack);

    const nav = page.getByRole("group", { name: "Navigate matches" });
    await expect(nav).toBeVisible();
    await expect(nav.getByText(/1 of \d+/)).toBeVisible();

    await page.getByRole("button", { name: "Next match" }).click();
    await expect(nav.getByText(/2 of \d+/)).toBeVisible();

    await page.getByRole("button", { name: "Previous match" }).click();
    await expect(nav.getByText(/1 of \d+/)).toBeVisible();
  });
});
