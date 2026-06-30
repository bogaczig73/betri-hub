/**
 * Presentation adapter for running data: feed recorded measurements (pace) into
 * the speed-space engine, then translate every result's intensity back to pace.
 * Pure and client-safe.
 */

import { analyze } from "./analyze";
import { paceToSpeed, speedToPace } from "./intensity";
import type { AnalyzeOptions, Result } from "./types";

export interface RunMeasurement {
  lactate: number | null;
  tempoSeconds: number | null;
  heartRate?: number | null;
}

export interface RunBaseline {
  baselineLactate: number | null;
  baselineTempoSeconds: number | null;
  includeBaseline: boolean;
}

export interface RunResult extends Result {
  /** Pace in seconds/km (null when the threshold was not reached). */
  paceSeconds: number | null;
  /** Speed in km/h (the engine's native intensity). */
  speedKmh: number;
}

export interface Consensus {
  paceSeconds: number;
  speedKmh: number;
  lactate: number;
  heartRate: number | null;
}

export interface CurvePoint {
  speedKmh: number;
  paceSeconds: number;
  lactate: number;
  heartRate: number | null;
}

export interface RunAnalysis {
  results: RunResult[];
  lt1: Consensus | null;
  lt2: Consensus | null;
  points: CurvePoint[];
  warnings: string[];
  /** Number of usable (lactate + pace) measurements. */
  usable: number;
}

function median(nums: number[]): number {
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function summarise(results: RunResult[]): Consensus | null {
  const valid = results.filter(
    (r) => r.paceSeconds != null && Number.isFinite(r.speedKmh),
  );
  if (valid.length === 0) return null;
  const speed = median(valid.map((r) => r.speedKmh));
  const hrs = valid.map((r) => r.heartRate).filter((h): h is number => h != null);
  return {
    speedKmh: speed,
    paceSeconds: Math.round(speedToPace(speed)),
    lactate: median(valid.map((r) => r.lactate)),
    heartRate: hrs.length ? Math.round(median(hrs)) : null,
  };
}

export function analyzeRunning(
  measurements: RunMeasurement[],
  baseline: RunBaseline | null,
  options: Pick<AnalyzeOptions, "fit" | "loglogRestrainer"> = {},
): RunAnalysis {
  const rows = measurements.filter(
    (m) => m.lactate != null && m.tempoSeconds != null && m.tempoSeconds > 0,
  );
  const points: CurvePoint[] = rows
    .map((m) => ({
      speedKmh: paceToSpeed(m.tempoSeconds as number),
      paceSeconds: m.tempoSeconds as number,
      lactate: m.lactate as number,
      heartRate: m.heartRate ?? null,
    }))
    .sort((a, b) => a.speedKmh - b.speedKmh);

  const out: RunAnalysis = {
    results: [],
    lt1: null,
    lt2: null,
    points,
    warnings: [],
    usable: rows.length,
  };
  if (points.length < 3) {
    out.warnings.push("Need at least 3 measurements with lactate and pace.");
    return out;
  }

  const baseIncluded =
    baseline?.includeBaseline &&
    baseline.baselineLactate != null &&
    baseline.baselineTempoSeconds != null &&
    baseline.baselineTempoSeconds > 0;

  const { results, warnings } = analyze(
    points.map((p) => ({
      intensity: p.speedKmh,
      lactate: p.lactate,
      heartRate: p.heartRate,
    })),
    {
      fit: options.fit,
      loglogRestrainer: options.loglogRestrainer,
      baselineLactate: baseline?.baselineLactate ?? undefined,
      baselineIntensity: baseIncluded
        ? paceToSpeed(baseline!.baselineTempoSeconds as number)
        : undefined,
      includeBaseline: Boolean(baseIncluded),
    },
  );

  out.results = results.map((r) => ({
    ...r,
    speedKmh: r.intensity,
    paceSeconds: Number.isFinite(r.intensity)
      ? Math.round(speedToPace(r.intensity))
      : null,
  }));
  out.warnings = warnings;
  out.lt1 = summarise(out.results.filter((r) => r.estimates === "LT1"));
  out.lt2 = summarise(out.results.filter((r) => r.estimates === "LT2"));
  return out;
}
