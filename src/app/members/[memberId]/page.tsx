import { ChevronRight, LineChart } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TopBar } from "@/components/TopBar";
import {
  HistoryChart,
  type HistorySeries,
} from "@/components/lactate/HistoryChart";
import { getMemberHistory, type MemberHistory } from "@/lib/db/queries";
import { formatDate, formatLactate } from "@/lib/format";
import { SERIES_COLORS, SERIES_DASHES } from "@/lib/lactate/series";
import { SPORTS, toSport, type Sport } from "@/lib/lactate/sport";

export const dynamic = "force-dynamic";

export default async function MemberHistoryPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const history = await getMemberHistory(memberId);
  if (!history) notFound();

  const { member, participations } = history;

  // Run and bike intensities share no axis, so each sport gets its own chart.
  // Most athletes only ever have one.
  const sports = (["run", "bike"] as const).filter((s) =>
    participations.some((p) => toSport(p.test.sport) === s),
  );

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title={member.name}
        subtitle={`${participations.length} ${
          participations.length === 1 ? "test" : "tests"
        }`}
        backHref="/members"
      />

      <main className="flex-1 px-5 py-4 pb-10 md:px-8">
        {participations.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-muted text-foreground">
              <LineChart size={28} />
            </span>
            <h3 className="mt-5 font-display text-3xl">No tests yet</h3>
            <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-muted-foreground">
              {member.name}{" "}
              hasn&apos;t taken part in a lactate test yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {sports.map((sport) => (
              <SportHistory
                key={sport}
                sport={sport}
                participations={participations.filter(
                  (p) => toSport(p.test.sport) === sport,
                )}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function SportHistory({
  sport,
  participations,
}: {
  sport: Sport;
  participations: MemberHistory["participations"];
}) {
  // One pass per test, shared by the chart and the list below it, so the two
  // can never disagree about what counts as a usable point.
  const rows = participations.map((p, i) => {
    const points = p.measurements
      .filter((m) => m.lactate != null && m.intensity != null)
      .map((m) => ({
        intensity: SPORTS[sport].toIntensity(m.intensity as number),
        lactate: Number(m.lactate),
      }))
      // A zero pace divides to Infinity, and Postgres numeric legally holds
      // NaN. Either one poisons the min/max the whole chart is scaled from
      // and blanks every curve, not just its own — drop them here.
      .filter(
        (q) => Number.isFinite(q.intensity) && Number.isFinite(q.lactate),
      );

    return {
      test: p.test,
      testId: p.testId,
      color: SERIES_COLORS[i % SERIES_COLORS.length],
      dash: SERIES_DASHES[i % SERIES_DASHES.length],
      points,
      // A single point draws no line, so say so rather than leave the coach
      // hunting for a missing curve.
      charted: points.length >= 2,
      peak: points.length
        ? Math.max(...points.map((q) => q.lactate))
        : null,
    };
  });

  const series: HistorySeries[] = rows.map((r) => ({
    id: r.testId,
    label: formatDate(r.test.testDate),
    color: r.color,
    dash: r.dash,
    points: r.points,
  }));

  return (
    // Same cap as the chart card, so the list lines up under it.
    <section className="w-full max-w-xl">
      <div className="flex items-center gap-3 pb-3">
        <span className="eyebrow text-[11px] text-muted-foreground">
          {SPORTS[sport].label} history
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <HistoryChart series={series} sport={sport} />

      <ul className="mt-3 flex flex-col divide-y divide-border overflow-hidden rounded-[20px] border border-border bg-card">
        {rows.map((r) => (
          <li key={r.testId}>
            <Link
              href={`/lactate/${r.testId}`}
              className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60"
            >
              <span
                aria-hidden
                className="h-8 w-1 shrink-0 rounded-full"
                style={{
                  backgroundColor: r.charted ? r.color : "var(--border)",
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium leading-tight transition-colors group-hover:text-link-hover">
                  {r.test.title}
                </p>
                <p className="text-[13px] text-muted-foreground">
                  {formatDate(r.test.testDate)} ·{" "}
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
