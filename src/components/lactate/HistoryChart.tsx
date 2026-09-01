import type { Sport } from "@/lib/lactate/sport";

import {
  CHART_H,
  CHART_POINT_R,
  CHART_W,
  ChartShell,
  XIntensityTicks,
  YGridlines,
  makeXScale,
  makeYScale,
} from "./chart-frame";

export interface HistorySeries {
  id: string;
  color: string;
  /** SVG dash pattern — series stay distinguishable without colour vision. */
  dash: string;
  /** Ascending engine intensity (speed for run, watts for bike). */
  points: { intensity: number; lactate: number }[];
}

/**
 * One athlete's lactate curves stacked on a single pair of axes — one line per
 * test, so a shift left/right over time is the whole point of the picture.
 * X is the engine's ascending intensity, labelled in the sport's own unit;
 * Y is lactate. Which curves arrive is the caller's decision — the test list
 * below the chart owns that — so the axes here simply fit whatever is passed.
 */
export function HistoryChart({
  series,
  sport,
}: {
  series: HistorySeries[];
  sport: Sport;
}) {
  const lines = series
    .filter((s) => s.points.length >= 2)
    .map((s) => ({
      ...s,
      points: [...s.points].sort((a, b) => a.intensity - b.intensity),
    }));

  const all = lines.flatMap((s) => s.points);
  const minX = all.length ? Math.min(...all.map((p) => p.intensity)) : 0;
  const maxX = all.length ? Math.max(...all.map((p) => p.intensity)) : 1;
  const maxY = all.length
    ? Math.max(...all.map((p) => p.lactate)) * 1.12 || 1
    : 1;

  const x = makeXScale(minX, maxX);
  const y = makeYScale(maxY);

  return (
    <ChartShell
      ariaLabel={
        all.length
          ? `Lactate curves across ${lines.length} ${
              lines.length === 1 ? "test" : "tests"
            }`
          : "All tests hidden"
      }
    >
      {all.length ? <YGridlines maxY={maxY} y={y} /> : null}

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
            strokeDasharray={s.dash || undefined}
            strokeLinejoin="round"
            // A round cap grows every dash by strokeWidth/2 at each end,
            // which would close the 4-unit gaps to 1.5 and make the patterns
            // read as solid.
            strokeLinecap={s.dash ? "butt" : "round"}
          />
          {s.points.map((p, i) => (
            <circle
              key={i}
              cx={x(p.intensity)}
              cy={y(p.lactate)}
              r={CHART_POINT_R}
              fill="var(--card)"
              stroke={s.color}
              strokeWidth="2"
            />
          ))}
        </g>
      ))}

      {all.length ? (
        <XIntensityTicks minX={minX} maxX={maxX} x={x} sport={sport} />
      ) : (
        <text
          x={CHART_W / 2}
          y={CHART_H / 2}
          textAnchor="middle"
          fontSize="10"
          fill="var(--muted-foreground)"
        >
          All tests hidden
        </text>
      )}
    </ChartShell>
  );
}
