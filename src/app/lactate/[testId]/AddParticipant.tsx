"use client";

import { LoaderCircle, Search, UserPlus } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { Sheet } from "@/components/ui/Sheet";
import type { MemberSuggestion } from "@/lib/db/queries";

import { searchMembersAction } from "@/app/members/actions";
import { addParticipant, addParticipantByName } from "../actions";

export function AddParticipant({
  testId,
  excludeIds,
}: {
  testId: string;
  excludeIds: string[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MemberSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search whenever the query (or the open state) changes.
  useEffect(() => {
    if (!open) return;
    setSearching(true);
    const handle = setTimeout(async () => {
      const res = await searchMembersAction(query, excludeIds);
      setResults(res);
      setSearching(false);
    }, 180);
    return () => clearTimeout(handle);
  }, [query, open, excludeIds]);

  const trimmed = query.trim();
  const hasExact = results.some(
    (r) => r.name.toLowerCase() === trimmed.toLowerCase(),
  );

  function close() {
    setOpen(false);
    setQuery("");
    setResults([]);
  }

  function addExisting(member: MemberSuggestion) {
    setPendingId(member.id);
    startTransition(() =>
      addParticipant(testId, member.id).then(() => {
        setPendingId(null);
        setQuery("");
        inputRef.current?.focus();
      }),
    );
  }

  function createAndAdd() {
    if (!trimmed) return;
    setPendingId("new");
    startTransition(() =>
      addParticipantByName(testId, trimmed).then(() => {
        setPendingId(null);
        setQuery("");
        inputRef.current?.focus();
      }),
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 border border-foreground/30 py-3 text-xs font-bold uppercase tracking-[0.1em] text-foreground transition-colors hover:bg-muted"
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
              ref={inputRef}
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
                  disabled={pendingId !== null}
                  className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary-soft/60 px-3 py-2.5 text-left transition-colors hover:bg-primary-soft disabled:opacity-60"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {pendingId === "new" ? (
                      <LoaderCircle className="animate-spin" size={18} />
                    ) : (
                      <UserPlus size={18} />
                    )}
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
                  onClick={() => addExisting(m)}
                  disabled={pendingId !== null}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-muted disabled:opacity-60"
                >
                  <Avatar name={m.name} />
                  <span className="flex-1 font-medium">{m.name}</span>
                  {pendingId === m.id ? (
                    <LoaderCircle
                      className="animate-spin text-muted-foreground"
                      size={18}
                    />
                  ) : null}
                </button>
              </li>
            ))}

            {!searching && results.length === 0 && !trimmed ? (
              <li className="px-1 py-6 text-center text-sm text-muted-foreground">
                No saved athletes yet — type a name to add one.
              </li>
            ) : null}
          </ul>
        </div>
      </Sheet>
    </>
  );
}
