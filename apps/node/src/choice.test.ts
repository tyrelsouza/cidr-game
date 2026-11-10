import {unmask, cidrChoices} from "./choice.ts"
import {intToIp, ipToInt} from "./ip.ts"
import {describe, expect, it} from "vitest";

describe("unmask", () => {
  it("will unmask properly", () => {
    expect(unmask("123.123.123.123", 27)).toBe(2071690080)
    expect(unmask("0.0.0.0", 27)).toBe(0)
    expect(unmask("127.0.0.1", 1)).toBe(0)
    expect(unmask("127.0.0.1", 2)).toBe(1073741824)
    expect(unmask("127.0.0.1", 32)).toBe(2130706433)
  })

  it("returns an unsigned network for addresses at or above 128.0.0.0", () => {
    expect(unmask("200.1.1.1", 24)).toBe(3355508992)       // 200.1.1.0
    expect(unmask("128.0.0.1", 1)).toBe(2147483648)        // 128.0.0.0
    expect(unmask("255.255.255.253", 30)).toBe(4294967292) // 255.255.255.252
    expect(unmask("255.255.255.255", 32)).toBe(4294967295)
    expect(unmask("192.168.1.77", 24)).toBe(3232235776)    // 192.168.1.0
  })

  it("never returns a negative network for any prefix", () => {
    for (let prefix = 0; prefix <= 32; prefix++) {
      expect(unmask("255.255.255.255", prefix)).toBeGreaterThanOrEqual(0)
    }
  })

  it("masks everything at /0", () => {
    expect(unmask("10.1.2.3", 0)).toBe(0)
    expect(unmask("255.255.255.255", 0)).toBe(0)
  })
})

describe("cidrChoices", () => {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;
  // Shuffle order is random, so compare choices as numerically sorted lists.
  const sorted = (ips: string[]) => [...ips].sort((a, b) => ipToInt(a) - ipToInt(b));

  const ips = [
    "0.0.0.0",          // bottom of the address space
    "10.20.30.40",
    "127.255.255.255",  // just below the signed/unsigned boundary
    "128.0.0.0",        // just above it
    "200.1.1.1",
    "255.255.255.255",  // top of the address space
  ];

  describe.each(ips)("for %s", (ip) => {
    it.each(Array.from({length: 32}, (_, i) => i + 1))("at /%i returns valid, unique, nearby choices", (prefix) => {
      const {choices, answer} = cidrChoices(ip, prefix);
      const network = unmask(ip, prefix);
      const blockSize = 2 ** (32 - prefix);

      // only 2^prefix networks exist, so small prefixes get fewer than 4 choices
      expect(choices).toHaveLength(Math.min(4, 2 ** prefix));
      expect(new Set(choices).size).toBe(choices.length);
      expect(choices[answer]).toBe(intToIp(network));

      for (const choice of choices) {
        expect(choice).toMatch(ipv4Regex);
        // every choice is a real network address at this prefix
        expect(unmask(choice, prefix)).toBe(ipToInt(choice));
        // nearest networks only: no wrapping to the other end of the address space
        expect(Math.abs(ipToInt(choice) - network)).toBeLessThanOrEqual(3 * blockSize);
      }
    });
  });

  it("does not wrap past 255.255.255.255 at the top edge", () => {
    expect(sorted(cidrChoices("255.255.255.253", 30).choices)).toEqual(
      ["255.255.255.240", "255.255.255.244", "255.255.255.248", "255.255.255.252"]);
    expect(sorted(cidrChoices("255.255.255.255", 32).choices)).toEqual(
      ["255.255.255.252", "255.255.255.253", "255.255.255.254", "255.255.255.255"]);
  });

  it("does not wrap below 0.0.0.0 at the bottom edge", () => {
    expect(sorted(cidrChoices("0.0.0.1", 30).choices)).toEqual(
      ["0.0.0.0", "0.0.0.4", "0.0.0.8", "0.0.0.12"]);
  });

  it("offers the previous and next subnets in the middle of the range", () => {
    const {choices} = cidrChoices("10.0.0.5", 30);
    expect(choices).toContain("10.0.0.0");
    expect(choices).toContain("10.0.0.4");
    expect(choices).toContain("10.0.0.8");
  });

  it("offers exactly the two networks at /1", () => {
    for (const ip of ["10.1.1.1", "200.1.1.1"]) {
      expect(sorted(cidrChoices(ip, 1).choices)).toEqual(["0.0.0.0", "128.0.0.0"]);
    }
  });

  it("offers all four networks at /2", () => {
    for (const ip of ["10.1.1.1", "70.1.1.1", "130.1.1.1", "200.1.1.1"]) {
      expect(sorted(cidrChoices(ip, 2).choices)).toEqual(
        ["0.0.0.0", "64.0.0.0", "128.0.0.0", "192.0.0.0"]);
    }
  });
});

describe("cidrChoices answer position", () => {
  // The bug players see: the correct answer clustered in the first/last slot.
  // 40,000 runs, ± 2% is > 9 standard deviations (see utils.test.ts).
  it("puts the correct answer in each of the 4 slots 25% ± 2% of the time", () => {
    const RUNS = 40_000
    const counts = [0, 0, 0, 0]
    for (let i = 0; i < RUNS; i++) {
      counts[cidrChoices("10.0.15.130", 26).answer]! += 1
    }
    for (const c of counts) {
      expect(c / RUNS).toBeGreaterThanOrEqual(0.23)
      expect(c / RUNS).toBeLessThanOrEqual(0.27)
    }
  });
});
