import { formatLactate } from "@/lib/format";
import { formatIntensity, type Sport } from "@/lib/lactate/sport";

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

  const w = 320;
  const h = 180;
  const padL = 28;
  const padR = 12;
  const padTop = 16;
  const padBottom = 30;

  const xs = pts.map((p) => p.intensity);
  const markerXs = markers.map((m) => m.intensity).filter(Number.isFinite);
  const minX = Math.min(...xs, ...markerXs);
  const maxX = Math.max(...xs, ...markerXs);
  const maxY = Math.max(...pts.map((p) => p.lactate)) * 1.12 || 1;

  const x = (s: number) =>
    padL + ((s - minX) / (maxX - minX || 1)) * (w - padL - padR);
  const y = (v: number) =>
    padTop + (1 - v / maxY) * (h - padTop - padBottom);

  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.intensity)} ${y(p.lactate)}`)
    .join(" ");
  const area = `${line} L ${x(pts[pts.length - 1].intensity)} ${
    h - padBottom
  } L ${x(pts[0].intensity)} ${h - padBottom} Z`;

  // A few ticks along the x-axis, labelled in the sport's unit.
  const ticks = [0, 0.5, 1].map((t) => minX + t * (maxX - minX));

  return (
    <div className="rounded-lg border border-border bg-muted/40 p-2">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-auto w-full"
        role="img"
        aria-label="Lactate curve with thresholds"
      >
        <defs>
          <linearGradient id="anFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* threshold markers behind the curve */}
        {markers.map((m, i) =>
          Number.isFinite(m.intensity) ? (
            <g key={i}>
              <line
                x1={x(m.intensity)}
                y1={padTop}
                x2={x(m.intensity)}
                y2={h - padBottom}
                stroke={m.color}
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.9"
              />
              <text
                x={x(m.intensity)}
                y={padTop - 4}
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
            r="3"
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
              r="3.5"
              fill={m.color}
            />
          ) : null,
        )}

        {/* x-axis labels, in the sport's unit */}
        {ticks.map((t, i) => (
          <text
            key={i}
            x={x(t)}
            y={h - 8}
            textAnchor={i === 0 ? "start" : i === ticks.length - 1 ? "end" : "middle"}
            fontSize="9"
            fill="var(--muted-foreground)"
          >
            {formatIntensity(sport, t)}
          </text>
        ))}

        {/* y-axis: max lactate label */}
        <text x={4} y={y(maxY) + 8} fontSize="9" fill="var(--muted-foreground)">
          {formatLactate(maxY)}
        </text>
      </svg>
    </div>
  );
}
