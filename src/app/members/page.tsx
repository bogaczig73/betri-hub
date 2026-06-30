import { Users } from "lucide-react";

import { TopBar } from "@/components/TopBar";
import { Avatar } from "@/components/ui/Avatar";
import { listMembersWithCounts } from "@/lib/db/queries";

import { AddMember } from "./AddMember";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const members = await listMembersWithCounts();

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="Members" subtitle="Shared across all apps" backHref="/" />

      <main className="flex-1 px-5 py-4 pb-10 md:px-8">
        <div className="mb-4">
          <AddMember />
        </div>

        {members.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-muted text-foreground">
              <Users size={28} />
            </span>
            <h3 className="mt-5 font-display text-3xl">No members yet</h3>
            <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-muted-foreground">
              Add athletes here, or add them on the fly while creating a test.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-[20px] border border-border bg-card">
            {members.map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                <Avatar name={m.name} />
                <span className="flex-1 font-medium">{m.name}</span>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {m.testCount} {m.testCount === 1 ? "test" : "tests"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
