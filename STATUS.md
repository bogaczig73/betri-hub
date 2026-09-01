# STATUS — betri-hub

## 2026-09-02 · Athlete lactate history page
Branch `feat/athlete-history` → merged to `main` (`f348ca3`), pushed.

- Reviewer: `VERDICT: APPROVE` (after one REVISE loop).
- `test_cmd`: **empty for this project** — `pnpm build` stood in, exit `0`.
  Backlogged as an S; the gate is running on one leg until it's filled.
- `release` untouched. `deploy: review` — Radim promotes.

Added `/members/[memberId]`: an athlete's whole lactate history, one line
per test on one chart, per sport, with each test toggleable.

Open product questions raised by the review, not blocking the merge:
- `LactateChart` (test-detail page) is still a third visual style.
- The history chart dropped its gridlines to match `AnalysisChart`, which
  makes curve-vs-curve comparison harder.
