import { formatLactate, formatTempo } from "@/lib/format";

export interface ChartPoint {
  speedKmh: number;
  paceSeconds: number;
  lactate: number;
}

export interface ChartMarker {
  label: string;
  speedKmh: number;
  lactate: number;
  color: string;
}

/**
 * Lactate curve with threshold markers. X is speed (ascending = faster), but
 * labelled with pace so it reads naturally for runners. Renders nothing below
 * two points.
 */
export function AnalysisChart({
  points,
  markers = [],
}: {
  points: ChartPoint[];
  markers?: ChartMarker[];
}) {
  const pts = [...points].sort((a, b) => a.speedKmh - b.speedKmh);
  if (pts.length < 2) return null;

  const w = 320;
  const h = 180;
  const padL = 28;
  const padR = 12;
  const padTop = 16;
  const padBottom = 30;

  const speeds = pts.map((p) => p.speedKmh);
  const markerSpeeds = markers.map((m) => m.speedKmh).filter(Number.isFinite);
  const minX = Math.min(...speeds, ...markerSpeeds);
  const maxX = Math.max(...speeds, ...markerSpeeds);
  const maxY = Math.max(...pts.map((p) => p.lactate)) * 1.12 || 1;

  const x = (s: number) =>
    padL + ((s - minX) / (maxX - minX || 1)) * (w - padL - padR);
  const y = (v: number) =>
    padTop + (1 - v / maxY) * (h - padTop - padBottom);

  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.speedKmh)} ${y(p.lactate)}`)
    .join(" ");
  const area = `${line} L ${x(pts[pts.length - 1].speedKmh)} ${
    h - padBottom
  } L ${x(pts[0].speedKmh)} ${h - padBottom} Z`;

  // A few pace ticks along the x-axis.
  const ticks = [0, 0.5, 1].map((t) => {
    const s = minX + t * (maxX - minX);
    return { s, pace: Math.round(3600 / s) };
  });

  return (
    <div className="rounded-none border border-border bg-muted/40 p-2">
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
          Number.isFinite(m.speedKmh) ? (
            <g key={i}>
              <line
                x1={x(m.speedKmh)}
                y1={padTop}
                x2={x(m.speedKmh)}
                y2={h - padBottom}
                stroke={m.color}
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.9"
              />
              <text
                x={x(m.speedKmh)}
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
            cx={x(p.speedKmh)}
            cy={y(p.lactate)}
            r="3"
            fill="var(--card)"
            stroke="var(--primary)"
            strokeWidth="2"
          />
        ))}

        {/* marker dots at the threshold lactate */}
        {markers.map((m, i) =>
          Number.isFinite(m.speedKmh) ? (
            <circle
              key={`d${i}`}
              cx={x(m.speedKmh)}
              cy={y(m.lactate)}
              r="3.5"
              fill={m.color}
            />
          ) : null,
        )}

        {/* x-axis pace labels */}
        {ticks.map((t, i) => (
          <text
            key={i}
            x={x(t.s)}
            y={h - 8}
            textAnchor={i === 0 ? "start" : i === ticks.length - 1 ? "end" : "middle"}
            fontSize="9"
            fill="var(--muted-foreground)"
          >
            {formatTempo(t.pace)}
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
