# Plan: fix the eight server bugs

Scope: `apps/node/src` only. Responses to valid requests don't change, except that the correct answer's position becomes fair.

## Bugs being fixed

1. Some `suffix` values (`abc`, `2000`, `-2000`) put `cidrChoices` in an infinite loop. Node runs that loop on its only thread, so the whole server stops responding.
2. `unmask` returns a negative number for addresses at or above 128.0.0.0. The previous-subnet choice is then never offered, and choices wrap around past the end of the address space.
3. At /1 (and sometimes /2) the wrong answers wrap around and repeat. A repeat of the correct address is graded as wrong.
4. Sending `base` twice (`?base=a&base=b`) makes `base` an array. The request crashes with a 500 HTML page that includes the stack trace.
5. Malformed IPs (`999.999.1.1`, `1.2.3`, `apple`) are accepted silently and produce nonsense.
6. `unmask` at /0 masks nothing, because JavaScript treats `<< 32` as `<< 0`.
7. The `sort`-based shuffle is biased. The correct answer lands in the first or last position about two thirds of the time.
8. `randomIP` has an off-by-one, so `0.0.0.0` comes up twice as often as any other address.

## Step 1: IP math in `ip.ts` and `choice.ts` (bugs 2, 6, 8)

- **Bug 2:** in `unmask`, return `(ipInt & mask) >>> 0`.
- **Bug 6:** in `unmask`, treat `prefix === 0` as a mask of `0` instead of relying on the shift.
- **Bug 8:** in `randomIP`, use `Math.floor(Math.random() * 2 ** 32)`.
- **Tests:**
  - `unmask("200.1.1.1", 24) === 3355508992`
  - `unmask("10.1.2.3", 0) === 0`
  - `unmask("255.255.255.255", 32) === 4294967295`
  - Make the `randomIP` test in `ip.test.ts` assert the regex result. Today it runs the regex and ignores the answer.

## Step 2: Choosing the wrong answers in `cidrChoices` (bugs 1 and 3, inside the function)

Replace the "previous, next, then +2, +3…" loop with a bounded search that never wraps:

- Work out how many networks exist at this prefix (`2 ** prefix`) and where the answer's network sits among them.
- Take neighbouring networks alternately below and above (−1, +1, −2, +2, …), skipping any outside 0 to 2³² − 1, until there are three or none are left.
- The loop is limited by how many networks exist, so it always finishes.
- **Behaviour change:** at /1 only two networks exist, so the response has 2 choices instead of 4. Both frontends render whatever is in `choices`, so they need no changes. (Open decision below.)
- **Tests:**
  - Loop over every prefix from 1 to 32 with a low, a middle and a high IP. Each time, check that the choices are unique, valid addresses, include the correct network, and number `min(4, 2 ** prefix)`.
  - Check that `255.255.255.253/30` gives `.240`, `.244`, `.248` and `.252`, with no wrap to `0.0.0.0`.

## Step 3: Checking the input to `/api/generate` (bugs 1, 4, 5)

- Add `parseIPv4(s: unknown): number | null` to `ip.ts`. It requires a string of exactly four dot-separated decimal octets, each 0–255. `ipToInt` stays as it is, so its existing `"apple" → 0` test still passes.
- In `app.ts`, require `suffix` to be a string of digits with a value from 1 to 32. /0 is rejected because it has only one network, so there would be nothing to choose between.
- Reject an array or other non-string value with **400** and `{"error": "..."}`.
- When a parameter is missing, keep the current defaults (`192.168.1.1`, `30`). A parameter that is present but empty (`?suffix=`) gets 400.
- Strict formats: no leading zeros (`08`, `01.2.3.4`), signs (`+30`), whitespace, decimals or hex. This matches Python's `ipaddress.IPv4Address`, which was used to check the expected values.
- Add a final error handler, exported from `app.ts` as `errorHandler`, that returns `500 {"error": "internal error"}` instead of Express's HTML page with the stack trace.
- **Tests (supertest):**
  - 400 for `suffix=abc`, `2000`, `-2000`, `0`, `33` and `1.5`.
  - 400 for `base=a&base=b`, `999.1.1.1`, `1.2.3` and `apple`.
  - 200 for valid input and when parameters are missing.
  - Each request has a short timeout, so a regression to the infinite loop fails the test instead of hanging.

## Step 4: Fair shuffle in `utils.ts` (bug 7)

- Replace the `sort`-based shuffle with Fisher–Yates on a copy of the array.
- **Tests:**
  - The existing tests in `utils.test.ts` still apply.
  - Add a test that stubs `Math.random` to fix the result.
  - Add a statistical test that runs 40,000 shuffles and expects each position to hold the answer 25% ± 2% of the time.

## Checking it worked

- Run `npx vitest run` in `apps/node`. Root `npm test` is still broken for the frontends, as noted in `CLAUDE.md`.
- Start the server and use `curl` to confirm `?suffix=abc` returns 400 and `/healthz` still responds afterwards.

## Open decision

At /1, either return 2 choices (recommended, since only two networks exist), or remove 1 from `randomSuffix` and reject `suffix=1` so every question keeps 4 choices.

## Out of scope

The frontend test failures (no root Vitest config, plus one failing test each in React and Vue).
