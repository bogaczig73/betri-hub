/**
 * Sport adapter. The engine works in a single **ascending** intensity space;
 * each sport says how its stored value maps into that space and back out for
 * display, plus how the coach types it on a phone.
 *
 * Stored value (one integer column per measurement):
 *   run  — pace, seconds per km. Descends as effort rises, so it converts to
 *          speed (km/h) for the engine and back to pace for display.
 *   bike — power, watts. Already ascending, used as-is.
 */

import { digitsToTempo, formatTempo, tempoToDigits } from "@/lib/format";

export type Sport = "run" | "bike";

export interface SportSpec {
  label: string;
  /** Unit suffix shown next to a value. */
  unit: string;
  /** Stored value → engine intensity (ascending). */
  toIntensity: (value: number) => number;
  /** Engine intensity → stored value. */
  fromIntensity: (intensity: number) => number;
  format: (value: number | null | undefined) => string;
  /** Fast keypad entry: raw digits ⇄ stored value. */
  fromDigits: (digits: string) => number | null;
  toDigits: (value: number | null | undefined) => string;
  /** Measurement-sheet / manual-entry field config. */
  field: {
    label: string;
    hint: string;
    maxDigits: number;
    placeholder: string;
    dial: { min: number; max: number; step: number; default: number };
  };
}

export const SPORTS: Record<Sport, SportSpec> = {
  run: {
    label: "Run",
    unit: "/km",
    toIntensity: (v) => 3600 / v,
    fromIntensity: (x) => Math.round(3600 / x),
    format: formatTempo,
    fromDigits: digitsToTempo,
    toDigits: tempoToDigits,
    field: {
      label: "Pace",
      hint: "Type 542 → 5:42",
      maxDigits: 4,
      placeholder: "5:42",
      dial: { min: 120, max: 720, step: 1, default: 300 },
    },
  },
  bike: {
    label: "Bike",
    unit: "W",
    toIntensity: (v) => v,
    fromIntensity: (x) => Math.round(x),
    format: (v) => (v == null ? "—" : String(Math.round(v))),
    fromDigits: (d) => (d ? parseInt(d, 10) : null),
    toDigits: (v) => (v == null ? "" : String(Math.round(v))),
    field: {
      label: "Power",
      hint: "Watts",
      maxDigits: 4,
      placeholder: "250",
      dial: { min: 50, max: 600, step: 5, default: 200 },
    },
  },
};

export function toSport(value: unknown): Sport {
  return value === "bike" ? "bike" : "run";
}

/** Convenience for the common "intensity → readable string" pair. */
export function formatIntensity(sport: Sport, intensity: number): string {
  const s = SPORTS[sport];
  return Number.isFinite(intensity)
    ? s.format(s.fromIntensity(intensity))
    : "—";
}
