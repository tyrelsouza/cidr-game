import {ipToInt, intToIp, randomIP, randomSuffix, availableHosts} from "./ip.ts"
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
  it("picks a random suffix between 1 and 31", () => {
    for (var i = 0; i < 10000; i++){
      const s = randomSuffix();
      expect(0 < s).toBe(true)
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
