import { keccak_256 } from "@noble/hashes/sha3.js";
import { bytesToHex, hexToBytes, utf8ToBytes } from "@noble/hashes/utils.js";

export type KeccakInputMode = "text" | "hex" | "signature";

export interface EthereumAddressResult {
  input: string;
  checksumAddress: string;
  isChecksummed: boolean;
  status: "checksummed" | "valid-unchecksummed" | "invalid-checksum";
}

export interface KeccakResult {
  hash: string;
  selector: string;
  topic0: string;
  byteLength: number;
}

export function inspectEthereumAddress(raw: string): EthereumAddressResult {
  const input = raw.trim();
  if (!/^0x[0-9a-fA-F]{40}$/.test(input)) {
    throw new Error("Enter a 20-byte Ethereum address with 0x followed by 40 hexadecimal characters.");
  }

  const checksumAddress = toChecksumAddress(input);
  const body = input.slice(2);
  const hasLowercase = /[a-f]/.test(body);
  const hasUppercase = /[A-F]/.test(body);
  const mixedCase = hasLowercase && hasUppercase;
  const isChecksummed = input === checksumAddress;

  return {
    input,
    checksumAddress,
    isChecksummed,
    status: isChecksummed
      ? "checksummed"
      : mixedCase
        ? "invalid-checksum"
        : "valid-unchecksummed",
  };
}

export function toChecksumAddress(raw: string): string {
  const input = raw.trim();
  if (!/^0x[0-9a-fA-F]{40}$/.test(input)) {
    throw new Error("Invalid Ethereum address.");
  }

  const lowercase = input.slice(2).toLowerCase();
  const hash = bytesToHex(keccak_256(utf8ToBytes(lowercase)));
  let checksum = "0x";

  for (let index = 0; index < lowercase.length; index += 1) {
    const character = lowercase[index];
    checksum += /[a-f]/.test(character) && Number.parseInt(hash[index], 16) >= 8
      ? character.toUpperCase()
      : character;
  }

  return checksum;
}

export function calculateKeccak(raw: string, mode: KeccakInputMode): KeccakResult {
  const bytes = mode === "hex" ? parseHexBytes(raw) : utf8ToBytes(raw);
  const hash = `0x${bytesToHex(keccak_256(bytes))}`;
  return {
    hash,
    selector: hash.slice(0, 10),
    topic0: hash,
    byteLength: bytes.length,
  };
}

function parseHexBytes(raw: string): Uint8Array {
  const hex = raw.trim().replace(/^0x/i, "");
  if (!hex) return new Uint8Array();
  if (!/^[0-9a-fA-F]+$/.test(hex)) {
    throw new Error("Hex input can contain only 0–9 and A–F.");
  }
  if (hex.length % 2 !== 0) {
    throw new Error("Hex input must contain a whole number of bytes (an even number of digits).");
  }
  return hexToBytes(hex);
}
