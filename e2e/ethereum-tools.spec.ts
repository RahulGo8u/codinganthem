import { expect, test } from "@playwright/test";
import {
  calculateKeccak,
  inspectEthereumAddress,
  toChecksumAddress,
} from "../lib/ethereum";
import { assertToolHeading, gotoTool } from "./helpers/toolPage";

test.describe("Ethereum developer tools", () => {
  test("implements official EIP-55 checksum vectors", () => {
    expect(toChecksumAddress("0x52908400098527886e0f7030069857d2e4169ee7")).toBe(
      "0x52908400098527886E0F7030069857D2E4169EE7"
    );
    expect(toChecksumAddress("0xde709f2102306220921060314715629080e2fb77")).toBe(
      "0xde709f2102306220921060314715629080e2fb77"
    );
    expect(
      inspectEthereumAddress("0x52908400098527886E0F7030069857D2E4169EE7").status
    ).toBe("checksummed");
    expect(
      inspectEthereumAddress("0x52908400098527886E0f7030069857D2E4169EE7").status
    ).toBe("invalid-checksum");
  });

  test("validates and converts an address in the browser", async ({ page }) => {
    await gotoTool(page, "ethereum-address-checksum");
    await assertToolHeading(page, "Ethereum Address Checksum");
    await expect(page.getByText("Valid address without an EIP-55 checksum")).toBeVisible();
    await expect(
      page.getByText("0x52908400098527886E0F7030069857D2E4169EE7", { exact: true })
    ).toBeVisible();

    await page
      .getByRole("textbox", { name: /^ethereum address$/i })
      .fill("0x52908400098527886E0F7030069857D2E4169EE7");
    await expect(page.getByText("Valid EIP-55 checksum")).toBeVisible();
  });

  test("calculates Ethereum Keccak-256 vectors", () => {
    const empty = calculateKeccak("", "text");
    expect(empty.hash).toBe(
      "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
    );

    const transfer = calculateKeccak("transfer(address,uint256)", "signature");
    expect(transfer.selector).toBe("0xa9059cbb");
    expect(transfer.hash).toHaveLength(66);
    expect(transfer.topic0).toBe(transfer.hash);
  });

  test("shows function selector and event topic in the browser", async ({ page }) => {
    await gotoTool(page, "keccak-calculator");
    await assertToolHeading(page, "Keccak-256 & Solidity Signature Calculator");
    await expect(page.getByText("0xa9059cbb", { exact: true })).toBeVisible();
    await expect(page.getByText("Function selector (first 4 bytes)", { exact: true })).toBeVisible();
    await expect(page.getByText("Event topic0 (full 32 bytes)", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Hex bytes" }).click();
    await page.getByRole("textbox", { name: /^hex bytes$/i }).fill("0xabc");
    await expect(page.getByText(/whole number of bytes/)).toBeVisible();
  });
});
