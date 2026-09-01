import type { ReactNode } from "react";

import { formatLactate } from "@/lib/format";
import { formatIntensity, SPORTS, type Sport } from "@/lib/lactate/sport";

/**
 * Geometry and axis chrome shared by every lactate chart. HistoryChart,
 * AnalysisChart and LactateChart each plot something different — that stays
 * in the chart itself — but they read as one product when the frame, the
 * scales, the gridlines and the tick treatment are identical.
 */

export const CHART_W = 320;
export const CHART_H = 180;
const CHART_PAD_L = 28;
const CHART_PAD_R = 12;
export const CHART_PAD_TOP = 16;
export const CHART_PAD_BOTTOM = 30;
export const CHART_POINT_R = 3;
/** Threshold markers read heavier than the samples they sit among. */
export const CHART_MARKER_R = 3.5;

export function makeXScale(minX: number, maxX: number) {
  return (v: number) =>
    CHART_PAD_L +
    ((v - minX) / (maxX - minX || 1)) * (CHART_W - CHART_PAD_L - CHART_PAD_R);
}

export function makeYScale(maxY: number) {
  return (v: number) =>
    CHART_PAD_TOP +
    (1 - v / (maxY || 1)) * (CHART_H - CHART_PAD_TOP - CHART_PAD_BOTTOM);
}

/** Card + viewBox every lactate chart shares. */
export function ChartShell({
  ariaLabel,
  children,
}: {
  ariaLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="w-full max-w-xl rounded-lg border border-border bg-muted/40 p-2">
      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="h-auto w-full"
        role="img"
        aria-label={ariaLabel}
      >
        {children}
      </svg>
    </div>
  );
}

/**
 * Horizontal y-axis gridlines with the value labelled at the left. Judging
 * whether one curve sits above another with no y reference is the chart's
 * whole job.
 */
export function YGridlines({
  maxY,
  y,
}: {
  maxY: number;
  y: (v: number) => number;
}) {
  const ticks = [0, maxY / 2, maxY];
  return (
    <>
      {ticks.map((t, i) => (
        <g key={i}>
          <line
            x1={CHART_PAD_L}
            y1={y(t)}
            x2={CHART_W - CHART_PAD_R}
            y2={y(t)}
            stroke="var(--border)"
            strokeWidth="1"
          />
          <text
            x={CHART_PAD_L - 4}
            y={y(t) + 3}
            textAnchor="end"
            fontSize="9"
            fill="var(--muted-foreground)"
          >
            {formatLactate(t)}
          </text>
        </g>
      ))}
    </>
  );
}

/** X-axis ticks across an engine-intensity domain, labelled in the sport's own unit. */
export function XIntensityTicks({
  minX,
  maxX,
  x,
  sport,
}: {
  minX: number;
  maxX: number;
  x: (v: number) => number;
  sport: Sport;
}) {
  const ticks = [0, 0.5, 1].map((t) => minX + t * (maxX - minX));
  return (
    <>
      {ticks.map((t, i) => (
        <text
          key={i}
          x={x(t)}
          y={CHART_H - 8}
          textAnchor={
            i === 0 ? "start" : i === ticks.length - 1 ? "end" : "middle"
          }
          fontSize="9"
          fill="var(--muted-foreground)"
        >
          {formatIntensity(sport, t)}
          {i === ticks.length - 1 ? SPORTS[sport].unit : ""}
        </text>
      ))}
    </>
  );
}
