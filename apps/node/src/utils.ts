// Fisher-Yates shuffle: every ordering of `arr` is equally likely.
//
// Why not `arr.sort(() => Math.random() - 0.5)`? Sort algorithms assume the comparator
// is consistent (if a < b once, then always). A random comparator breaks that, and V8's
// sort then favours some orderings: with 4 items, the first one ended up first or last
// about 67% of the time instead of 50%. In this game that leaked where the answer was.
export function shuffle(arr: number[]): number[] {
    // Work on a copy so callers' arrays are never reordered under them.
    const a = [...arr];

    // Fill positions from the last one down. Everything after `i` is already final;
    // everything at or before `i` is the pool still to be placed.
    // Stop at i = 1: once one item is left in the pool, it has nowhere else to go.
    for (let i = a.length - 1; i > 0; i--) {
        // Pick a uniformly random index from the pool, 0..i inclusive.
        // `i + 1` (not `i`) matters: the item already at `i` must be allowed to stay,
        // otherwise some orderings become impossible and the result is biased again.
        // Picking from the whole array (0..length-1) instead would also be biased: it
        // gives n^n equally likely pick sequences, which don't divide evenly into n! orders.
        const j = Math.floor(Math.random() * (i + 1));

        // Move the chosen item into position `i`, where it stays, and move the item it
        // replaced back into the pool. The `!` is only for noUncheckedIndexedAccess:
        // i and j are always valid indexes here.
        [a[i], a[j]] = [a[j]!, a[i]!];
    }

    // n items take n - 1 picks with n, n-1, ..., 2 choices each: n! equally likely
    // pick sequences, one for each of the n! orderings, so each ordering has chance 1/n!.
    return a;
}
