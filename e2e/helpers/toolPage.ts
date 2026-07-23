import { expect, type Locator, type Page } from "@playwright/test";

export async function gotoTool(page: Page, slug: string) {
  await page.goto(`/tools/${slug}`);
}

export async function assertToolHeading(page: Page, name: string) {
  await expect(page.getByRole("heading", { name, level: 1 })).toBeVisible();
}

export async function clickLoadSample(page: Page) {
  const btn = page.getByRole("button", { name: /^Load sample$/i });
  await expect(btn).toBeVisible();
  await btn.click();
}

/** ToolShell output textarea (readonly). */
export function toolShellOutput(page: Page): Locator {
  return page.locator("textarea[readonly]");
}

export async function expectReadonlyOutputMatches(page: Page, pattern: RegExp) {
  const out = toolShellOutput(page).last();
  await expect(out).toBeVisible();
  await expect(out).toHaveValue(pattern);
}

export async function expectReadonlyOutputNonEmpty(page: Page) {
  const out = toolShellOutput(page).last();
  await expect(out).toBeVisible();
  await expect
    .poll(async () => (await out.inputValue()).trim().length)
    .toBeGreaterThan(0);
}

/** HighlightedOutput / custom pre panes. */
export async function expectHighlightedOutputMatches(page: Page, pattern: RegExp) {
  const pre = page.locator("pre").filter({ hasText: pattern }).first();
  await expect(pre).toBeVisible({ timeout: 15_000 });
}

export async function uploadHiddenFile(page: Page, filePath: string) {
  const input = page.locator('input[type="file"]').first();
  await input.setInputFiles(filePath);
}
