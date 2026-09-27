import { createHmac } from "node:crypto";
import { expect, test } from "@playwright/test";
import { parseCidr } from "../lib/cidr";
import { parseCron } from "../lib/cron";
import { filterHttpStatuses } from "../lib/httpStatus";
import { assertToolHeading, gotoTool } from "./helpers/toolPage";

test.describe("traffic tools", () => {
  test("cron builder reuses the parser", () => {
    const parsed = parseCron("*/15 9-17 * * 1-5");
    expect(parsed.summary).toContain("every 15 minutes");
    expect(parsed.summary).toContain("Mon through Fri");
    expect(parsed.runs).toHaveLength(5);
  });

  test("shows a live cron expression and the next runs", async ({ page }) => {
    await gotoTool(page, "cron-builder");
    await assertToolHeading(page, "Cron Expression Builder");
    await expect(page.getByText("*/15 9-17 * * 1-5")).toBeVisible();
    await expect(page.getByText(/every 15 minutes/)).toBeVisible();
    await expect(page.getByText("Next 5 runs")).toBeVisible();
  });

  test("cidr math covers hosts, point-to-point, and single addresses", () => {
    const block = parseCidr("192.168.1.0/24");
    expect(block.network).toBe("192.168.1.0");
    expect(block.broadcast).toBe("192.168.1.255");
    expect(block.firstHost).toBe("192.168.1.1");
    expect(block.lastHost).toBe("192.168.1.254");
    expect(block.netmask).toBe("255.255.255.0");
    expect(block.usableHosts).toBe(254);

    expect(parseCidr("10.1.1.0/31").usableHosts).toBe(2);
    expect(parseCidr("172.16.5.10/32")).toMatchObject({
      firstHost: "172.16.5.10",
      lastHost: "172.16.5.10",
      usableHosts: 1,
    });
  });

  test("calculates a subnet in the browser", async ({ page }) => {
    await gotoTool(page, "cidr-calculator");
    await assertToolHeading(page, "CIDR Calculator");
    await expect(page.getByLabel("IPv4 CIDR")).toHaveValue("192.168.1.0/24");
    await expect(page.getByText("192.168.1.1")).toBeVisible();
    await expect(page.getByText("192.168.1.254")).toBeVisible();
    await expect(page.getByText("255.255.255.0")).toBeVisible();
    await expect(page.getByText("254", { exact: true })).toBeVisible();
  });

  test("filters HTTP status codes", () => {
    expect(filterHttpStatuses("404", "all").map((status) => status.name)).toEqual(["Not Found"]);
    expect(filterHttpStatuses("", "5xx").every((status) => status.className === "5xx")).toBe(true);
    expect(filterHttpStatuses("404", "5xx")).toHaveLength(0);
  });

  test("searches and filters status codes in the browser", async ({ page }) => {
    await gotoTool(page, "http-status-codes");
    await assertToolHeading(page, "HTTP Status Codes");
    await page.getByLabel("Search HTTP status codes").fill("404");
    await expect(page.getByRole("heading", { name: /Not Found/ })).toBeVisible();
    await page.getByRole("button", { name: "5xx" }).click();
    await expect(page.getByRole("heading", { name: /Not Found/ })).toHaveCount(0);
    await expect(page.getByText("No status codes match that search.")).toBeVisible();
    await page.getByLabel("Search HTTP status codes").fill("");
    await expect(page.getByRole("heading", { name: /Internal Server Error/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /^200/ })).toHaveCount(0);
  });

  test("signs HMAC-SHA256 locally", async ({ page }) => {
    const message = '{"id":123}';
    const secret = "topsecret";
    const expected = createHmac("sha256", secret).update(message).digest("hex");

    await gotoTool(page, "hmac-generator");
    await assertToolHeading(page, "HMAC Generator");
    await expect(page.getByLabel("HMAC secret")).toHaveAttribute("type", "password");
    await page.getByRole("textbox", { name: /^message$/i }).fill(message);
    await page.getByLabel("HMAC secret").fill(secret);
    await expect(page.getByText(expected)).toBeVisible();
  });
});
