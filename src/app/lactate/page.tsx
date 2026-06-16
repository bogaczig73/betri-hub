import { CalendarDays, Droplet, MapPin, Plus, Users } from "lucide-react";
import Link from "next/link";

import { TopBar } from "@/components/TopBar";
import { Avatar } from "@/components/ui/Avatar";
import { buttonClasses } from "@/components/ui/Button";
import { listTests } from "@/lib/db/queries";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function LactateListPage() {
  const tests = await listTests();

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="Lactate Testing" backHref="/" />

      <main className="flex-1 px-5 py-4 pb-28">
        {tests.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="flex flex-col gap-3">
            {tests.map((test) => (
              <li key={test.id}>
                <Link
                  href={`/lactate/${test.id}`}
                  className="block rounded-3xl border border-border bg-card p-4 transition-colors hover:bg-muted active:bg-muted"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold leading-tight">
                      {test.title}
                    </h3>
                    <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      <Users size={13} />
                      {test.participants.length}
                    </span>
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={14} />
                      {formatDate(test.testDate)}
                    </span>
                    {test.location ? (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={14} />
                        {test.location}
                      </span>
                    ) : null}
                  </div>

                  {test.participants.length > 0 ? (
                    <div className="mt-3 flex items-center -space-x-2">
                      {test.participants.slice(0, 6).map((p) => (
                        <Avatar
                          key={p.id}
                          name={p.member.name}
                          size="sm"
                          className="ring-2 ring-card"
                        />
                      ))}
                      {test.participants.length > 6 ? (
                        <span className="flex h-8 items-center pl-3 text-xs text-muted-foreground">
                          +{test.participants.length - 6}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      <div className="pointer-events-none sticky bottom-0 z-20 flex justify-center bg-gradient-to-t from-background via-background/90 to-transparent px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6">
        <Link
          href="/lactate/new"
          className={buttonClasses({
            size: "lg",
            className: "pointer-events-auto w-full shadow-lg",
          })}
        >
          <Plus size={20} />
          New test
        </Link>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-soft text-primary">
        <Droplet size={30} />
      </span>
      <h3 className="mt-4 text-xl font-semibold">No tests yet</h3>
      <p className="mt-1 max-w-xs text-muted-foreground">
        Create your first lactate testing session and start adding athletes and
        measurements.
      </p>
    </div>
  );
}
