import {ipToInt, intToIp, randomIP} from "./ip.ts"
import {describe, expect, it} from "vitest";

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
