import { formatLactate } from "@/lib/format";
import { SPORTS, type Sport } from "@/lib/lactate/sport";

import {
  CHART_H,
  CHART_PAD_BOTTOM,
  CHART_POINT_R,
  ChartShell,
  YGridlines,
  makeXScale,
  makeYScale,
} from "./lactate/chart-frame";

interface Point {
  stage: number;
  lactate: number | null;
  intensity: number | null;
}

/**
 * Compact lactate curve: lactate (y) over successive stages (x) — x is stage
 * index, not intensity, so a coach reads it against the stage list below.
 * Points are labelled with pace/power when available. Renders nothing for
 * < 2 lactate readings.
 */
export function LactateChart({
  measurements,
  sport,
}: {
  measurements: Point[];
  sport: Sport;
}) {
  const pts = measurements
    .filter((m) => m.lactate != null)
    .map((m) => ({
      stage: m.stage,
      lactate: m.lactate as number,
      intensity: m.intensity,
    }));

  if (pts.length < 2) return null;

  const lactates = pts.map((p) => p.lactate);
  // 1.25, not the 1.12 the other charts use: this is the only chart that
  // prints a value above each point, and at 1.1 the top gridline landed inside
  // the topmost label's glyphs and struck through it on every render.
  const maxY = Math.max(...lactates) * 1.25 || 1;

  const x = makeXScale(0, pts.length - 1);
  const y = makeYScale(maxY);

  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.lactate)}`)
    .join(" ");
  const area = `${line} L ${x(pts.length - 1)} ${
    CHART_H - CHART_PAD_BOTTOM
  } L ${x(0)} ${CHART_H - CHART_PAD_BOTTOM} Z`;

  return (
    <ChartShell ariaLabel="Lactate curve">
      <defs>
        <linearGradient id="lacFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>

      <YGridlines maxY={maxY} y={y} />

      <path d={area} fill="url(#lacFill)" />
      <path
        d={line}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {pts.map((p, i) => (
        <g key={i}>
          <circle
            cx={x(i)}
            cy={y(p.lactate)}
            r={CHART_POINT_R}
            fill="var(--card)"
            stroke="var(--primary)"
            strokeWidth="2"
          />
          <text
            x={x(i)}
            y={y(p.lactate) - 7}
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill="var(--foreground)"
          >
            {formatLactate(p.lactate)}
          </text>
          <text
            x={x(i)}
            y={CHART_H - 7}
            textAnchor="middle"
            fontSize="9"
            fill="var(--muted-foreground)"
          >
            {p.intensity != null ? SPORTS[sport].format(p.intensity) : i + 1}
          </text>
        </g>
      ))}
    </ChartShell>
  );
}
