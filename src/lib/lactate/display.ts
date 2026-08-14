/**
 * Presentation adapter: feed recorded measurements into the ascending-intensity
 * engine and hand results back in that same space, ready for a sport formatter
 * (see `sport.ts`). Pure and client-safe.
 */

import { analyze } from "./analyze";
import { SPORTS, type Sport } from "./sport";
import type { AnalyzeOptions, Result } from "./types";

export interface Measurement {
  lactate: number | null;
  /** Stored sport value: seconds/km for run, watts for bike. */
  intensity: number | null;
  heartRate?: number | null;
}

export interface Baseline {
  baselineLactate: number | null;
  baselineIntensity: number | null;
  includeBaseline: boolean;
}

/** A curve point or threshold, in the engine's ascending space. */
export interface Point {
  /** km/h for run, watts for bike. */
  intensity: number;
  lactate: number;
  heartRate: number | null;
}

export interface Analysis {
  results: Result[];
  lt1: Point | null;
  lt2: Point | null;
  points: Point[];
  warnings: string[];
  /** Number of usable (lactate + intensity) measurements. */
  usable: number;
}

function median(nums: number[]): number {
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function summarise(results: Result[]): Point | null {
  const valid = results.filter((r) => Number.isFinite(r.intensity));
  if (valid.length === 0) return null;
  const hrs = valid.map((r) => r.heartRate).filter((h): h is number => h != null);
  return {
    intensity: median(valid.map((r) => r.intensity)),
    lactate: median(valid.map((r) => r.lactate)),
    heartRate: hrs.length ? Math.round(median(hrs)) : null,
  };
}

export function analyzeTest(
  measurements: Measurement[],
  baseline: Baseline | null,
  sport: Sport,
  options: Pick<AnalyzeOptions, "fit" | "loglogRestrainer"> = {},
): Analysis {
  const { toIntensity, field } = SPORTS[sport];
  const rows = measurements.filter(
    (m) => m.lactate != null && m.intensity != null && m.intensity > 0,
  );
  const points: Point[] = rows
    .map((m) => ({
      intensity: toIntensity(m.intensity as number),
      lactate: m.lactate as number,
      heartRate: m.heartRate ?? null,
    }))
    .sort((a, b) => a.intensity - b.intensity);

  const out: Analysis = {
    results: [],
    lt1: null,
    lt2: null,
    points,
    warnings: [],
    usable: rows.length,
  };
  if (points.length < 3) {
    out.warnings.push(
      `Need at least 3 measurements with lactate and ${field.label.toLowerCase()}.`,
    );
    return out;
  }

  const baseIncluded =
    baseline?.includeBaseline &&
    baseline.baselineLactate != null &&
    baseline.baselineIntensity != null &&
    baseline.baselineIntensity > 0;

  const { results, warnings } = analyze(points, {
    fit: options.fit,
    loglogRestrainer: options.loglogRestrainer,
    baselineLactate: baseline?.baselineLactate ?? undefined,
    baselineIntensity: baseIncluded
      ? toIntensity(baseline!.baselineIntensity as number)
      : undefined,
    includeBaseline: Boolean(baseIncluded),
  });

  out.results = results;
  out.warnings = warnings;
  out.lt1 = summarise(results.filter((r) => r.estimates === "LT1"));
  out.lt2 = summarise(results.filter((r) => r.estimates === "LT2"));
  return out;
}
