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
import { ThemeToggle } from "@/components/theme/ThemeToggle";
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
    <main className="flex flex-1 flex-col">
      {/* Editorial masthead — the wordmark rides at Verge hero scale on a flat
          canvas, hazard-orange "kicker" whisper above a massive display shout.
          No gradient, no shadow: colour and hairlines carry the page. */}
      <header className="flex flex-col px-5 pb-10 pt-[max(2rem,env(safe-area-inset-top))] md:px-8 md:pb-14">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BetriMark size={40} inverted />
            <Wordmark />
          </div>
          <ThemeToggle />
        </div>

        <p className="eyebrow mt-12 text-[11px] text-primary">
          Betri · Triathlon
        </p>
        <h1 className="mt-3 font-display text-6xl leading-[0.92] md:text-8xl">
          Train.
          <br />
          Log. Repeat.
        </h1>
        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          The Betri group&apos;s training companion. Built around the work, and
          the people doing it.
        </p>
      </header>

      <div className="flex flex-col bg-background pb-16">
        <Section label="Applications" apps={applications} />
        <Section label="Tools" apps={tools} />
      </div>
    </main>
  );
}

function Section({ label, apps }: { label: string; apps: App[] }) {
  return (
    <section>
      <div className="flex items-center gap-3 px-5 pb-4 pt-8 md:px-8">
        <span className="eyebrow text-[11px] text-muted-foreground">
          {label}
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* Mobile: a StoryStream column. Desktop: a multi-column tile grid. */}
      <ul className="grid grid-cols-1 gap-3 px-5 md:grid-cols-2 md:px-8 lg:grid-cols-3">
        {apps.map((app) => (
          <li key={app.key}>
            <AppTile app={app} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function AppTile({ app }: { app: App }) {
  const Icon = app.icon;
  const inner = (
    <>
      <div className="flex items-start justify-between">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px]"
          style={{ backgroundColor: app.color, color: app.iconColor }}
        >
          <Icon size={22} />
        </span>
        {app.soon ? (
          <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Soon
          </span>
        ) : app.stat ? (
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {app.stat}
          </span>
        ) : null}
      </div>

      <div className="mt-5 min-w-0 flex-1">
        <h3 className="text-[20px] font-bold leading-tight transition-colors group-hover:text-link-hover">
          {app.title}
        </h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
          {app.description}
        </p>
      </div>

      {app.soon ? null : (
        <div className="mt-4 flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
          Open
          <ChevronRight size={14} />
        </div>
      )}
    </>
  );

  if (app.href) {
    return (
      <Link
        href={app.href}
        className="group flex h-full flex-col rounded-[20px] border border-border bg-card p-5 transition-colors hover:border-primary"
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-[20px] border border-dashed border-border bg-card/40 p-5 opacity-60">
      {inner}
    </div>
  );
}
