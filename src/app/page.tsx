import {
  ChevronRight,
  Droplet,
  Footprints,
  Users,
  Waves,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { BetriMark, Wordmark } from "@/components/Brand";
import { countMembers, countTests } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

type App = {
  key: string;
  title: string;
  description: string;
  href?: string;
  icon: LucideIcon;
  tone: "primary" | "accent" | "blue" | "violet";
  stat?: string;
  soon?: boolean;
};

const toneClasses: Record<App["tone"], string> = {
  primary: "bg-primary-soft text-primary",
  accent: "bg-accent/10 text-accent",
  blue: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

export default async function HubHome() {
  const [memberCount, testCount] = await Promise.all([
    countMembers(),
    countTests(),
  ]);

  const apps: App[] = [
    {
      key: "lactate",
      title: "Lactate Testing",
      description: "Run step tests, record lactate & pace curves",
      href: "/lactate",
      icon: Droplet,
      tone: "primary",
      stat: `${testCount} ${testCount === 1 ? "test" : "tests"}`,
    },
    {
      key: "members",
      title: "Members",
      description: "Shared directory of athletes across all apps",
      href: "/members",
      icon: Users,
      tone: "accent",
      stat: `${memberCount} ${memberCount === 1 ? "person" : "people"}`,
    },
    {
      key: "swim",
      title: "Swim Sessions",
      description: "Track pool sets, intervals and times",
      icon: Waves,
      tone: "blue",
      soon: true,
    },
    {
      key: "run",
      title: "Run Workouts",
      description: "Plan and log running sessions",
      icon: Footprints,
      tone: "violet",
      soon: true,
    },
  ];

  return (
    <main className="flex flex-1 flex-col px-5 pb-10">
      <header className="flex items-center gap-3 pb-6 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <BetriMark />
        <Wordmark />
      </header>

      <div className="mb-5">
        <h2 className="font-display text-3xl font-bold uppercase tracking-wide">
          Apps
        </h2>
        <p className="text-muted-foreground">Pick what you want to work on.</p>
      </div>

      <ul className="flex flex-col gap-3">
        {apps.map((app) => {
          const Icon = app.icon;
          const inner = (
            <>
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${toneClasses[app.tone]}`}
              >
                <Icon size={24} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-lg font-semibold leading-tight">
                    {app.title}
                  </h3>
                  {app.soon ? (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Soon
                    </span>
                  ) : null}
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {app.description}
                </p>
              </div>
              {app.soon ? null : (
                <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
                  {app.stat ? (
                    <span className="text-sm font-medium">{app.stat}</span>
                  ) : null}
                  <ChevronRight size={20} />
                </div>
              )}
            </>
          );

          return (
            <li key={app.key}>
              {app.href ? (
                <Link
                  href={app.href}
                  className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4 transition-colors hover:bg-muted active:bg-muted"
                >
                  {inner}
                </Link>
              ) : (
                <div className="flex items-center gap-4 rounded-3xl border border-dashed border-border bg-card/60 p-4 opacity-70">
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
