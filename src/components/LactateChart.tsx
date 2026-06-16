import { formatLactate, formatTempo } from "@/lib/format";

interface Point {
  stage: number;
  lactate: number | null;
  tempoSeconds: number | null;
}

/**
 * Compact lactate curve: lactate (y) over successive stages (x). Points are
 * labelled with pace when available. Renders nothing for < 2 lactate readings.
 */
export function LactateChart({ measurements }: { measurements: Point[] }) {
  const pts = measurements
    .filter((m) => m.lactate != null)
    .map((m) => ({
      stage: m.stage,
      lactate: m.lactate as number,
      tempoSeconds: m.tempoSeconds,
    }));

  if (pts.length < 2) return null;

  const w = 300;
  const h = 120;
  const padX = 14;
  const padTop = 16;
  const padBottom = 22;

  const lactates = pts.map((p) => p.lactate);
  const minY = Math.min(...lactates, 0);
  const maxY = Math.max(...lactates) * 1.1 || 1;

  const x = (i: number) =>
    pts.length === 1
      ? w / 2
      : padX + (i / (pts.length - 1)) * (w - padX * 2);
  const y = (v: number) =>
    padTop + (1 - (v - minY) / (maxY - minY || 1)) * (h - padTop - padBottom);

  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.lactate)}`)
    .join(" ");
  const area = `${line} L ${x(pts.length - 1)} ${h - padBottom} L ${x(0)} ${
    h - padBottom
  } Z`;

  return (
    <div className="rounded-2xl bg-muted/60 p-2">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-auto w-full"
        role="img"
        aria-label="Lactate curve"
      >
        <defs>
          <linearGradient id="lacFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
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
              r="3.5"
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
              y={h - 7}
              textAnchor="middle"
              fontSize="9"
              fill="var(--muted-foreground)"
            >
              {p.tempoSeconds != null ? formatTempo(p.tempoSeconds) : i + 1}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
