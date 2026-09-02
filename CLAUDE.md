@AGENTS.md

# betri-hub

A phone-first web app for the **Betri triathlon group** — a hub that collects
small, focused apps for the team. Members are shared across every app, so people
added in one tool show up in the next.

The first (and so far only) app is **Lactate Testing**: a coach creates a testing
session, adds athletes, records each athlete's lactate / pace-or-power /
heart-rate curve on a phone at the track, and the app computes their aerobic
(LT1) and anaerobic (LT2) thresholds.

Real athletes' real results. The numbers this app prints become the training
zones they train in, so a silently wrong calculation is the worst thing that can
happen here — worse than a crash, which at least announces itself.

## Stack

- **Next.js 16** (App Router, React 19, Server Actions) + **TypeScript**
- **Tailwind CSS v4** — mobile-first, orange/green athletic theme
- **Drizzle ORM** on **Neon** Postgres (`@neondatabase/serverless` HTTP driver)
- **Vercel** hosting. Node 24.x on the build.
- No test framework, no state library, no chart library. See "Deliberate" below.

## Run it

```bash
pnpm install
cp .env.example .env.local   # fill in DATABASE_URL (Neon *pooled* string)
pnpm db:push                 # create tables in your Neon database
pnpm dev                     # http://localhost:3000

pnpm test                    # node --test over the lactate maths + parsing
pnpm build                   # next build (also runs the TypeScript check)
pnpm lint                    # eslint — currently RED, see STATUS.md
```

`pnpm test` needs no database and no network.

## Layout

```
src/lib/lactate/     the threshold engine — pure, no React, no db
  types.ts           Stage, Result, AnalyzeOptions
  analyze.ts         orchestrator: sort, validate, fit, run every method
  methods.ts         OBLA, Bsln+, Log-log, LTP, Dmax family, LTratio
  fit.ts             polynomial + exponential fit, root-finding, segmented
                     (Muggeo) regression, HR interpolation, linear algebra
  bspline.ts         cubic B-spline fit (used by LTratio)
  sport.ts           run (pace) / bike (power) adapter — see "ascending" below
  display.ts         adapter between stored measurements and the engine
src/lib/format.ts    keypad parsing: "542" -> 5:42 /km, "124" -> 1.24 mmol/L
src/lib/db/          Drizzle schema + queries
src/app/*/actions.ts server actions — every database write
src/components/      UI, including three separate chart components
test/                node --test suite + the ESM resolver hook it needs
```

## Rules an agent must not break

1. **`main` is production.** A push to `main` deploys the live site the group
   uses. Verified on Vercel 2026-09-02 (`betri-hub-git-main-*` domain, latest
   deployment `target: production`). Work on a branch. `deploy: review` in
   `project.yaml` keeps the deploy guard armed.
2. **Merge gate: reviewer `VERDICT: APPROVE` *and* `pnpm test` exit 0**, in the
   same run, recorded in `STATUS.md`. `pnpm build` is not a substitute — it was
   standing in for tests until 2026-09-02 and that is why this file exists.
3. **Do not change a lactate calculation without re-running `pnpm test`.** The
   suite pins the engine against the `lactater` R package's published cycling
   demo — 17 methods, ±4 W. That fixture is the only external ground truth this
   engine has. If you intend to change a result, change the expected number in
   the same commit and say why in the message.
4. **The engine works in one ascending intensity space.** Higher number = harder
   effort. Bike power is already ascending; running pace (seconds/km) *descends*
   as effort rises, so `sport.ts` converts it to speed (3600/pace) on the way in
   and back on the way out. Never hand raw pace to `analyze()` — every method
   inverts and nothing errors.
5. **Never extrapolate a threshold.** If a curve never reaches 4.0 mmol/L,
   `OBLA 4.0` returns `NaN` plus a warning and the UI shows "—". Inventing a
   number outside the tested range hands an athlete a zone nobody measured.
6. **`BACKLOG.md` order is Radim's.** Append to the unranked section; never
   re-rank.
7. **Do not add a dependency** without asking. Node's own `--test` and type
   stripping cover testing; the charts are hand-written SVG on purpose.

## Deliberate — looks wrong, is not

- **There is no authentication, and that is decided, not forgotten.**
  `~/_hq/DECISIONS.md` **D-002**, answered by Radim 2026-09-02. Every test,
  participant and measurement is readable by anyone with the URL, including
  `/members/[memberId]`, which collects one athlete's whole history at a stable
  URL. The reasoning: `/lactate` already publishes every participant and their
  measurements, so the per-athlete page exposes nothing new — it widens
  convenience, not access. This is a small, known triathlon group's training
  data, not medical records, and login friction at the trackside on a phone
  costs more than it buys today. It is filed as a future feature in
  `BACKLOG.md`, unranked; Radim orders it when he wants it.
  **Do not "fix" this. Do not add auth as a side effect of another task.**
- **`Bsln+` builds on the *lowest* lactate reading, not the first.** A deliberate
  deviation from `lactater`, which takes the first row. Lactate often dips on
  stage 2 as warm-up lactate clears, and "baseline + 0.5" should mean 0.5 above
  the athlete's true floor, not above whatever the first needle happened to
  catch. An explicit resting value from the baseline editor still wins. Pinned
  by a test.
- **`analyze()` throws on non-increasing intensity** rather than merging or
  averaging duplicate stages. Two draws at the same power are two different
  numbers for one point and the engine will not guess which. The caller is
  currently the one at fault for not catching it — see STATUS.md.
- **`series.ts` is a separate plain module** rather than exports on the chart
  component. Every export of a `"use client"` file becomes a client reference
  when a server component imports it, so a palette exported from the chart reads
  back as `undefined` on the server and lines render with no stroke.
- **`test/resolve.mjs`** is a Node module-resolution hook, not a build step. It
  exists only because Node's ESM resolver knows nothing about the tsconfig `@/`
  alias or extensionless `.ts` imports. It lets the tests import the real source
  unmodified, so no application file is shaped by the tests.
- **Three chart components** (`LactateChart`, `AnalysisChart`, `HistoryChart`)
  with three visual styles. Known, on the backlog, not an oversight.
- **`LactateChart` plots stage index on the x-axis** while the other two plot
  intensity. Known and deliberately left alone — changing it changes the meaning
  of the busiest screen. It is Radim's call, on `BACKLOG.md`.
