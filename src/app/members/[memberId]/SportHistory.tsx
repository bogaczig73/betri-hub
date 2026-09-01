"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { HistoryChart } from "@/components/lactate/HistoryChart";
import { formatLactate } from "@/lib/format";
import { SPORTS, type Sport } from "@/lib/lactate/sport";

export interface TestRow {
  testId: string;
  title: string;
  date: string;
  color: string;
  dash: string;
  points: { intensity: number; lactate: number }[];
  /** Two usable points minimum — anything less draws no line. */
  charted: boolean;
  peak: number | null;
}

/**
 * One sport's history: the overlaid chart, and the list of tests that feed it.
 * The list doubles as the chart's legend and its controls — one checkbox per
 * test decides whether that curve is drawn, and the axes rescale to whatever
 * stays ticked.
 */
export function SportHistory({
  sport,
  rows,
}: {
  sport: Sport;
  rows: TestRow[];
}) {
  const [hidden, setHidden] = useState<Record<string, boolean>>({});

  const series = rows
    .filter((r) => r.charted && !hidden[r.testId])
    .map((r) => ({
      id: r.testId,
      color: r.color,
      dash: r.dash,
      points: r.points,
    }));

  return (
    <section className="w-full max-w-xl">
      <div className="flex items-center gap-3 pb-3">
        <span className="eyebrow text-[11px] text-muted-foreground">
          {SPORTS[sport].label} history
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      {rows.some((r) => r.charted) ? (
        <HistoryChart series={series} sport={sport} />
      ) : null}

      <ul className="mt-3 flex flex-col divide-y divide-border overflow-hidden rounded-[20px] border border-border bg-card">
        {rows.map((r) => (
          <li key={r.testId} className="flex items-center">
            {r.charted ? (
              <label className="flex shrink-0 cursor-pointer items-center gap-2 py-3 pl-4 pr-3">
                <input
                  type="checkbox"
                  checked={!hidden[r.testId]}
                  onChange={() =>
                    setHidden((prev) => ({
                      ...prev,
                      [r.testId]: !prev[r.testId],
                    }))
                  }
                  // accent-color paints the native check in the series colour.
                  style={{ accentColor: r.color }}
                  className="h-[18px] w-[18px]"
                  aria-label={`Show ${r.title} (${r.date}) in the chart`}
                />
                {/* The dash pattern, not just the colour — it is what tells two
                    curves apart without colour vision, and unlike the tinted
                    checkbox it stays visible while the row is unticked. */}
                <svg aria-hidden width="18" height="4" viewBox="0 0 18 4">
                  <line
                    x1="0"
                    y1="2"
                    x2="18"
                    y2="2"
                    stroke={r.color}
                    strokeWidth="2.5"
                    strokeDasharray={r.dash || undefined}
                    strokeLinecap={r.dash ? "butt" : "round"}
                  />
                </svg>
              </label>
            ) : (
              // No curve to toggle — keep the row aligned with the others.
              <span className="flex shrink-0 items-center gap-2 py-3 pl-4 pr-3" aria-hidden>
                <span className="block h-[18px] w-[18px]" />
                <span className="block h-[4px] w-[18px]" />
              </span>
            )}

            <Link
              href={`/lactate/${r.testId}`}
              className="group flex min-w-0 flex-1 items-center gap-3 py-3 pl-2 pr-4 transition-colors hover:bg-muted/60"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium leading-tight transition-colors group-hover:text-link-hover">
                  {r.title}
                </p>
                <p className="text-[13px] text-muted-foreground">
                  {r.date} ·{" "}
                  {r.charted
                    ? `${r.points.length} points · peak ${formatLactate(r.peak)}`
                    : "no curve"}
                </p>
              </div>
              <ChevronRight
                size={18}
                className="shrink-0 text-muted-foreground"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
