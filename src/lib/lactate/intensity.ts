/**
 * Running adapter: the app stores pace as seconds/km, which *decreases* as the
 * athlete speeds up. The engine requires an **ascending** intensity, so we
 * convert pace to speed (km/h) before analysis and convert resulting intensities
 * back to pace for display.
 */

import type { Stage } from "./types";

/** Pace (seconds per km) → speed (km/h). */
export function paceToSpeed(tempoSeconds: number): number {
  return 3600 / tempoSeconds;
}

/** Speed (km/h) → pace (seconds per km). */
export function speedToPace(speedKmh: number): number {
  return 3600 / speedKmh;
}

export interface RawMeasurement {
  lactate: number | null;
  tempoSeconds: number | null;
  heartRate?: number | null;
}

/**
 * Convert recorded running measurements into engine stages (speed-space).
 * Rows missing lactate or pace are dropped — they can't contribute to a curve.
 */
export function speedToIntensityStages(rows: RawMeasurement[]): Stage[] {
  return rows
    .filter((r) => r.lactate != null && r.tempoSeconds != null && r.tempoSeconds > 0)
    .map((r) => ({
      intensity: paceToSpeed(r.tempoSeconds as number),
      lactate: r.lactate as number,
      heartRate: r.heartRate ?? null,
    }));
}
