import { test, expect } from "@playwright/test";

test.describe("Shared tool UX", () => {
  test("dual-pane tools expose mobile Input and Output tabs", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/tools/json-formatter");

    const inputTab = page.getByRole("tab", { name: "Input", exact: true });
    const outputTab = page.getByRole("tab", { name: "Output", exact: true });
    await expect(inputTab).toHaveAttribute("aria-selected", "true");
    await outputTab.click();
    await expect(outputTab).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#main-content pre").first()).toBeVisible();
  });

  test("breadcrumbs include the tool category", async ({ page }) => {
    await page.goto("/tools/json-formatter");
    await expect(page.locator("#main-content").getByRole("link", { name: "Formatters", exact: true })).toHaveAttribute(
      "href",
      "/category/formatters"
    );
  });

  test("server-backed AI tools disclose data flow before input", async ({ page }) => {
    await page.goto("/tools/ai-code-explainer");
    const notice = page.getByRole("note").filter({ hasText: /sent to|Gemini/i }).first();
    await expect(notice).toBeVisible();
    await expect(notice).toContainText(/Do not paste secrets|confidential/i);
  });

  test("Markdown preview sanitizes executable HTML", async ({ page }) => {
    await page.goto("/tools/markdown-preview");
    const input = page.locator("textarea").first();
    await input.fill(
      '<script>window.__unsafe = true</script><a href="javascript:alert(1)">Unsafe</a>'
    );

    await expect(page.locator("script", { hasText: "window.__unsafe" })).toHaveCount(0);
    const sanitizedLink = page.locator("a").filter({ hasText: /^Unsafe$/ });
    await expect(sanitizedLink).toBeVisible();
    await expect(sanitizedLink).not.toHaveAttribute("href", /javascript:/i);
    await expect(page.getByText(/sanitized/i).first()).toBeVisible();
  });

  test("security tools mask secrets by default", async ({ page }) => {
    await page.goto("/tools/jwt-generator");
    await expect(page.getByRole("textbox", { name: "Secret key", exact: true })).toHaveAttribute("type", "password");

    await page.goto("/tools/bcrypt-generator");
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });
});
