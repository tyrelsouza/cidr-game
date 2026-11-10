import {shuffle} from "./utils.ts"
import {afterEach, describe, expect, it, vi} from "vitest";

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

describe("shuffle is Fisher-Yates", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  // For i from the last index down to 1, swap a[i] with a[floor(random * (i + 1))].
  // Expected outputs checked with an independent Python implementation (verify4.py).
  it.each([
    [[0, 0, 0], [2, 3, 4, 1]],
    [[1 - 2 ** -53, 1 - 2 ** -53, 1 - 2 ** -53], [1, 2, 3, 4]], // j === i every time: no swaps
    [[0.5, 0.5, 0.5], [1, 4, 2, 3]],
    [[0.3, 0.9, 0.1], [4, 1, 3, 2]],
  ])("Math.random sequence %j gives %j", (randoms, expected) => {
    const spy = vi.spyOn(Math, "random")
    for (const r of randoms) spy.mockReturnValueOnce(r)

    expect(shuffle([1, 2, 3, 4])).toEqual(expected)
    expect(spy).toHaveBeenCalledTimes(3) // n - 1 draws for 4 items
  })

  it("handles empty and single-item arrays without drawing", () => {
    const spy = vi.spyOn(Math, "random")
    expect(shuffle([])).toEqual([])
    expect(shuffle([7])).toEqual([7])
    expect(spy).not.toHaveBeenCalled()
  })
})

describe("shuffle is fair", () => {
  // 40,000 runs: tolerances are > 9 standard deviations, so a fair shuffle fails
  // by chance with probability ~1e-20. The old sort-based shuffle puts the first
  // item at index 0 about 36% of the time, well outside 25% ± 2%.
  const RUNS = 40_000

  it("puts the first item in each position 25% ± 2% of the time", () => {
    const counts = [0, 0, 0, 0]
    for (let i = 0; i < RUNS; i++) {
      counts[shuffle([0, 1, 2, 3]).indexOf(0)]! += 1
    }
    for (const c of counts) {
      expect(c / RUNS).toBeGreaterThanOrEqual(0.23)
      expect(c / RUNS).toBeLessThanOrEqual(0.27)
    }
  })

  it("produces all 24 orderings of 4 items, each 1/24 ± 1% of the time", () => {
    const counts = new Map<string, number>()
    for (let i = 0; i < RUNS; i++) {
      const key = shuffle([0, 1, 2, 3]).join("")
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    expect(counts.size).toBe(24)
    for (const c of counts.values()) {
      expect(c / RUNS).toBeGreaterThanOrEqual(1 / 24 - 0.01)
      expect(c / RUNS).toBeLessThanOrEqual(1 / 24 + 0.01)
    }
  })
})
