"use client";

import { Check, LoaderCircle, SlidersHorizontal } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import { LactateAnalysisView } from "@/components/lactate/LactateAnalysisView";
import { Sheet } from "@/components/ui/Sheet";
import { cn } from "@/lib/cn";
import { digitsToLactate, formatLactate, lactateToDigits } from "@/lib/format";
import type { Baseline, Measurement } from "@/lib/lactate/display";
import { SPORTS, type Sport } from "@/lib/lactate/sport";

import { setParticipantBaseline } from "../actions";

export function AnalysisSheet({
  open,
  onClose,
  participantId,
  participantName,
  testId,
  sport,
  measurements,
  initialBaseline,
}: {
  open: boolean;
  onClose: () => void;
  participantId: string;
  participantName: string;
  testId: string;
  sport: Sport;
  measurements: Measurement[];
  initialBaseline: Baseline;
}) {
  const [baseline, setBaseline] = useState<Baseline>(initialBaseline);
  useEffect(() => setBaseline(initialBaseline), [initialBaseline]);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`${participantName} · analysis`}
      expandable
    >
      <div className="flex flex-col gap-4">
        <BaselineEditor
          participantId={participantId}
          testId={testId}
          sport={sport}
          baseline={baseline}
          onChange={setBaseline}
        />
        <LactateAnalysisView
          measurements={measurements}
          sport={sport}
          baseline={baseline}
        />
      </div>
    </Sheet>
  );
}

function BaselineEditor({
  participantId,
  testId,
  sport,
  baseline,
  onChange,
}: {
  participantId: string;
  testId: string;
  sport: Sport;
  baseline: Baseline;
  onChange: (b: Baseline) => void;
}) {
  const s = SPORTS[sport];
  const [editing, setEditing] = useState(false);
  const [lacDigits, setLacDigits] = useState(
    baseline.baselineLactate != null
      ? lactateToDigits(baseline.baselineLactate)
      : "",
  );
  const [intensityDigits, setIntensityDigits] = useState(
    s.toDigits(baseline.baselineIntensity),
  );
  const [include, setInclude] = useState(baseline.includeBaseline);
  const [saving, startSave] = useTransition();
  const [saved, setSaved] = useState(false);

  const lactate = lacDigits ? digitsToLactate(lacDigits) : null;
  const intensity = s.fromDigits(intensityDigits);

  const save = () => {
    startSave(async () => {
      const next: Baseline = {
        baselineLactate: lactate,
        baselineIntensity: intensity,
        includeBaseline: include,
      };
      await setParticipantBaseline(participantId, testId, next);
      onChange(next);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 1500);
    });
  };

  const summary =
    baseline.baselineLactate != null
      ? `${formatLactate(baseline.baselineLactate)} mmol/L${
          baseline.baselineIntensity != null
            ? ` @ ${s.format(baseline.baselineIntensity)}${s.unit}`
            : ""
        }${baseline.includeBaseline ? " · in fit" : ""}`
      : "not set";

  return (
    <div className="rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={() => setEditing((e) => !e)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
      >
        <SlidersHorizontal size={15} className="text-muted-foreground" />
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Baseline
        </span>
        <span className="ml-auto truncate text-xs text-muted-foreground">
          {summary}
        </span>
        {saved ? <Check size={15} className="text-primary" /> : null}
      </button>

      {editing ? (
        <div className="flex flex-col gap-3 border-t border-border p-3">
          <div className="grid grid-cols-2 gap-2">
            <Field
              label="Resting lactate"
              hint="93 → 0.93"
              value={lacDigits}
              placeholder="—"
              display={lactate != null ? formatLactate(lactate) : ""}
              onChange={setLacDigits}
            />
            <Field
              label={`Resting ${s.field.label.toLowerCase()} ${s.unit}`}
              hint={s.field.hint}
              value={intensityDigits}
              placeholder="—"
              display={intensity != null ? s.format(intensity) : ""}
              onChange={setIntensityDigits}
            />
          </div>
          <button
            type="button"
            onClick={() => setInclude((v) => !v)}
            className="flex items-center gap-2 text-left"
          >
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center border",
                include
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border",
              )}
            >
              {include ? <Check size={13} /> : null}
            </span>
            <span className="text-sm">Feed baseline point into the curve fit</span>
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-[24px] border border-border py-2 font-mono text-xs font-bold uppercase tracking-[0.15em] hover:bg-muted disabled:opacity-50"
          >
            {saving ? <LoaderCircle size={15} className="animate-spin" /> : null}
            Save baseline
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  display,
  placeholder,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  display: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <input
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        placeholder={placeholder}
        className="rounded-sm border border-input bg-background px-2 py-2 font-mono text-lg font-bold tabular-nums outline-none focus:border-primary"
      />
      <span className="text-[10px] text-muted-foreground">
        {display ? `= ${display}` : hint}
      </span>
    </label>
  );
}
