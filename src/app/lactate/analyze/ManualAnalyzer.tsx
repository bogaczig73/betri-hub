"use client";

import { Bike, Footprints, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

import { LactateAnalysisView } from "@/components/lactate/LactateAnalysisView";
import { cn } from "@/lib/cn";
import { digitsToLactate, formatLactate } from "@/lib/format";
import type { Baseline, Measurement } from "@/lib/lactate/display";
import { SPORTS, type Sport } from "@/lib/lactate/sport";

interface Row {
  id: number;
  lac: string;
  intensity: string;
  hr: string;
}

const SPORT_ICONS = { run: Footprints, bike: Bike } as const;

let nextId = 1;
const emptyRow = (): Row => ({ id: nextId++, lac: "", intensity: "", hr: "" });

export function ManualAnalyzer() {
  const [rows, setRows] = useState<Row[]>(() => [
    emptyRow(),
    emptyRow(),
    emptyRow(),
    emptyRow(),
    emptyRow(),
  ]);
  const [sport, setSport] = useState<Sport>("run");
  const [baseLac, setBaseLac] = useState("");
  const [baseIntensity, setBaseIntensity] = useState("");
  const [include, setInclude] = useState(false);

  const s = SPORTS[sport];

  const update = (id: number, key: keyof Row, value: string) =>
    setRows((rs) =>
      rs.map((r) =>
        r.id === id ? { ...r, [key]: value.replace(/\D/g, "") } : r,
      ),
    );

  const measurements: Measurement[] = useMemo(
    () =>
      rows
        .map((r) => ({
          lactate: r.lac ? digitsToLactate(r.lac) : null,
          intensity: SPORTS[sport].fromDigits(r.intensity),
          heartRate: r.hr ? parseInt(r.hr, 10) : null,
        }))
        .filter((m) => m.lactate != null && m.intensity != null),
    [rows, sport],
  );

  const baseline: Baseline = {
    baselineLactate: baseLac ? digitsToLactate(baseLac) : null,
    baselineIntensity: s.fromDigits(baseIntensity),
    includeBaseline: include,
  };

  return (
    <div className="flex flex-col gap-6">
      <section>
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="eyebrow text-[11px] text-foreground">Stages</h2>
          {/* Sport picks the unit of the middle column: pace or watts. */}
          <div className="flex overflow-hidden rounded-full border border-border">
            {(Object.keys(SPORTS) as Sport[]).map((key) => {
              const Icon = SPORT_ICONS[key];
              const on = sport === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSport(key)}
                  aria-pressed={on}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors",
                    on
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon size={15} />
                  {SPORTS[key].label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-[1.6rem_1fr_1fr_1fr_1.6rem] items-center gap-x-2 bg-muted/60 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span>#</span>
            <span>Lactate</span>
            <span>
              {s.field.label} {s.unit}
            </span>
            <span>HR</span>
            <span />
          </div>
          <ul className="divide-y divide-border">
            {rows.map((r, i) => (
              <li
                key={r.id}
                className="grid grid-cols-[1.6rem_1fr_1fr_1fr_1.6rem] items-center gap-x-2 px-2 py-1.5"
              >
                <span className="text-xs font-semibold text-muted-foreground">
                  {i + 1}
                </span>
                <Cell
                  value={r.lac}
                  display={r.lac ? formatLactate(digitsToLactate(r.lac)) : ""}
                  placeholder="1.24"
                  onChange={(v) => update(r.id, "lac", v)}
                />
                <Cell
                  value={r.intensity}
                  display={r.intensity ? s.format(s.fromDigits(r.intensity)) : ""}
                  placeholder={s.field.placeholder}
                  onChange={(v) => update(r.id, "intensity", v)}
                />
                <Cell
                  value={r.hr}
                  display={r.hr}
                  placeholder="bpm"
                  onChange={(v) => update(r.id, "hr", v)}
                />
                <button
                  type="button"
                  aria-label="Remove stage"
                  onClick={() =>
                    setRows((rs) =>
                      rs.length > 1 ? rs.filter((x) => x.id !== r.id) : rs,
                    )
                  }
                  className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <X size={15} />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={() => setRows((rs) => [...rs, emptyRow()])}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-[24px] border border-border py-2.5 font-mono text-xs font-bold uppercase tracking-[0.15em] hover:bg-muted"
        >
          <Plus size={15} /> Add stage
        </button>
      </section>

      <section>
        <h2 className="eyebrow mb-2 text-[11px] text-foreground">
          Baseline (optional)
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <Labeled label="Resting lactate" hint="93 → 0.93">
            <Cell
              value={baseLac}
              display={baseLac ? formatLactate(digitsToLactate(baseLac)) : ""}
              placeholder="0.93"
              onChange={setBaseLac}
            />
          </Labeled>
          <Labeled
            label={`Resting ${s.field.label.toLowerCase()} ${s.unit}`}
            hint={s.field.hint}
          >
            <Cell
              value={baseIntensity}
              display={
                baseIntensity ? s.format(s.fromDigits(baseIntensity)) : ""
              }
              placeholder={s.field.placeholder}
              onChange={setBaseIntensity}
            />
          </Labeled>
        </div>
        <button
          type="button"
          onClick={() => setInclude((v) => !v)}
          className="mt-2 flex items-center gap-2 text-left"
        >
          <span
            className={cn(
              "flex h-5 w-5 items-center justify-center border",
              include
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border",
            )}
          >
            {include ? "✓" : ""}
          </span>
          <span className="text-sm">Feed baseline point into the curve fit</span>
        </button>
      </section>

      <section>
        <h2 className="eyebrow mb-3 text-[11px] text-foreground">Results</h2>
        <LactateAnalysisView
          measurements={measurements}
          sport={sport}
          baseline={baseline}
        />
      </section>
    </div>
  );
}

function Labeled({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
      <span className="text-[10px] text-muted-foreground">{hint}</span>
    </label>
  );
}

function Cell({
  value,
  display,
  placeholder,
  onChange,
}: {
  value: string;
  display: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      inputMode="numeric"
      pattern="[0-9]*"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      title={display ? `= ${display}` : undefined}
      className="w-full rounded-sm border border-input bg-background px-2 py-1.5 text-sm font-semibold tabular-nums outline-none focus:border-primary"
    />
  );
}
