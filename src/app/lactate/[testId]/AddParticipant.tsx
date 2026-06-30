"use client";

import { Search, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { Sheet } from "@/components/ui/Sheet";
import type { MemberSuggestion } from "@/lib/db/queries";

export function AddParticipant({
  allMembers,
  excludeIds,
  onAddExisting,
  onCreateNew,
}: {
  allMembers: MemberSuggestion[];
  excludeIds: string[];
  onAddExisting: (member: MemberSuggestion) => void;
  onCreateNew: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const trimmed = query.trim();

  // Filter the preloaded directory on the client — no round-trip, so the
  // picker opens and types instantly. Already-added athletes drop out.
  const results = useMemo(() => {
    const exclude = new Set(excludeIds);
    const needle = trimmed.toLowerCase();
    return allMembers.filter(
      (m) => !exclude.has(m.id) && m.name.toLowerCase().includes(needle),
    );
  }, [allMembers, excludeIds, trimmed]);

  const hasExact = results.some(
    (r) => r.name.toLowerCase() === trimmed.toLowerCase(),
  );

  function close() {
    setOpen(false);
    setQuery("");
  }

  // The athlete appears in the list instantly (optimistic), so we just clear
  // the field and keep the sheet open to add the next one. We deliberately
  // don't refocus the input — doing so re-pops the keyboard on mobile.
  function selectExisting(member: MemberSuggestion) {
    onAddExisting(member);
    setQuery("");
  }

  function createAndAdd() {
    if (!trimmed) return;
    onCreateNew(trimmed);
    setQuery("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-[24px] border border-foreground/30 py-3 font-mono text-xs font-bold uppercase tracking-[0.15em] text-foreground transition-colors hover:bg-muted"
      >
        <UserPlus size={16} />
        Add athlete
      </button>

      <Sheet open={open} onClose={close} title="Add athlete" expandable>
        <div className="flex flex-col gap-3 pb-2">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a name…"
              enterKeyHint="done"
              className="h-12 w-full rounded-sm border border-input bg-card pl-11 pr-4 text-[15px] outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <ul className="flex flex-col gap-1.5">
            {trimmed && !hasExact ? (
              <li>
                <button
                  type="button"
                  onClick={createAndAdd}
                  className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary-soft/60 px-3 py-2.5 text-left transition-colors hover:bg-primary-soft"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <UserPlus size={18} />
                  </span>
                  <span className="font-medium">
                    Add new athlete “{trimmed}”
                  </span>
                </button>
              </li>
            ) : null}

            {results.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => selectExisting(m)}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-muted"
                >
                  <Avatar name={m.name} />
                  <span className="flex-1 font-medium">{m.name}</span>
                </button>
              </li>
            ))}

            {results.length === 0 && !trimmed ? (
              <li className="px-1 py-6 text-center text-sm text-muted-foreground">
                {allMembers.length === 0
                  ? "No saved athletes yet — type a name to add one."
                  : "Everyone’s already on this test."}
              </li>
            ) : null}
          </ul>
        </div>
      </Sheet>
    </>
  );
}
