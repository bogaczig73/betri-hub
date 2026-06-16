import { StickyNote, Users } from "lucide-react";
import { notFound } from "next/navigation";

import { TopBar } from "@/components/TopBar";
import { getTestDetail } from "@/lib/db/queries";
import { formatDate } from "@/lib/format";

import { AddParticipant } from "./AddParticipant";
import { DeleteTest } from "./DeleteTest";
import { ParticipantCard, type ParticipantVM } from "./ParticipantCard";

export const dynamic = "force-dynamic";

export default async function TestDetailPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = await params;
  const test = await getTestDetail(testId);
  if (!test) notFound();

  const participants: ParticipantVM[] = test.participants.map((p) => ({
    id: p.id,
    name: p.member.name,
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
          <div className="mb-4 flex gap-2.5 rounded-2xl bg-muted/60 p-3 text-sm">
            <StickyNote
              size={16}
              className="mt-0.5 shrink-0 text-muted-foreground"
            />
            <p className="whitespace-pre-wrap text-foreground/90">
              {test.notes}
            </p>
          </div>
        ) : null}

        <div className="mb-3 flex items-center gap-2">
          <Users size={18} className="text-muted-foreground" />
          <h2 className="font-display text-xl font-bold uppercase tracking-wide">
            Athletes
          </h2>
          <span className="text-muted-foreground">
            {participants.length}
          </span>
        </div>

        <div className="mb-4">
          <AddParticipant
            testId={test.id}
            excludeIds={test.participants.map((p) => p.memberId)}
          />
        </div>

        {participants.length === 0 ? (
          <p className="mt-8 text-center text-muted-foreground">
            No athletes yet. Add the first one above.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {participants.map((p) => (
              <li key={p.id}>
                <ParticipantCard participant={p} testId={test.id} />
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10 border-t border-border pt-4">
          <DeleteTest testId={test.id} />
        </div>
      </main>
    </div>
  );
}
