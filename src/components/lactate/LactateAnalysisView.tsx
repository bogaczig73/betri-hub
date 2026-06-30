"use client";

import { AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@/lib/cn";
import { formatLactate, formatTempo } from "@/lib/format";
import {
  analyzeRunning,
  type RunBaseline,
  type RunMeasurement,
  type RunResult,
} from "@/lib/lactate/display";
import type { Consensus } from "@/lib/lactate/display";

import { AnalysisChart, type ChartMarker } from "./AnalysisChart";

const LT1_COLOR = "#4c98b9"; // info blue — aerobic
const LT2_COLOR = "#c45200"; // brand orange — anaerobic

export function LactateAnalysisView({
  measurements,
  baseline = null,
}: {
  measurements: RunMeasurement[];
  baseline?: RunBaseline | null;
}) {
  const [fit, setFit] = useState<
    "3rd degree polynomial" | "4th degree polynomial"
  >("3rd degree polynomial");

  const analysis = useMemo(
    () => analyzeRunning(measurements, baseline, { fit }),
    [measurements, baseline, fit],
  );

  if (analysis.usable < 3) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Add at least 3 measurements with both lactate and pace to compute
        thresholds.
      </p>
    );
  }

  const markers: ChartMarker[] = [];
  if (analysis.lt1)
    markers.push({
      label: "LT1",
      speedKmh: analysis.lt1.speedKmh,
      lactate: analysis.lt1.lactate,
      color: LT1_COLOR,
    });
  if (analysis.lt2)
    markers.push({
      label: "LT2",
      speedKmh: analysis.lt2.speedKmh,
      lactate: analysis.lt2.lactate,
      color: LT2_COLOR,
    });

  const lt1Rows = analysis.results.filter((r) => r.estimates === "LT1");
  const lt2Rows = analysis.results.filter((r) => r.estimates === "LT2");

  return (
    <div className="flex flex-col gap-4">
      {/* Consensus headline */}
      <div className="grid grid-cols-2 gap-2">
        <SummaryCard title="LT1 · aerobic" color={LT1_COLOR} c={analysis.lt1} />
        <SummaryCard
          title="LT2 · anaerobic"
          color={LT2_COLOR}
          c={analysis.lt2}
        />
      </div>

      <AnalysisChart points={analysis.points} markers={markers} />

      {/* Fit selector */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Curve fit
        </span>
        <div className="flex overflow-hidden rounded-full border border-border">
          {(
            [
              ["3rd degree polynomial", "3rd"],
              ["4th degree polynomial", "4th"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFit(value)}
              aria-pressed={fit === value}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors",
                fit === value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Full method table */}
      <div className="flex flex-col gap-3">
        <MethodGroup title="LT1 estimates" rows={lt1Rows} color={LT1_COLOR} />
        <MethodGroup title="LT2 estimates" rows={lt2Rows} color={LT2_COLOR} />
      </div>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Each method applies a different definition of &ldquo;threshold&rdquo; to
        the same curve, so they intentionally disagree. Use them side by side —
        no single value is the &ldquo;true&rdquo; one. Matched to the lactater
        reference.
      </p>
    </div>
  );
}

function SummaryCard({
  title,
  color,
  c,
}: {
  title: string;
  color: string;
  c: Consensus | null;
}) {
  return (
    <div
      className="rounded-lg border border-border bg-card p-3"
      style={{ borderTopWidth: 2, borderTopColor: color }}
    >
      <span className="eyebrow text-[10px] text-muted-foreground">
        {title}
      </span>
      {c ? (
        <>
          <div className="mt-1 font-mono text-3xl font-bold leading-none tabular-nums">
            {formatTempo(c.paceSeconds)}
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              /km
            </span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {c.heartRate != null ? `${c.heartRate} bpm · ` : ""}
            {formatLactate(c.lactate)} mmol/L
          </div>
        </>
      ) : (
        <div className="mt-2 text-sm text-muted-foreground">—</div>
      )}
    </div>
  );
}

function MethodGroup({
  title,
  rows,
  color,
}: {
  title: string;
  rows: RunResult[];
  color: string;
}) {
  if (rows.length === 0) return null;
  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </span>
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 bg-muted/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Method</span>
          <span className="text-right">Pace</span>
          <span className="text-right">HR</span>
          <span className="text-right">Lac</span>
        </div>
        <ul className="divide-y divide-border">
          {rows.map((r) => (
            <li
              key={r.method}
              className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-3 px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-1.5 truncate">
                {r.warnings.length ? (
                  <AlertTriangle
                    size={12}
                    className="shrink-0 text-muted-foreground"
                  />
                ) : null}
                <span className="truncate">{r.method}</span>
              </span>
              <span className="text-right font-mono font-bold tabular-nums">
                {r.paceSeconds != null ? formatTempo(r.paceSeconds) : "—"}
              </span>
              <span className="text-right tabular-nums text-muted-foreground">
                {r.heartRate != null ? Math.round(r.heartRate) : "—"}
              </span>
              <span className="text-right tabular-nums text-muted-foreground">
                {formatLactate(r.lactate)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
