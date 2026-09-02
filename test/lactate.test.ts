/**
 * Lactate engine regression suite.
 *
 * Supersedes the old `src/lib/lactate/validate.ts`, which computed the same
 * numbers but only *printed* pass/fail and exited 0 either way — so it could go
 * red without anything noticing. Same fixture, same tolerances, now asserted.
 *
 * The fixture is the `lactater` R package's documented cycling demo (ascending
 * watts). It is the only external ground truth this engine has: if a refactor
 * moves a threshold by more than a few watts, that is a real change to an
 * athlete's training zones and it should stop the merge.
 */

import assert from "node:assert/strict";
import test from "node:test";

import { analyze, LactateInputError } from "../src/lib/lactate/analyze";
import { analyzeTest, summarise } from "../src/lib/lactate/display";
import { interpHr } from "../src/lib/lactate/fit";
import { formatIntensity, SPORTS } from "../src/lib/lactate/sport";
import type { Result, Stage } from "../src/lib/lactate/types";

// The intensity-0 row is the rest/baseline point.
const baseline = { intensity: 0, lactate: 0.93, heartRate: 96 };
const demo: Stage[] = [
  { intensity: 50, lactate: 0.98, heartRate: 114 },
  { intensity: 75, lactate: 1.23, heartRate: 134 },
  { intensity: 100, lactate: 1.88, heartRate: 154 },
  { intensity: 125, lactate: 2.8, heartRate: 170 },
  { intensity: 150, lactate: 4.21, heartRate: 182 },
  { intensity: 175, lactate: 6.66, heartRate: 193 },
  { intensity: 191, lactate: 8.64, heartRate: 198 },
];

/** method -> [expected intensity (W), expected lactate (mmol/L)] from lactater. */
const expected: Record<string, [number, number]> = {
  "Log-log": [83.4, 1.4],
  "OBLA 2.0": [105, 2],
  "OBLA 2.5": [118, 2.5],
  "OBLA 3.0": [129, 3],
  "OBLA 3.5": [137, 3.5],
  "OBLA 4.0": [145, 4],
  "Bsln + 0.5": [82.5, 1.43],
  "Bsln + 1.0": [104, 1.93],
  "Bsln + 1.5": [117, 2.43],
  Dmax: [132, 3.1],
  ModDmax: [140, 3.6],
  "Exp-Dmax": [135, 3.3],
  "Log-Poly-ModDmax": [143, 3.8],
  "Log-Exp-ModDmax": [146, 4],
  LTP1: [88.8, 1.5],
  LTP2: [148, 4.1],
  LTratio: [71.2, 1.2],
};

/** Intensity tolerance (W). The reference docs round hard. */
const ITOL = 4;
/** Lactate tolerance (mmol/L). Same reason. */
const LTOL = 0.15;

const reference = analyze(demo, {
  fit: "3rd degree polynomial",
  baselineLactate: baseline.lactate,
  baselineIntensity: baseline.intensity,
  includeBaseline: true,
});
const byMethod = new Map(reference.results.map((r) => [r.method, r]));

test("reference fixture: every documented method is produced", () => {
  assert.deepEqual(
    Object.keys(expected).filter((m) => !byMethod.has(m)),
    [],
    "methods missing from the engine output",
  );
  assert.equal(reference.warnings.length, 0, "7 clean stages should not warn");
});

for (const [method, [ei, el]] of Object.entries(expected)) {
  test(`reference fixture: ${method}`, () => {
    const r = byMethod.get(method) as Result;
    assert.ok(
      Number.isFinite(r.intensity),
      `${method} produced a non-finite intensity`,
    );
    assert.ok(
      Math.abs(r.intensity - ei) <= ITOL,
      `${method}: intensity ${r.intensity.toFixed(1)} W, expected ${ei} ±${ITOL}`,
    );
    assert.ok(
      Math.abs(r.lactate - el) <= LTOL,
      `${method}: lactate ${r.lactate.toFixed(2)}, expected ${el} ±${LTOL}`,
    );
    assert.ok(
      typeof r.heartRate === "number" && Number.isFinite(r.heartRate),
      `${method}: no heart rate, though every stage carries one`,
    );
  });
}

test("OBLA reports its own target concentration exactly", () => {
  for (const t of [2, 2.5, 3, 3.5, 4]) {
    assert.equal((byMethod.get(`OBLA ${t.toFixed(1)}`) as Result).lactate, t);
  }
});

test("thresholds are ordered LT1 below LT2", () => {
  const lt1 = summarise(reference.results.filter((r) => r.estimates === "LT1"));
  const lt2 = summarise(reference.results.filter((r) => r.estimates === "LT2"));
  assert.ok(lt1 && lt2);
  assert.ok(
    lt1.intensity < lt2.intensity,
    `LT1 ${lt1.intensity} should sit below LT2 ${lt2.intensity}`,
  );
  assert.ok(lt1.lactate < lt2.lactate);
});

// ---------- input contract ----------

