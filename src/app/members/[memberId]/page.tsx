import { ChevronRight, LineChart } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TopBar } from "@/components/TopBar";
import {
  HistoryChart,
  SERIES_COLORS,
  type HistorySeries,
} from "@/components/lactate/HistoryChart";
import { getMemberHistory, type MemberHistory } from "@/lib/db/queries";
import { formatDate, formatLactate } from "@/lib/format";
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
  const series: HistorySeries[] = participations.map((p, i) => ({
    id: p.id,
    label: formatDate(p.test.testDate),
    color: SERIES_COLORS[i % SERIES_COLORS.length],
    points: p.measurements
      .filter((m) => m.lactate != null && m.intensity != null)
      .map((m) => ({
        intensity: SPORTS[sport].toIntensity(m.intensity as number),
        lactate: Number(m.lactate),
      })),
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
        {participations.map((p, i) => {
          const usable = p.measurements.filter(
            (m) => m.lactate != null && m.intensity != null,
          );
          const peak = usable.length
            ? Math.max(...usable.map((m) => Number(m.lactate)))
            : null;
          // A single point draws no line, so say so rather than leave the
          // coach hunting for a missing curve.
          const charted = usable.length >= 2;
          return (
            <li key={p.id}>
              <Link
                href={`/lactate/${p.testId}`}
                className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60"
              >
                <span
                  aria-hidden
                  className="h-8 w-1 shrink-0 rounded-full"
                  style={{
                    backgroundColor: charted
                      ? SERIES_COLORS[i % SERIES_COLORS.length]
                      : "var(--border)",
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium leading-tight transition-colors group-hover:text-link-hover">
                    {p.test.title}
                  </p>
                  <p className="text-[13px] text-muted-foreground">
                    {formatDate(p.test.testDate)} ·{" "}
                    {charted
                      ? `${usable.length} points · peak ${formatLactate(peak)}`
                      : "no curve"}
                  </p>
                </div>
                <ChevronRight
                  size={18}
                  className="shrink-0 text-muted-foreground"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
