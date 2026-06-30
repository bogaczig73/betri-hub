"use client";

import { Users } from "lucide-react";
import { useOptimistic, useTransition } from "react";

import type { MemberSuggestion } from "@/lib/db/queries";

import { addParticipant, addParticipantByName } from "../actions";
import { AddParticipant } from "./AddParticipant";
import { ParticipantCard, type ParticipantVM } from "./ParticipantCard";

export function ParticipantsSection({
  testId,
  participants,
  allMembers,
}: {
  testId: string;
  participants: ParticipantVM[];
  allMembers: MemberSuggestion[];
}) {
  const [, startTransition] = useTransition();

  // Optimistic list — a tapped athlete shows up instantly; the server write
  // happens in the background and reconciles when the page revalidates.
  const [optimistic, addOptimistic] = useOptimistic(
    participants,
    (current, entry: ParticipantVM) => [...current, entry],
  );

  // Drive the picker's exclusion off the optimistic list so a just-added
  // athlete disappears from it immediately too.
  const excludeIds = optimistic.map((p) => p.memberId);

  function addExisting(member: MemberSuggestion) {
    startTransition(async () => {
      addOptimistic({
        id: `pending:${member.id}`,
        memberId: member.id,
        name: member.name,
        measurements: [],
        baselineLactate: null,
        baselineTempoSeconds: null,
        includeBaseline: false,
      });
      await addParticipant(testId, member.id);
    });
  }

  function createNew(name: string) {
    startTransition(async () => {
      addOptimistic({
        id: `pending:${name}`,
        memberId: `pending:${name}`,
        name,
        measurements: [],
        baselineLactate: null,
        baselineTempoSeconds: null,
        includeBaseline: false,
      });
      await addParticipantByName(testId, name);
    });
  }

  return (
    <>
      <div className="mb-3 flex items-center gap-2">
        <Users size={16} className="text-muted-foreground" />
        <h2 className="eyebrow text-[11px] text-foreground">Athletes</h2>
        <span className="text-[11px] font-semibold text-muted-foreground">
          {optimistic.length}
        </span>
      </div>

      <div className="mb-4">
        <AddParticipant
          allMembers={allMembers}
          excludeIds={excludeIds}
          onAddExisting={addExisting}
          onCreateNew={createNew}
        />
      </div>

      {optimistic.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">
          No athletes yet. Add the first one above.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {optimistic.map((p) => (
            <li key={p.id}>
              <ParticipantCard participant={p} testId={testId} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
