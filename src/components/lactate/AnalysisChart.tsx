import type { Sport } from "@/lib/lactate/sport";

import {
  CHART_H,
  CHART_MARKER_R,
  CHART_PAD_BOTTOM,
  CHART_PAD_TOP,
  CHART_POINT_R,
  ChartShell,
  XIntensityTicks,
  YGridlines,
  makeXScale,
  makeYScale,
} from "./chart-frame";

export interface ChartPoint {
  intensity: number;
  lactate: number;
}

export interface ChartMarker {
  label: string;
  intensity: number;
  lactate: number;
  color: string;
}

/**
 * Lactate curve with threshold markers. X is the engine's ascending intensity
 * (speed for run, watts for bike), but tick labels are rendered in the sport's
 * own unit — so runners read pace. Renders nothing below two points.
 */
export function AnalysisChart({
  points,
  markers = [],
  sport,
}: {
  points: ChartPoint[];
  markers?: ChartMarker[];
  sport: Sport;
}) {
  const pts = [...points].sort((a, b) => a.intensity - b.intensity);
  if (pts.length < 2) return null;

  const xs = pts.map((p) => p.intensity);
  const markerXs = markers.map((m) => m.intensity).filter(Number.isFinite);
  const minX = Math.min(...xs, ...markerXs);
  const maxX = Math.max(...xs, ...markerXs);
  const maxY = Math.max(...pts.map((p) => p.lactate)) * 1.12 || 1;

  const x = makeXScale(minX, maxX);
  const y = makeYScale(maxY);

  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.intensity)} ${y(p.lactate)}`)
    .join(" ");
  const area = `${line} L ${x(pts[pts.length - 1].intensity)} ${
    CHART_H - CHART_PAD_BOTTOM
  } L ${x(pts[0].intensity)} ${CHART_H - CHART_PAD_BOTTOM} Z`;

  return (
    <ChartShell ariaLabel="Lactate curve with thresholds">
      <defs>
        <linearGradient id="anFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>

      <YGridlines maxY={maxY} y={y} />

      {/* threshold markers behind the curve */}
      {markers.map((m, i) =>
        Number.isFinite(m.intensity) ? (
          <g key={i}>
            <line
              x1={x(m.intensity)}
              y1={CHART_PAD_TOP}
              x2={x(m.intensity)}
              y2={CHART_H - CHART_PAD_BOTTOM}
              stroke={m.color}
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.9"
            />
            <text
              x={x(m.intensity)}
              y={CHART_PAD_TOP - 4}
              textAnchor="middle"
              fontSize="9"
              fontWeight="700"
              fill={m.color}
            >
              {m.label}
            </text>
          </g>
        ) : null,
      )}

      <path d={area} fill="url(#anFill)" />
      <path
        d={line}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {pts.map((p, i) => (
        <circle
          key={i}
          cx={x(p.intensity)}
          cy={y(p.lactate)}
          r={CHART_POINT_R}
          fill="var(--card)"
          stroke="var(--primary)"
          strokeWidth="2"
        />
      ))}

      {/* marker dots at the threshold lactate */}
      {markers.map((m, i) =>
        Number.isFinite(m.intensity) ? (
          <circle
            key={`d${i}`}
            cx={x(m.intensity)}
            cy={y(m.lactate)}
            r={CHART_MARKER_R}
            fill={m.color}
          />
        ) : null,
      )}

      <XIntensityTicks minX={minX} maxX={maxX} x={x} sport={sport} />
    </ChartShell>
  );
}
