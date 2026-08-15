/**
 * Validation harness — run with: `node src/lib/lactate/validate.ts`
 *
 * Asserts the engine reproduces the `lactater` package's documented demo
 * outputs (cycling, ascending power). Numbers in the docs are rounded, so we
 * allow a tolerance. This is the primary regression fixture (spec §7).
 */

import { analyze } from "./analyze";
import { analyzeTest } from "./display";
import { SPORTS } from "./sport";
import type { Stage } from "./types";

// The intensity-0 row is the rest/baseline point. With include_baseline=FALSE
// (lactater default) it supplies the baseline lactate for Bsln+ but is excluded
// from the fit and Dmax chord.
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

// method -> [expected intensity, expected lactate, expected HR]
const expected: Record<string, [number, number, number]> = {
  "Log-log": [83.4, 1.4, 140],
  "OBLA 2.0": [105, 2, 153],
  "OBLA 2.5": [118, 2.5, 160],
  "OBLA 3.0": [129, 3, 167],
  "OBLA 3.5": [137, 3.5, 171],
  "OBLA 4.0": [145, 4, 176],
  "Bsln + 0.5": [82.5, 1.43, 139],
  "Bsln + 1.0": [104, 1.93, 152],
  "Bsln + 1.5": [117, 2.43, 159],
  Dmax: [132, 3.1, 168],
  ModDmax: [140, 3.6, 173],
  "Exp-Dmax": [135, 3.3, 170],
  "Log-Poly-ModDmax": [143, 3.8, 175],
  "Log-Exp-ModDmax": [146, 4, 177],
  LTP1: [88.8, 1.5, 143],
  LTP2: [148, 4.1, 178],
  LTratio: [71.2, 1.2, 132],
};

// Intensity tolerance (W). The docs round hard, so allow a few watts.
const ITOL = 4;

const { results, warnings } = analyze(demo, {
  fit: "3rd degree polynomial",
  baselineLactate: baseline.lactate,
  baselineIntensity: baseline.intensity,
  includeBaseline: true,
});

const got = new Map(results.map((r) => [r.method, r]));
let pass = 0;
let fail = 0;
const pad = (s: string, n: number) => s.padEnd(n);

console.log(pad("method", 20), pad("got I", 9), pad("exp I", 9), "Δ", "  status");
console.log("-".repeat(60));
for (const [method, [ei, el, ehr]] of Object.entries(expected)) {
  const r = got.get(method);
  if (!r || Number.isNaN(r.intensity)) {
    console.log(pad(method, 20), pad("—", 9), pad(String(ei), 9), "", "  MISSING");
    fail++;
    continue;
  }
  const di = Math.abs(r.intensity - ei);
  const ok = di <= ITOL;
  console.log(
    pad(method, 20),
    pad(r.intensity.toFixed(1), 9),
    pad(String(ei), 9),
    di.toFixed(1).padStart(5),
    ok ? "  ok" : "  FAIL",
    `  (lac ${r.lactate.toFixed(2)} vs ${el}, hr ${r.heartRate?.toFixed(0) ?? "—"} vs ${ehr})`,
  );
  ok ? pass++ : fail++;
}
console.log("-".repeat(60));
console.log(`pass ${pass}  fail ${fail}  (tolerance ±${ITOL} W)`);
if (warnings.length) console.log("warnings:", warnings);

// ---------- edge cases ----------
console.log("\n== edge cases ==");

// Few stages: should still run but warn.
const few = analyze(
  [
    { intensity: 10, lactate: 1.0 },
    { intensity: 12, lactate: 1.4 },
    { intensity: 14, lactate: 2.6 },
  ],
);
console.log(
  `3 stages: ${few.results.length} results, warn="${few.warnings[0] ?? ""}"`,
);

// OBLA target out of range: a curve that never reaches 4.0 mmol/L.
const lowCurve = analyze([
  { intensity: 10, lactate: 0.8 },
  { intensity: 12, lactate: 1.0 },
  { intensity: 14, lactate: 1.3 },
  { intensity: 16, lactate: 1.7 },
  { intensity: 18, lactate: 2.1 },
]);
const obla4 = lowCurve.results.find((r) => r.method === "OBLA 4.0");
console.log(
  `OBLA 4.0 unreached: intensity=${obla4?.intensity}, warning="${obla4?.warnings[0] ?? ""}"`,
);

// Non-monotonic intensity: must throw.
try {
  analyze([
    { intensity: 10, lactate: 1 },
    { intensity: 10, lactate: 2 },
  ]);
  console.log("monotonic check: FAIL (did not throw)");
} catch (e) {
  console.log(`monotonic check: throws ok (${(e as Error).message.slice(0, 40)}…)`);
}

// Stage-2 dip: the Bsln+ floor must be the LOWEST reading, not the first one.
const dipped = analyze([
  { intensity: 12.0, lactate: 1.5 },
  { intensity: 12.9, lactate: 1.2 }, // dip as warm-up lactate clears
  { intensity: 13.8, lactate: 1.4 },
  { intensity: 15.0, lactate: 2.1 },
  { intensity: 16.4, lactate: 3.4 },
]);
const bsln05 = dipped.results.find((r) => r.method === "Bsln + 0.5");
console.log(`stage-2 dip: Bsln+0.5 targets ${bsln05?.lactate.toFixed(2)} mmol/L`);
if (Math.abs((bsln05?.lactate ?? 0) - 1.7) > 1e-9)
  throw new Error("Bsln+ must build on the lowest lactate (1.2), not the first (1.5)");

// ---------- sport adapters ----------
// The fixture above is cycling (watts), so running it through the bike adapter
// exercises the whole UI path against the same reference numbers.
console.log("\n== sport adapters ==");

const bike = analyzeTest(
  demo.map((s) => ({
    lactate: s.lactate,
    intensity: s.intensity,
    heartRate: s.heartRate,
  })),
  {
    baselineLactate: baseline.lactate,
    baselineIntensity: baseline.intensity,
    includeBaseline: true,
  },
  "bike",
);
// baselineIntensity is 0 here, so it can't be fed into the fit (see analyzeTest)
// — compare against the baseline-EXCLUDED engine run instead.
const bikeRef = new Map(
  analyze(demo, {
    fit: "3rd degree polynomial",
    baselineLactate: baseline.lactate,
  }).results.map((r) => [r.method, r.intensity]),
);
const bikeDrift = Math.max(
  ...bike.results.map((r) =>
    Math.abs(r.intensity - (bikeRef.get(r.method) ?? r.intensity)),
  ),
);
console.log(
  `bike path: ${bike.results.length} results, usable=${bike.usable}, max drift vs engine ${bikeDrift.toFixed(3)} W`,
);
if (bikeDrift > 1e-9) throw new Error("bike adapter must not alter intensities");

// Run: pace is descending, so it must survive the round-trip through speed.
const run = SPORTS.run;
for (const pace of [180, 342, 425, 700]) {
  const back = run.fromIntensity(run.toIntensity(pace));
  if (back !== pace) throw new Error(`pace round-trip ${pace} → ${back}`);
}
// A faster pace must map to a HIGHER intensity, or every method inverts.
if (run.toIntensity(300) <= run.toIntensity(360))
  throw new Error("run intensity must ascend as pace drops");
console.log("run path: pace round-trips and ascends with speed — ok");
