import { test, expect } from "@playwright/test";
import { ALL_SLUGS, INTERACTION_SLUGS } from "./helpers/catalog";

test.describe("E2E coverage guard", () => {
  test("every registered tool has an interaction suite entry", () => {
    const missing = ALL_SLUGS.filter((s) => !INTERACTION_SLUGS.has(s));
    expect(missing, `Missing interaction coverage for: ${missing.join(", ")}`).toEqual([]);
    expect(INTERACTION_SLUGS.size).toBe(ALL_SLUGS.length);
  });
});
