/**
 * Pure, client-safe formatting helpers for the lactate app.
 *
 * Two "no-separator" input conventions the coach can type fast on a phone:
 *  - Lactate (mmol/L): digits map to a 2-decimal value. "124" -> 1.24, "85" -> 0.85.
 *  - Tempo / run pace (m:ss per km): last two digits are seconds. "542" -> 5:42.
 */

// ---------- Lactate (mmol/L) ----------

export function digitsToLactate(digits: string): number | null {
  const clean = digits.replace(/\D/g, "");
  if (!clean) return null;
  return parseInt(clean, 10) / 100;
}

export function lactateToDigits(value: number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return Math.round(value * 100).toString();
}

export function formatLactate(
  value: number | string | null | undefined,
): string {
  if (value === null || value === undefined || value === "") return "—";
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(n)) return "—";
  return n.toFixed(2);
}

// ---------- Tempo / run pace (seconds per km) ----------

export function digitsToTempo(digits: string): number | null {
  const clean = digits.replace(/\D/g, "");
  if (!clean) return null;
  const secPart = clean.slice(-2);
  const minPart = clean.slice(0, -2);
  const minutes = minPart ? parseInt(minPart, 10) : 0;
  const seconds = parseInt(secPart, 10);
  return minutes * 60 + seconds;
}

export function tempoToDigits(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}${s.toString().padStart(2, "0")}`;
}

export function formatTempo(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ---------- Misc ----------

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
