import { test, expect } from "@playwright/test";
import { tools } from "../lib/tools";
import { assertToolHeading, gotoTool } from "./helpers/toolPage";

test.describe("All tools load smoke", () => {
  for (const tool of tools) {
    test(`${tool.slug} mounts with correct H1`, async ({ page }) => {
      await gotoTool(page, tool.slug);
      await assertToolHeading(page, tool.name);
      // No Next.js error overlay / blank body
      await expect(page.locator("body")).not.toContainText("Application error");
      await expect(page.locator("body")).not.toContainText("Unhandled Runtime Error");
    });
  }
});
