import { StickyNote } from "lucide-react";
import { notFound } from "next/navigation";

import { TopBar } from "@/components/TopBar";
import { getTestDetail, listMembers } from "@/lib/db/queries";
import { formatDate } from "@/lib/format";

import { DeleteTest } from "./DeleteTest";
import { type ParticipantVM } from "./ParticipantCard";
import { ParticipantsSection } from "./ParticipantsSection";

export const dynamic = "force-dynamic";

export default async function TestDetailPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = await params;
  const [test, allMembers] = await Promise.all([
    getTestDetail(testId),
    listMembers(),
  ]);
  if (!test) notFound();

  const participants: ParticipantVM[] = test.participants.map((p) => ({
    id: p.id,
    memberId: p.memberId,
    name: p.member.name,
    baselineLactate: p.baselineLactate != null ? Number(p.baselineLactate) : null,
    baselineTempoSeconds: p.baselineTempoSeconds,
    includeBaseline: p.includeBaseline,
    measurements: [...p.measurements]
      .sort((a, b) => a.stage - b.stage)
      .map((m) => ({
        id: m.id,
        stage: m.stage,
        lactate: m.lactate != null ? Number(m.lactate) : null,
        tempoSeconds: m.tempoSeconds,
        heartRate: m.heartRate,
      })),
  }));

  const subtitleParts = [formatDate(test.testDate)];
  if (test.location) subtitleParts.push(test.location);

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title={test.title}
        subtitle={subtitleParts.join(" · ")}
        backHref="/lactate"
      />

      <main className="flex-1 px-5 py-4 pb-10">
        {test.notes ? (
          <div className="mb-4 flex gap-2.5 border-l-2 border-primary bg-muted/60 p-3 text-sm">
            <StickyNote
              size={16}
              className="mt-0.5 shrink-0 text-muted-foreground"
            />
            <p className="whitespace-pre-wrap text-foreground/90">
              {test.notes}
            </p>
          </div>
        ) : null}

        <ParticipantsSection
          testId={test.id}
          participants={participants}
          allMembers={allMembers}
        />

        <div className="mt-10 border-t border-border pt-4">
          <DeleteTest testId={test.id} />
        </div>
      </main>
    </div>
  );
}
