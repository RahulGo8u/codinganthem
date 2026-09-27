export interface CidrInfo {
  input: string;
  prefix: number;
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  netmask: string;
  wildcard: string;
  totalAddresses: number;
  usableHosts: number;
  note: string;
}

export function parseCidr(raw: string): CidrInfo {
  const input = raw.trim();
  const match = /^(\d{1,3}(?:\.\d{1,3}){3})\/(\d{1,2})$/.exec(input);
  if (!match) throw new Error("Enter an IPv4 CIDR such as 192.168.1.0/24.");

  const prefix = Number(match[2]);
  if (prefix < 0 || prefix > 32) throw new Error("Prefix length must be between 0 and 32.");
  const ip = ipToInt(match[1]);
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = (ip & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const totalAddresses = 2 ** (32 - prefix);

  let first = network;
  let last = broadcast;
  let usable = totalAddresses;
  let note = "Network and broadcast addresses are reserved.";
  if (prefix <= 30) {
    first = network + 1;
    last = broadcast - 1;
    usable = totalAddresses - 2;
  } else if (prefix === 31) {
    note = "A /31 is a point-to-point link. Both addresses are usable.";
  } else {
    note = "A /32 is a single host.";
  }

  return {
    input,
    prefix,
    network: intToIp(network),
    broadcast: intToIp(broadcast),
    firstHost: intToIp(first),
    lastHost: intToIp(last),
    netmask: intToIp(mask),
    wildcard: intToIp((~mask) >>> 0),
    totalAddresses,
    usableHosts: usable,
    note,
  };
}

function ipToInt(ip: string): number {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    throw new Error("Each IPv4 octet must be a whole number from 0 to 255.");
  }
  return (((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3]) >>> 0;
}

function intToIp(value: number): string {
  return [
    (value >>> 24) & 255,
    (value >>> 16) & 255,
    (value >>> 8) & 255,
    value & 255,
  ].join(".");
}
