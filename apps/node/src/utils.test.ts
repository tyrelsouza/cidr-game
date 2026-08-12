import {shuffle} from "./utils.ts"
import {describe, expect, it} from "vitest";

describe("utils", () => {
  it("shuffles an array", () => {
    const arr = Array.from({ length: 100 }, (_, i) => i); // long enough that it has a minimal chance of being shuffled PERFECTLY
    const shuffled = shuffle(arr);
    const isEqual = (a: number[], b: number[]) => a.every((val, i) => val === b[i]);
    expect(isEqual(arr, shuffled)).toBe(false)
  })
})
