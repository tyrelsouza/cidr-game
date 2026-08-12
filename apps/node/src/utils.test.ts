import {shuffle} from "./utils.ts"
import {describe, expect, it} from "vitest";

describe("utils", () => {
  it("returns a new array containing the same values", () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffle(arr);

    expect(shuffled).not.toBe(arr);
    expect(shuffled).toHaveLength(arr.length);
    expect([...shuffled].sort((a, b) => a - b)).toEqual(arr);
    expect(arr).toEqual([1, 2, 3, 4, 5]);
  })
})