test("non-increasing intensity is rejected, not silently averaged", () => {
  assert.throws(
    () =>
      analyze([
        { intensity: 10, lactate: 1 },
        { intensity: 10, lactate: 2 },
        { intensity: 12, lactate: 3 },
      ]),
    LactateInputError,
  );
});

test("unsorted input is sorted rather than rejected", () => {
  const shuffled = [demo[3], demo[0], demo[5], demo[1], demo[4], demo[2]];
  const out = analyze(shuffled);
  assert.deepEqual(
    out.stages.map((s) => s.intensity),
    [50, 75, 100, 125, 150, 175],
  );
});

test("too few stages: no results, and it says so", () => {
  const out = analyze([
    { intensity: 10, lactate: 1 },
    { intensity: 12, lactate: 1.4 },
  ]);
  assert.deepEqual(out.results, []);
  assert.match(out.warnings[0], /Fewer than 4 stages/);
});

test("thin data still warns", () => {
  const three = analyze([
    { intensity: 10, lactate: 1.0 },
    { intensity: 12, lactate: 1.4 },
    { intensity: 14, lactate: 2.6 },
  ]);
  assert.ok(three.results.length > 0);
  assert.match(three.warnings[0], /Fewer than 4 stages/);

  const four = analyze([
    { intensity: 10, lactate: 1.0 },
    { intensity: 12, lactate: 1.4 },
    { intensity: 14, lactate: 2.6 },
    { intensity: 16, lactate: 4.0 },
  ]);
  assert.match(four.warnings[0], /Only 4 stages/);
});

test("an unreached target is NaN + a warning, never extrapolated", () => {
  // A curve that tops out at 2.1 mmol/L: OBLA 4.0 has no honest answer, and
  // inventing one hands the athlete a threshold above anything measured.
  const out = analyze([
    { intensity: 10, lactate: 0.8 },
    { intensity: 12, lactate: 1.0 },
    { intensity: 14, lactate: 1.3 },
    { intensity: 16, lactate: 1.7 },
    { intensity: 18, lactate: 2.1 },
  ]);
  const obla4 = out.results.find((r) => r.method === "OBLA 4.0") as Result;
  assert.ok(Number.isNaN(obla4.intensity));
  assert.deepEqual(obla4.warnings, ["target never reached in range"]);

  // ...and a NaN never reaches the summary card.
  const lt2 = summarise(out.results.filter((r) => r.estimates === "LT2"));
  assert.ok(lt2 === null || Number.isFinite(lt2.intensity));
});

test("solved intensities stay inside the measured range", () => {
  for (const r of reference.results) {
    if (!Number.isFinite(r.intensity)) continue;
    assert.ok(
      r.intensity >= 0 && r.intensity <= 191,
      `${r.method} at ${r.intensity} W is outside the tested 0–191 W`,
    );
  }
});

// ---------- baseline handling ----------

test("Bsln+ builds on the lowest lactate, not the first draw", () => {
  // Lactate often dips on stage 2 as warm-up lactate clears. "Baseline + 0.5"
  // must mean 0.5 above the athlete's floor (1.2), not above whatever the first
  // needle happened to catch (1.5). Deliberate deviation from lactater.
  const dipped = analyze([
    { intensity: 12.0, lactate: 1.5 },
    { intensity: 12.9, lactate: 1.2 },
    { intensity: 13.8, lactate: 1.4 },
    { intensity: 15.0, lactate: 2.1 },
    { intensity: 16.4, lactate: 3.4 },
  ]);
  const bsln = dipped.results.find((r) => r.method === "Bsln + 0.5") as Result;
  assert.equal(Number(bsln.lactate.toFixed(10)), 1.7);
});

test("an explicit resting lactate overrides the observed floor", () => {
  const out = analyze(demo, { baselineLactate: 0.93 });
  const bsln = out.results.find((r) => r.method === "Bsln + 1.0") as Result;
  assert.equal(Number(bsln.lactate.toFixed(10)), 1.93);
});

test("a baseline at or above the first stage is ignored, not prepended", () => {
  const bad = analyze(demo, {
    includeBaseline: true,
    baselineIntensity: 50, // == the first stage; would break monotonicity
    baselineLactate: 0.93,
  });
  const ok = analyze(demo, { baselineLactate: 0.93 });
  assert.deepEqual(
    bad.results.map((r) => r.method),
    ok.results.map((r) => r.method),
  );
});

// ---------- heart-rate interpolation ----------
// This is what turns a threshold into an HR zone an athlete actually trains in.

test("interpHr interpolates linearly and clamps at both ends", () => {
  const stages = [
    { intensity: 100, heartRate: 150 },
    { intensity: 120, heartRate: 170 },
    { intensity: 140, heartRate: 180 },
  ];
  assert.equal(interpHr(stages, 110), 160);
  assert.equal(interpHr(stages, 130), 175);
  assert.equal(interpHr(stages, 100), 150);
  assert.equal(interpHr(stages, 50), 150, "below range clamps to the first");
  assert.equal(interpHr(stages, 999), 180, "above range clamps to the last");
});

