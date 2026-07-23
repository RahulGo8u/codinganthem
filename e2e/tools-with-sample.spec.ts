import { test, expect, type Page } from "@playwright/test";
import { LOAD_SAMPLE_SLUGS, toolName } from "./helpers/catalog";
import {
  assertToolHeading,
  expectHighlightedOutputMatches,
  expectReadonlyOutputMatches,
  expectReadonlyOutputNonEmpty,
  gotoTool,
} from "./helpers/toolPage";

type AssertFn = (page: Page) => Promise<void>;

async function ensureSample(page: Page) {
  const btn = page.getByRole("button", { name: /^Load sample$/i });
  if (await btn.count()) {
    await btn.click();
  }
}

const asserts: Record<(typeof LOAD_SAMPLE_SLUGS)[number], AssertFn> = {
  "json-formatter": async (page) => {
    await expect(page.getByText("Valid JSON")).toBeVisible();
    await expectHighlightedOutputMatches(page, /CodingAnthem/);
  },
  base64: async (page) => {
    await expectReadonlyOutputNonEmpty(page);
  },
  "hash-generator": async (page) => {
    await expect(page.locator(".mono").filter({ hasText: /^[0-9a-f]{64}$/ }).first()).toBeVisible({
      timeout: 10_000,
    });
  },
  "timestamp-converter": async (page) => {
    await ensureSample(page);
    await expect(page.getByText(/UTC|ISO|Unix/i).first()).toBeVisible();
  },
  "color-converter": async (page) => {
    await ensureSample(page);
    await expect(page.getByText(/HEX|RGB|HSL/i).first()).toBeVisible();
    await expect(page.locator(".mono").filter({ hasText: /#|rgb/i }).first()).toBeVisible();
  },
  "case-converter": async (page) => {
    await ensureSample(page);
    await expectReadonlyOutputNonEmpty(page);
  },
  "url-encoder": async (page) => {
    await ensureSample(page);
    await expectReadonlyOutputNonEmpty(page);
  },
  "jwt-decoder": async (page) => {
    await expect(page.getByText(/Header|Payload|alg/i).first()).toBeVisible();
  },
  "base-converter": async (page) => {
    await ensureSample(page);
    await expect(page.getByText(/Binary|Octal|Decimal|Hex/i).first()).toBeVisible();
  },
  "csv-to-json": async (page) => {
    await ensureSample(page);
    await expectHighlightedOutputMatches(page, /\{/);
  },
  "html-entities": async (page) => {
    await ensureSample(page);
    await expectReadonlyOutputNonEmpty(page);
  },
  "yaml-to-json": async (page) => {
    await ensureSample(page);
    await expectHighlightedOutputMatches(page, /\{/);
  },
  "markdown-preview": async (page) => {
    await expect(page.locator("h1, h2, strong, code").first()).toBeVisible();
  },
  "word-counter": async (page) => {
    await ensureSample(page);
    const wordsLabel = page.locator(".result-card span", { hasText: /^Words$/ });
    await expect(wordsLabel).toBeVisible();
    const wordsValue = wordsLabel.locator("xpath=following-sibling::span[contains(@class,'mono')]");
    await expect(wordsValue).toBeVisible();
    await expect
      .poll(async () => Number((await wordsValue.innerText()).replace(/,/g, "")))
      .toBeGreaterThan(10);
  },
  "json-to-yaml": async (page) => {
    await ensureSample(page);
    await expectHighlightedOutputMatches(page, /\w+:/);
  },
  "json-to-csv": async (page) => {
    await ensureSample(page);
    // json-to-csv may use textarea or highlighted — accept either
    const readonly = page.locator("textarea[readonly]");
    if (await readonly.count()) {
      await expectReadonlyOutputMatches(page, /,/);
    } else {
      await expectHighlightedOutputMatches(page, /,/);
    }
  },
  "url-parser": async (page) => {
    await ensureSample(page);
    await expect(page.getByText(/protocol|hostname|pathname|query/i).first()).toBeVisible();
  },
  "slug-generator": async (page) => {
    await ensureSample(page);
    await expectReadonlyOutputMatches(page, /^[a-z0-9]+(?:-[a-z0-9]+)*$/m);
  },
  "cron-parser": async (page) => {
    await ensureSample(page);
    await expect(page.getByText(/Next|minute|hour|day/i).first()).toBeVisible();
  },
  "string-escape": async (page) => {
    await ensureSample(page);
    await expectReadonlyOutputNonEmpty(page);
  },
  "json-statistics": async (page) => {
    await ensureSample(page);
    await expect(page.getByText(/Keys|Objects|Arrays|Depth|Size/i).first()).toBeVisible();
  },
  "qr-code-generator": async (page) => {
    await ensureSample(page);
    await expect(page.getByRole("img", { name: "Generated QR code" })).toBeVisible();
  },
  "sql-formatter": async (page) => {
    await ensureSample(page);
    await expectHighlightedOutputMatches(page, /SELECT/i);
  },
  "jwt-validator": async (page) => {
    await ensureSample(page);
    await expect(page.getByText(/Valid|Invalid|Signature|Expired/i).first()).toBeVisible();
  },
  "js-formatter": async (page) => {
    await ensureSample(page);
    await expectHighlightedOutputMatches(page, /function|const|let|var|=>/i);
  },
  "html-formatter": async (page) => {
    await ensureSample(page);
    await expectHighlightedOutputMatches(page, /</);
  },
  "css-formatter": async (page) => {
    await ensureSample(page);
    await expectHighlightedOutputMatches(page, /\{/);
  },
  "sql-in-generator": async (page) => {
    await ensureSample(page);
    await expectHighlightedOutputMatches(page, /IN\s*\(/i);
  },
  "json-to-typescript": async (page) => {
    await ensureSample(page);
    await expectHighlightedOutputMatches(page, /interface|type\s+\w+/i);
  },
  "curl-to-fetch": async (page) => {
    await ensureSample(page);
    await expectHighlightedOutputMatches(page, /fetch\s*\(/);
  },
  "mermaid-viewer": async (page) => {
    await expect(page.locator("svg").first()).toBeVisible({ timeout: 20_000 });
  },
  "user-agent-parser": async (page) => {
    await ensureSample(page);
    await expect(page.getByText(/Browser|OS|Engine|Device/i).first()).toBeVisible();
  },
  "xml-formatter": async (page) => {
    await ensureSample(page);
    await expectHighlightedOutputMatches(page, /</);
  },
  "prompt-template-filler": async (page) => {
    await ensureSample(page);
    await expectReadonlyOutputNonEmpty(page);
  },
  "token-counter": async (page) => {
    await ensureSample(page);
    await page.getByRole("button", { name: "GPT-4o", exact: true }).click();
    await expect(page.getByText("Failed to load the tokenizer")).toHaveCount(0);
    await expect(page.getByText(/\d[\d,]*\s*tokens|Exact/i).first()).toBeVisible({
      timeout: 20_000,
    });
  },
  "xml-to-json": async (page) => {
    await ensureSample(page);
    await expectHighlightedOutputMatches(page, /\{/);
  },
};

test.describe("Tools with Load sample / prefilled sample", () => {
  for (const slug of LOAD_SAMPLE_SLUGS) {
    test(`${slug} produces valid sample output`, async ({ page }) => {
      await gotoTool(page, slug);
      await assertToolHeading(page, toolName(slug));
      await asserts[slug](page);
      await expect(page.getByText(/Unhandled Runtime Error|Application error/i)).toHaveCount(0);
    });
  }
});
