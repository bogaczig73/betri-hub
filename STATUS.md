# STATUS — betri-hub

## 2026-09-02 · Real `test_cmd`, and the project files READY.md asks for
Branch `chore/test-cmd-and-project-docs`. **Not merged, not pushed, not deployed.**

`pnpm test` — 46/46, exit 0. `pnpm build` — clean. `pnpm lint` — red, pre-existing
(see "Needs a human").

### What changed
- `test/lactate.test.ts`, `test/format.test.ts` — `node --test`, no framework, no
  new dependency. Covers the threshold engine against the `lactater` R package's
  published cycling demo (17 methods, ±4 W / ±0.15 mmol/L), the input contract,
  baseline handling, HR interpolation, the consensus median, both sport adapters,
  and every keypad parse/format round-trip.
- `test/resolve.mjs` + `test/setup.mjs` — a ~25-line Node ESM resolution hook so
  the tests can import `src/**` unmodified (Node's resolver knows nothing about
  the tsconfig `@/` alias or extensionless `.ts`). No application file was
  changed to make it testable.
- Deleted `src/lib/lactate/validate.ts`. It computed exactly these numbers and
  then only *printed* `FAIL` — it exited 0 either way, so it could go red with
  nobody noticing. Its fixture, its tolerances and all four of its edge cases
  moved into the test suite intact.
- `project.yaml`: `test_cmd: "pnpm test"`; `critical_paths` widened from
  `[src/lib/db/, drizzle/]` to include the lactate engine, `src/lib/format.ts`
  and both `actions.ts` files; `production_branch` corrected `release` → `main`.
- `CLAUDE.md` written from a stub (it was one line: `@AGENTS.md`).

### Mutation check — the gate actually bites
Seven calculations were broken one at a time and the suite re-run:

| mutation | result |
| --- | --- |
| `moddmaxStartIdx` rise threshold `0.4` → `0.1` | **red** (ModDmax) |
| `interpHr` linear → nearest-neighbour | **red** (2 tests) |
| `digitsToTempo` seconds field `slice(-2)` → `slice(-3)` | **red** (2 tests) |
| `SPORTS.run.toIntensity` `3600/v` → `1000/v` | **red** |
| `summarise` median → lower-middle element | **red** |
| `perpDistance` drop the `/‖chord‖` normalisation | green — *equivalent mutant*, a positive constant factor cannot move an `argmax` |
| `solveRising` keep the first crossing instead of the last | green — see "untested" below |

Everything reverted; `git status` clean before committing.

### Deliberately untested
- **React components, charts, server actions.** Testing them needs a database or
  a DOM, and neither buys anything a reviewer would not catch faster.
- **`solveRising`'s "keep the highest-intensity crossing" rule.** It only matters
  when a fitted curve crosses the target more than once, which the reference
  fixture never does; pinning it would mean inventing a curve to suit the test.
  It is a real design decision and it is currently unguarded.
- **Heart rate against the reference.** The engine interpolates HR linearly
  between raw stages; `lactater`'s published HR column runs ~4-5 bpm lower at the
  same intensity (e.g. OBLA 2.0: ours 158, theirs 153) and how it derives that is
  not documented. The old `validate.ts` printed both and asserted neither. So the
  suite pins `interpHr`'s own behaviour exactly instead, and the divergence is
  written down here rather than papered over. Nobody has decided which is right.

## Needs a human

- **`pnpm lint` fails on `main` and did before this branch** — 4 errors, all the
  same new-in-React-19 rule `react-hooks/set-state-in-effect`, in
  `AnalysisSheet.tsx:35`, `MeasurementSheet.tsx:128`, `Sheet.tsx:34` and
  `Sheet.tsx:39`. Not touched here; it is a behaviour change to fix. It is not in
  the merge gate, but it means `pnpm lint` cannot be added to the gate as-is.
- **Duplicate intensity crashes the analysis view.** `analyze()` throws
  `LactateInputError` on two stages at the same intensity — correct for the
  engine. But `analyzeTest()` is called inside a `useMemo` in
  `LactateAnalysisView` with no `try`/`catch` and no error boundary above it, so
  a coach who records the same pace or the same watts twice (a plateau stage, or
  a typo) takes down the whole analysis screen. Reproduced. Not fixed here — this
  was a setup task, and the fix is a product call: reject the second entry at
  input, merge the two readings, or catch and show the warning. Appended to
  `BACKLOG.md` unranked. Pinned by a test named `KNOWN GAP:` so it fails loudly
  the day the behaviour changes.

## 2026-09-02 · Athlete lactate history page
Branch `feat/athlete-history` → merged to `main` (`f348ca3`), pushed.

- Reviewer: `VERDICT: APPROVE` (after one REVISE loop).
- `test_cmd`: **empty for this project** — `pnpm build` stood in, exit `0`.
  Backlogged as an S; the gate is running on one leg until it's filled.
  *(Filled 2026-09-02, above.)*
- `release` untouched. `deploy: review` — Radim promotes.
  *(`release` has never existed in this repo; `main` is production. Corrected
  in `project.yaml` above.)*

Added `/members/[memberId]`: an athlete's whole lactate history, one line
per test on one chart, per sport, with each test toggleable.

Open product questions raised by the review, not blocking the merge:
- `LactateChart` (test-detail page) is still a third visual style.
- The history chart dropped its gridlines to match `AnalysisChart`, which
  makes curve-vs-curve comparison harder.
