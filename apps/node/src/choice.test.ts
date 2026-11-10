import {unmask, cidrChoices} from "./choice.ts"
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

