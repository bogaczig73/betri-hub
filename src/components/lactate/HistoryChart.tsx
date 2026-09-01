import { formatLactate } from "@/lib/format";
import { formatIntensity, type Sport } from "@/lib/lactate/sport";

export interface HistorySeries {
  id: string;
  label: string;
  color: string;
  /** Ascending engine intensity (speed for run, watts for bike). */
  points: { intensity: number; lactate: number }[];
}

/**
 * One athlete's lactate curves stacked on a single pair of axes — one line per
 * test, so a shift left/right over time is the whole point of the picture.
 * X is the engine's ascending intensity, labelled in the sport's own unit;
 * Y is lactate. Renders nothing until some series has two usable points.
 */
export function HistoryChart({
  series,
  sport,
}: {
  series: HistorySeries[];
  sport: Sport;
}) {
  const lines = series
    .map((s) => ({
      ...s,
      points: [...s.points].sort((a, b) => a.intensity - b.intensity),
    }))
    .filter((s) => s.points.length >= 2);

  if (lines.length === 0) return null;

  const w = 320;
  const h = 200;
  const padL = 30;
  const padR = 12;
  const padTop = 12;
  const padBottom = 26;

  const all = lines.flatMap((s) => s.points);
  const minX = Math.min(...all.map((p) => p.intensity));
  const maxX = Math.max(...all.map((p) => p.intensity));
  const maxY = Math.max(...all.map((p) => p.lactate)) * 1.12 || 1;

  const x = (v: number) =>
    padL + ((v - minX) / (maxX - minX || 1)) * (w - padL - padR);
  const y = (v: number) => padTop + (1 - v / maxY) * (h - padTop - padBottom);

  const xTicks = [0, 0.5, 1].map((t) => minX + t * (maxX - minX));
  const yTicks = [0, maxY / 2, maxY];

  return (
    <div className="rounded-[20px] border border-border bg-card p-3">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Lactate curves across ${lines.length} ${
          lines.length === 1 ? "test" : "tests"
        }`}
      >
        {yTicks.map((t, i) => (
          <g key={`y${i}`}>
            <line
              x1={padL}
              y1={y(t)}
              x2={w - padR}
              y2={y(t)}
              stroke="var(--border)"
              strokeWidth="1"
            />
            <text
              x={padL - 4}
              y={y(t) + 3}
              textAnchor="end"
              fontSize="9"
              fill="var(--muted-foreground)"
            >
              {formatLactate(t)}
            </text>
          </g>
        ))}

        {lines.map((s) => (
          <g key={s.id}>
            <path
              d={s.points
                .map(
                  (p, i) =>
                    `${i === 0 ? "M" : "L"} ${x(p.intensity)} ${y(p.lactate)}`,
                )
                .join(" ")}
              fill="none"
              stroke={s.color}
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {s.points.map((p, i) => (
              <circle
                key={i}
                cx={x(p.intensity)}
                cy={y(p.lactate)}
                r="3"
                fill="var(--card)"
                stroke={s.color}
                strokeWidth="2"
              />
            ))}
          </g>
        ))}

        {xTicks.map((t, i) => (
          <text
            key={`x${i}`}
            x={x(t)}
            y={h - 8}
            textAnchor={
              i === 0 ? "start" : i === xTicks.length - 1 ? "end" : "middle"
            }
            fontSize="9"
            fill="var(--muted-foreground)"
          >
            {formatIntensity(sport, t)}
          </text>
        ))}
      </svg>

      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 px-1">
        {lines.map((s) => (
          <li key={s.id} className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="h-0.5 w-4 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="font-mono text-[11px] text-muted-foreground">
              {s.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Line colours, cycled newest-test-first. Drawn from the hub palette. */
export const SERIES_COLORS = [
  "#f13a2c", // primary red — newest test
  "#4c98b9",
  "#03904a",
  "#8b5cf6",
  "#e07b39",
  "#0f9b9b",
];
