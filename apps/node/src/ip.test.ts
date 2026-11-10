import {ipToInt, intToIp, randomIP, randomSuffix, availableHosts, parseIPv4} from "./ip.ts"
import {afterEach, describe, expect, it, vi} from "vitest";

describe("ipToInt", () => {
  it("converts good", () => {
    expect(ipToInt("0.0.0.0")).toBe(0)
    expect(ipToInt("127.0.0.1")).toBe(2130706433)
    expect(ipToInt("255.255.255.255")).toBe(4294967295)
  })
  it("ipToInt converts malformed", () => {
    expect(ipToInt("apple")).toBe(0)
  })
})

describe("intToIp", () => {
  it("converts properly", () => {
    expect(intToIp(0)).toBe("0.0.0.0")
    expect(intToIp(2130706433)).toBe("127.0.0.1")
    expect(intToIp(-1)).toBe("255.255.255.255")
    expect(intToIp(4294967297)).toBe("0.0.0.1") // roll over
  })
})

describe("randomSuffix", () => {
  it("picks a random suffix between 2 and 31", () => {
    // /1 is excluded: only two networks exist, so it can't make a 4-choice question.
    for (var i = 0; i < 10000; i++){
      const s = randomSuffix();
      expect(s >= 2).toBe(true)
      expect(s < 32).toBe(true)
    }
  });
})

describe("randomIP", () => {
  it("looks like an ip", () => {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;
    for (var i = 0; i < 10000; i++){
      expect(randomIP()).toMatch(ipv4Regex)
    }
  })

  describe("range", () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it("returns 0.0.0.0 at the bottom of Math.random's range", () => {
      vi.spyOn(Math, "random").mockReturnValue(0)
      expect(randomIP()).toBe("0.0.0.0")
    })

    it("returns 255.255.255.255 at the top of Math.random's range, without wrapping to 0.0.0.0", () => {
      vi.spyOn(Math, "random").mockReturnValue(1 - 2 ** -53) // largest value Math.random can return
      expect(randomIP()).toBe("255.255.255.255")
    })

    it("maps the midpoint of Math.random's range to 128.0.0.0", () => {
      vi.spyOn(Math, "random").mockReturnValue(0.5)
      expect(randomIP()).toBe("128.0.0.0")
    })
  })
})

describe("availableHosts", () => {
  it("calculates number of hosts", () => {
    expect(availableHosts(-22)).toBe(NaN)
    expect(availableHosts(12312313123)).toBe(NaN)

    expect(availableHosts(32)).toBe(1)
    expect(availableHosts(31)).toBe(2)
    expect(availableHosts(30)).toBe(2)
    expect(availableHosts(29)).toBe(6)
    expect(availableHosts(28)).toBe(14)
    expect(availableHosts(2)).toBe(1073741822)
    expect(availableHosts(1)).toBe(2147483646)
  })
})

describe("parseIPv4", () => {
  // expected values checked with Python's ipaddress.IPv4Address
  it.each([
    ["0.0.0.0", 0],
    ["255.255.255.255", 4294967295],
    ["10.0.15.130", 167776130],
    ["192.168.1.1", 3232235777],
  ])("parses %s to %i", (input, expected) => {
    expect(parseIPv4(input)).toBe(expected)
  })

  it.each([
    "999.1.1.1",     // octet over 255
    "256.0.0.0",
    "1.2.3",         // too few octets
    "1.2.3.4.5",     // too many octets
    "apple",
    "",
    "01.2.3.4",      // leading zero
    "1.2.3.-4",      // negative octet
    " 1.2.3.4",      // whitespace
    "1.2.3.4 ",
    "1..3.4",        // empty octet
    "0x1.2.3.4",     // hex
    "1.2.3.4/24",    // CIDR notation, not a bare address
  ])("rejects %j", (input) => {
    expect(parseIPv4(input)).toBeNull()
  })

  it.each([
    [undefined],
    [null],
    [167776130],
    [["1.2.3.4"]],
    [{}],
  ])("rejects non-string %j", (input) => {
    expect(parseIPv4(input)).toBeNull()
  })
})
