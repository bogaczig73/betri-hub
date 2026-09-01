import { LineChart } from "lucide-react";
import { notFound } from "next/navigation";

import { TopBar } from "@/components/TopBar";
import { getMemberHistory, type MemberHistory } from "@/lib/db/queries";
import { formatDate } from "@/lib/format";
import { SERIES_COLORS, SERIES_DASHES } from "@/lib/lactate/series";
import { SPORTS, toSport, type Sport } from "@/lib/lactate/sport";

import { SportHistory, type TestRow } from "./SportHistory";

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
                rows={buildRows(
                  sport,
                  participations.filter((p) => toSport(p.test.sport) === sport),
                )}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * One pass per test, feeding both the chart and the list, so the two can never
 * disagree about what counts as a usable point.
 */
function buildRows(
  sport: Sport,
  participations: MemberHistory["participations"],
): TestRow[] {
  return participations.map((p, i) => {
    const points = p.measurements
      .filter((m) => m.lactate != null && m.intensity != null)
      .map((m) => ({
        intensity: SPORTS[sport].toIntensity(m.intensity as number),
        lactate: Number(m.lactate),
      }))
      // A zero pace divides to Infinity, and Postgres numeric legally holds
      // NaN. Either one poisons the min/max the whole chart is scaled from and
      // blanks every curve, not just its own — drop them here.
      .filter((q) => Number.isFinite(q.intensity) && Number.isFinite(q.lactate));

    return {
      testId: p.testId,
      title: p.test.title,
      date: formatDate(p.test.testDate),
      color: SERIES_COLORS[i % SERIES_COLORS.length],
      dash: SERIES_DASHES[i % SERIES_DASHES.length],
      points,
      charted: points.length >= 2,
      peak: points.length ? Math.max(...points.map((q) => q.lactate)) : null,
    };
  });
}