test("interpHr skips stages with no reading, and gives up on none", () => {
  assert.equal(
    interpHr(
      [
        { intensity: 100, heartRate: 150 },
        { intensity: 120, heartRate: null },
        { intensity: 140, heartRate: 190 },
      ],
      120,
    ),
    170,
  );
  assert.equal(interpHr([{ intensity: 100, heartRate: null }], 100), null);
  assert.equal(interpHr([], 100), null);
});

// ---------- consensus summary ----------

test("summarise takes the median, and rounds heart rate", () => {
  const mk = (i: number, l: number, hr: number | null) =>
    ({ intensity: i, lactate: l, heartRate: hr }) as Result;
  assert.deepEqual(summarise([mk(100, 2, 150), mk(120, 3, 161), mk(140, 4, 170)]), {
    intensity: 120,
    lactate: 3,
    heartRate: 161,
  });
  assert.deepEqual(summarise([mk(100, 2, 150), mk(120, 3, 161)]), {
    intensity: 110,
    lactate: 2.5,
    heartRate: 156, // 155.5 rounded
  });
  assert.equal(summarise([]), null);
  assert.equal(summarise([mk(NaN, 4, 170)]), null);
  assert.equal(
    summarise([mk(100, 2, null), mk(120, 3, null)])?.heartRate,
    null,
    "no heart rates in means no heart rate out",
  );
});

// ---------- sport adapters ----------

test("bike: watts pass through the adapter untouched", () => {
  const viaAdapter = analyzeTest(
    demo.map((s) => ({
      lactate: s.lactate,
      intensity: s.intensity,
      heartRate: s.heartRate,
    })),
    {
      baselineLactate: baseline.lactate,
      baselineIntensity: baseline.intensity, // 0 → cannot be fed to the fit
      includeBaseline: true,
    },
    "bike",
  );
  const direct = new Map(
    analyze(demo, { baselineLactate: baseline.lactate }).results.map((r) => [
      r.method,
      r.intensity,
    ]),
  );
  assert.equal(viaAdapter.usable, 7);
  for (const r of viaAdapter.results) {
    assert.equal(r.intensity, direct.get(r.method), `${r.method} drifted`);
  }
});

test("run: pace round-trips through speed and ascends as pace drops", () => {
  const run = SPORTS.run;
  for (const pace of [120, 180, 342, 425, 600, 720]) {
    assert.equal(run.fromIntensity(run.toIntensity(pace)), pace);
  }
  assert.ok(
    run.toIntensity(300) > run.toIntensity(360),
    "a faster pace must be a higher intensity or every method inverts",
  );
});

test("run: a faster athlete gets a faster threshold", () => {
  const rows = (offset: number) =>
    [
      [1.0, 360],
      [1.3, 340],
      [1.9, 320],
      [3.0, 300],
      [4.8, 285],
    ].map(([lactate, pace]) => ({ lactate, intensity: pace - offset }));

  const slower = analyzeTest(rows(0), null, "run");
  const faster = analyzeTest(rows(20), null, "run");
  assert.ok(slower.lt2 && faster.lt2);
  assert.ok(
    SPORTS.run.fromIntensity(faster.lt2.intensity) <
      SPORTS.run.fromIntensity(slower.lt2.intensity),
    "shifting every stage 20 s/km faster must move LT2 to a faster pace",
  );
});

test("measurements missing lactate or intensity are dropped, not zeroed", () => {
  const out = analyzeTest(
    [
      { lactate: 1.0, intensity: 360 },
      { lactate: null, intensity: 340 },
      { lactate: 1.9, intensity: null },
      { lactate: 3.0, intensity: 300 },
      { lactate: 4.8, intensity: 285 },
    ],
    null,
    "run",
  );
  assert.equal(out.usable, 3);
  assert.equal(out.points.length, 3);
});

test("fewer than 3 usable measurements: a message, not a crash", () => {
  const out = analyzeTest(
    [
      { lactate: 1.0, intensity: 360 },
      { lactate: 2.0, intensity: 340 },
    ],
    null,
    "run",
  );
  assert.deepEqual(out.results, []);
  assert.match(out.warnings[0], /at least 3 measurements/);
});

test("formatIntensity survives a NaN threshold", () => {
  assert.equal(formatIntensity("run", NaN), "—");
  assert.equal(formatIntensity("bike", NaN), "—");
  assert.equal(formatIntensity("bike", 245.6), "246");
  assert.equal(formatIntensity("run", 3600 / 342), "5:42");
});

test("KNOWN GAP: two stages at the same pace throw out of analyzeTest", () => {
  // Recording the same pace twice is a plausible coach entry, and the throw
  // reaches a React render with no boundary around it. Pinned so the day
  // someone fixes it, this test is what tells them where to look.
  // See BACKLOG.md — "duplicate intensity crashes the analysis view".
  assert.throws(
    () =>
      analyzeTest(
        [
          { lactate: 1.0, intensity: 360 },
          { lactate: 1.4, intensity: 340 },
          { lactate: 2.6, intensity: 340 },
          { lactate: 4.0, intensity: 320 },
        ],
        null,
        "run",
      ),
    LactateInputError,
  );
});
