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
})

