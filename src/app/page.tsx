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
  /** Distinct tile colour (drawn from the design palette). */
  color: string;
  /** Glyph colour for legibility on the tile. */
  iconColor: string;
  stat?: string;
  soon?: boolean;
};

export default async function HubHome() {
  const [memberCount, testCount] = await Promise.all([
    countMembers(),
    countTests(),
  ]);

  const applications: App[] = [
    {
      key: "lactate",
      title: "Lactate Testing",
      description: "Run step tests, record lactate & pace curves",
      href: "/lactate",
      icon: Droplet,
      color: "#f13a2c", // warning red — the blood-drop signal
      iconColor: "#ffffff",
      stat: `${testCount} ${testCount === 1 ? "test" : "tests"}`,
    },
    {
      key: "swim",
      title: "Swim Sessions",
      description: "Track pool sets, intervals and times",
      icon: Waves,
      color: "#4c98b9", // info blue
      iconColor: "#ffffff",
      soon: true,
    },
    {
      key: "run",
      title: "Run Workouts",
      description: "Plan and log running sessions",
      icon: Footprints,
      color: "#f6e500", // accent yellow
      iconColor: "#181818",
      soon: true,
    },
  ];

  const tools: App[] = [
    {
      key: "members",
      title: "Members",
      description: "Shared directory of athletes across all apps",
      href: "/members",
      icon: Users,
      color: "#03904a", // success green
      iconColor: "#ffffff",
      stat: `${memberCount} ${memberCount === 1 ? "person" : "people"}`,
    },
  ];

  return (
    <main className="flex flex-1 flex-col pb-12">
      {/* Cinematic hero band — a dark editorial gradient stands in for the
          full-bleed photograph the brand language calls for. */}
      <header
        className="relative flex flex-col overflow-hidden px-5 pb-9 pt-[max(2rem,env(safe-area-inset-top))]"
        style={{
          background:
            "linear-gradient(180deg, var(--primary), var(--background) 72%)",
        }}
      >
        <div className="flex items-center gap-3">
          <BetriMark size={40} inverted />
          <Wordmark />
        </div>

        <p className="eyebrow mt-12 text-[11px] text-foreground/80">
          Betri · Triathlon
        </p>
        <h1 className="mt-2 font-display text-5xl font-medium leading-[1.02] tracking-[-0.03em]">
          Train.
          <br />
          Test. Repeat.
        </h1>
        <p className="mt-4 max-w-[19rem] text-[15px] leading-relaxed text-muted-foreground">
          The group&apos;s workspace for lactate testing and the athletes behind
          every session.
        </p>
      </header>

      <Section label="Applications" apps={applications} />
      <Section label="Tools" apps={tools} />
    </main>
  );
}

function Section({ label, apps }: { label: string; apps: App[] }) {
  return (
    <section>
      <div className="flex items-center gap-3 px-5 pb-4 pt-8">
        <span className="eyebrow text-[11px] text-muted-foreground">
          {label}
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <ul className="flex flex-col gap-3 px-5">
        {apps.map((app) => (
          <li key={app.key}>
            <AppRow app={app} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function AppRow({ app }: { app: App }) {
  const Icon = app.icon;
  const inner = (
    <>
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none"
        style={{ backgroundColor: app.color, color: app.iconColor }}
      >
        <Icon size={22} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-[17px] font-medium leading-tight">
            {app.title}
          </h3>
          {app.soon ? (
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Soon
            </span>
          ) : null}
        </div>
        <p className="truncate text-[13px] text-muted-foreground">
          {app.description}
        </p>
      </div>
      {app.soon ? null : (
        <div className="flex shrink-0 items-center gap-3 text-muted-foreground">
          {app.stat ? (
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em]">
              {app.stat}
            </span>
          ) : null}
          <ChevronRight size={18} />
        </div>
      )}
    </>
  );

  if (app.href) {
    return (
      <Link
        href={app.href}
        className="flex items-center gap-4 border border-border bg-card p-4 transition-colors hover:bg-muted active:bg-muted"
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4 border border-dashed border-border bg-card/40 p-4 opacity-60">
      {inner}
    </div>
  );
}
