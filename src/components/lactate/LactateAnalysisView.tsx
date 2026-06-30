"use client";

import { AlertTriangle, Check } from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@/lib/cn";
import { formatLactate, formatTempo } from "@/lib/format";
import {
  analyzeRunning,
  type RunBaseline,
  type RunMeasurement,
  type RunResult,
  summarise,
} from "@/lib/lactate/display";
import type { Consensus } from "@/lib/lactate/display";

import { AnalysisChart, type ChartMarker } from "./AnalysisChart";

const LT1_COLOR = "#4c98b9"; // info blue — aerobic
const LT2_COLOR = "#c45200"; // brand orange — anaerobic

// Matched LT1/LT2 method pairs for the combined "Method set" selector.
const PAIRS: { value: string; label: string; lt1: string; lt2: string }[] = [
  { value: "consensus", label: "Consensus (median)", lt1: "Consensus", lt2: "Consensus" },
  { value: "obla", label: "OBLA (2.0 / 4.0)", lt1: "OBLA 2.0", lt2: "OBLA 4.0" },
  { value: "ltp", label: "LTP (LTP1 / LTP2)", lt1: "LTP1", lt2: "LTP2" },
];

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

  // Methods the user has switched off. Empty = all on, so newly-appearing
  // methods are selected by default.
  const [deselected, setDeselected] = useState<Set<string>>(new Set());

  // Per-card source: "Consensus" (median of selected) or a single method name.
  const [lt1Source, setLt1Source] = useState("Consensus");
  const [lt2Source, setLt2Source] = useState("Consensus");

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

  const isSelected = (m: string) => !deselected.has(m);
  const toggle = (m: string) =>
    setDeselected((s) => {
      const n = new Set(s);
      if (n.has(m)) n.delete(m);
      else n.add(m);
      return n;
    });
  const toggleAll = (rows: RunResult[]) =>
    setDeselected((s) => {
      const n = new Set(s);
      const allOn = rows.every((r) => !n.has(r.method));
      rows.forEach((r) => (allOn ? n.add(r.method) : n.delete(r.method)));
      return n;
    });

  const lt1Rows = analysis.results.filter((r) => r.estimates === "LT1");
  const lt2Rows = analysis.results.filter((r) => r.estimates === "LT2");

  // Each card shows either the consensus (median of selected methods) or a
  // single chosen method.
  const sourced = (
    rows: RunResult[],
    source: string,
  ): Consensus | null =>
    source === "Consensus"
      ? summarise(rows.filter((r) => isSelected(r.method)))
      : asConsensus(rows.find((r) => r.method === source));

  const lt1 = sourced(lt1Rows, lt1Source);
  const lt2 = sourced(lt2Rows, lt2Source);

  // Combined selector: pick a matched LT1/LT2 pair for both cards at once.
  // Only offer pairs whose methods are actually present.
  const lt1Names = new Set(lt1Rows.map((r) => r.method));
  const lt2Names = new Set(lt2Rows.map((r) => r.method));
  const pairs = PAIRS.filter(
    (p) =>
      (p.lt1 === "Consensus" || lt1Names.has(p.lt1)) &&
      (p.lt2 === "Consensus" || lt2Names.has(p.lt2)),
  );
  const currentPair =
    pairs.find((p) => p.lt1 === lt1Source && p.lt2 === lt2Source)?.value ??
    "custom";
  const applyPair = (value: string) => {
    const p = pairs.find((x) => x.value === value);
    if (!p) return;
    setLt1Source(p.lt1);
    setLt2Source(p.lt2);
  };

  const markers: ChartMarker[] = [];
  if (lt1)
    markers.push({
      label: "LT1",
      speedKmh: lt1.speedKmh,
      lactate: lt1.lactate,
      color: LT1_COLOR,
    });
  if (lt2)
    markers.push({
      label: "LT2",
      speedKmh: lt2.speedKmh,
      lactate: lt2.lactate,
      color: LT2_COLOR,
    });

  return (
    <div className="flex flex-col gap-4">
      {/* Combined selector — sets both cards to a matched method pair. */}
      <label className="flex items-center gap-2">
        <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Method set
        </span>
        <select
          value={currentPair}
          onChange={(e) => applyPair(e.target.value)}
          className="min-w-0 flex-1 rounded-sm border border-input bg-background px-2 py-1.5 text-xs font-semibold outline-none focus:border-primary"
        >
          {pairs.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
          {currentPair === "custom" ? (
            <option value="custom" disabled>
              Custom (per-card)
            </option>
          ) : null}
        </select>
      </label>

      {/* Headline cards — each driven by its own source dropdown. */}
      <div className="grid grid-cols-2 gap-2">
        <SummaryCard
          title="LT1 · aerobic"
          color={LT1_COLOR}
          c={lt1}
          source={lt1Source}
          methods={lt1Rows.map((r) => r.method)}
          onSource={setLt1Source}
        />
        <SummaryCard
          title="LT2 · anaerobic"
          color={LT2_COLOR}
          c={lt2}
          source={lt2Source}
          methods={lt2Rows.map((r) => r.method)}
          onSource={setLt2Source}
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

      <p className="text-[11px] text-muted-foreground">
        Tap a method to include or exclude it from the LT1 / LT2 summary above.
      </p>

      {/* Selectable method table */}
      <div className="flex flex-col gap-3">
        <MethodGroup
          title="LT1 estimates"
          rows={lt1Rows}
          color={LT1_COLOR}
          isSelected={isSelected}
          onToggle={toggle}
          onToggleAll={() => toggleAll(lt1Rows)}
        />
        <MethodGroup
          title="LT2 estimates"
          rows={lt2Rows}
          color={LT2_COLOR}
          isSelected={isSelected}
          onToggle={toggle}
          onToggleAll={() => toggleAll(lt2Rows)}
        />
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

function asConsensus(r: RunResult | undefined): Consensus | null {
  if (!r || r.paceSeconds == null || !Number.isFinite(r.speedKmh)) return null;
  return {
    speedKmh: r.speedKmh,
    paceSeconds: r.paceSeconds,
    lactate: r.lactate,
    heartRate: r.heartRate,
  };
}

function SummaryCard({
  title,
  color,
  c,
  source,
  methods,
  onSource,
}: {
  title: string;
  color: string;
  c: Consensus | null;
  source: string;
  methods: string[];
  onSource: (s: string) => void;
}) {
  return (
    <div
      className="rounded-lg border border-border bg-card p-3"
      style={{ borderTopWidth: 2, borderTopColor: color }}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="eyebrow text-[10px] text-muted-foreground">
          {title}
        </span>
      </div>
      <select
        value={source}
        onChange={(e) => onSource(e.target.value)}
        aria-label={`${title} source`}
        className="mt-1 w-full max-w-full truncate rounded-sm border border-input bg-background px-1.5 py-1 text-[11px] font-semibold outline-none focus:border-primary"
      >
        <option value="Consensus">Consensus (median)</option>
        {methods.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
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

function Checkbox({ on, color }: { on: boolean; color: string }) {
  return (
    <span
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
        on ? "text-white" : "border-border",
      )}
      style={on ? { backgroundColor: color, borderColor: color } : undefined}
    >
      {on ? <Check size={11} strokeWidth={3} /> : null}
    </span>
  );
}

function MethodGroup({
  title,
  rows,
  color,
  isSelected,
  onToggle,
  onToggleAll,
}: {
  title: string;
  rows: RunResult[];
  color: string;
  isSelected: (m: string) => boolean;
  onToggle: (m: string) => void;
  onToggleAll: () => void;
}) {
  if (rows.length === 0) return null;
  const selectedCount = rows.filter((r) => isSelected(r.method)).length;
  const allOn = selectedCount === rows.length;

  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {selectedCount}/{rows.length}
        </span>
        <button
          type="button"
          onClick={onToggleAll}
          className="ml-auto text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
        >
          {allOn ? "None" : "All"}
        </button>
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-[1.25rem_1fr_auto_auto_auto] items-center gap-x-3 bg-muted/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          <span />
          <span>Method</span>
          <span className="text-right">Pace</span>
          <span className="text-right">HR</span>
          <span className="text-right">Lac</span>
        </div>
        <ul className="divide-y divide-border">
          {rows.map((r) => {
            const on = isSelected(r.method);
            return (
              <li key={r.method}>
                <button
                  type="button"
                  onClick={() => onToggle(r.method)}
                  aria-pressed={on}
                  className={cn(
                    "grid w-full grid-cols-[1.25rem_1fr_auto_auto_auto] items-center gap-x-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50",
                    !on && "opacity-45",
                  )}
                >
                  <Checkbox on={on} color={color} />
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
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
