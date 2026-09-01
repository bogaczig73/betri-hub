import { formatLactate } from "@/lib/format";
import { SPORTS, formatIntensity, type Sport } from "@/lib/lactate/sport";

export interface HistorySeries {
  id: string;
  color: string;
  /** SVG dash pattern — series stay distinguishable without colour vision. */
  dash: string;
  /** Ascending engine intensity (speed for run, watts for bike). */
  points: { intensity: number; lactate: number }[];
}

// ponytail: three charts now duplicate this geometry — AnalysisChart,
// LactateChart and this one. Deliberate: folding them into one
// <Chart series=[]> is a bigger diff into working code than any of them is
// worth today. Fold when one of the three next needs a real change.
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

  const w = 320;
  const h = 180;
  const padL = 28;
  const padR = 12;
  const padTop = 16;
  const padBottom = 30;

  const all = lines.flatMap((s) => s.points);
  const minX = all.length ? Math.min(...all.map((p) => p.intensity)) : 0;
  const maxX = all.length ? Math.max(...all.map((p) => p.intensity)) : 1;
  const maxY = all.length
    ? Math.max(...all.map((p) => p.lactate)) * 1.12 || 1
    : 1;

  const x = (v: number) =>
    padL + ((v - minX) / (maxX - minX || 1)) * (w - padL - padR);
  const y = (v: number) => padTop + (1 - v / maxY) * (h - padTop - padBottom);

  const xTicks = [0, 0.5, 1].map((t) => minX + t * (maxX - minX));

  return (
    <div className="w-full max-w-xl rounded-lg border border-border bg-muted/40 p-2">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-auto w-full"
        role="img"
        aria-label={
          all.length
            ? `Lactate curves across ${lines.length} ${
                lines.length === 1 ? "test" : "tests"
              }`
            : "All tests hidden"
        }
      >
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
                r="3"
                fill="var(--card)"
                stroke={s.color}
                strokeWidth="2"
              />
            ))}
          </g>
        ))}

        {/* x-axis labels, in the sport's unit */}
        {all.length
          ? xTicks.map((t, i) => (
              <text
                key={i}
                x={x(t)}
                y={h - 8}
                textAnchor={
                  i === 0 ? "start" : i === xTicks.length - 1 ? "end" : "middle"
                }
                fontSize="9"
                fill="var(--muted-foreground)"
              >
                {formatIntensity(sport, t)}
                {i === xTicks.length - 1 ? SPORTS[sport].unit : ""}
              </text>
            ))
          : null}

        {/* y-axis: max lactate label */}
        {all.length ? (
          <text
            x={4}
            y={y(maxY) + 8}
            fontSize="9"
            fill="var(--muted-foreground)"
          >
            {formatLactate(maxY)}
          </text>
        ) : (
          <text
            x={w / 2}
            y={h / 2}
            textAnchor="middle"
            fontSize="10"
            fill="var(--muted-foreground)"
          >
            All tests hidden
          </text>
        )}
      </svg>
    </div>
  );
}
