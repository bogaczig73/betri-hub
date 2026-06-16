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

      <main className="flex-1 px-5 py-4 pb-10">
        <div className="mb-4">
          <AddMember />
        </div>

        {members.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-accent/10 text-accent">
              <Users size={30} />
            </span>
            <h3 className="mt-4 text-xl font-semibold">No members yet</h3>
            <p className="mt-1 max-w-xs text-muted-foreground">
              Add athletes here, or add them on the fly while creating a test.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
            {members.map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                <Avatar name={m.name} />
                <span className="flex-1 font-medium">{m.name}</span>
                <span className="text-sm text-muted-foreground">
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
