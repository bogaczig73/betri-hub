"use client";

import { ChevronDown, LineChart, Plus, X } from "lucide-react";
import { useState, useTransition } from "react";

import { LactateChart } from "@/components/LactateChart";
import { Avatar } from "@/components/ui/Avatar";
import {
  MeasurementSheet,
  type MeasurementValues,
} from "@/components/inputs/MeasurementSheet";
import { cn } from "@/lib/cn";
import { formatLactate, formatTempo } from "@/lib/format";

import {
  addMeasurement,
  deleteMeasurement,
  removeParticipant,
  updateMeasurement,
} from "../actions";

export interface MeasurementVM {
  id: string;
  stage: number;
  lactate: number | null;
  tempoSeconds: number | null;
  heartRate: number | null;
}

export interface ParticipantVM {
  id: string;
  name: string;
  measurements: MeasurementVM[];
}

export function ParticipantCard({
  participant,
  testId,
}: {
  participant: ParticipantVM;
  testId: string;
}) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<MeasurementVM | null>(null);
  const [showChart, setShowChart] = useState(false);
  const [removing, startRemove] = useTransition();

  const measurements = participant.measurements;

  return (
    <div className="rounded-3xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <Avatar name={participant.name} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold leading-tight">
            {participant.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {measurements.length}{" "}
            {measurements.length === 1 ? "measurement" : "measurements"}
          </p>
        </div>
        <button
          type="button"
          aria-label={`Remove ${participant.name}`}
          disabled={removing}
          onClick={() => {
            if (
              confirm(`Remove ${participant.name} from this test?`)
            ) {
              startRemove(() =>
                removeParticipant(participant.id, testId).then(() => {}),
              );
            }
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted disabled:opacity-50"
        >
          <X size={18} />
        </button>
      </div>

      {measurements.length > 0 ? (
        <ul className="mt-3 flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border">
          {measurements.map((m, i) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => setEditing(m)}
                className="flex w-full items-center gap-3 bg-card px-3 py-2.5 text-left transition-colors hover:bg-muted"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                  {i + 1}
                </span>
                <Stat
                  label="Lactate"
                  value={formatLactate(m.lactate)}
                  emphasis
                />
                <Stat label="Pace" value={formatTempo(m.tempoSeconds)} />
                <Stat
                  label="HR"
                  value={m.heartRate != null ? String(m.heartRate) : "—"}
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {measurements.length >= 2 ? (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setShowChart((s) => !s)}
            aria-expanded={showChart}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            <LineChart size={16} />
            {showChart ? "Hide curve" : "Show curve"}
            <ChevronDown
              size={16}
              className={cn(
                "transition-transform",
                showChart && "rotate-180",
              )}
            />
          </button>
          {showChart ? (
            <div className="mt-1">
              <LactateChart measurements={measurements} />
            </div>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setAdding(true)}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
      >
        <Plus size={18} />
        Add measurement
      </button>

      <MeasurementSheet
        open={adding}
        onClose={() => setAdding(false)}
        title={`${participant.name} · new measurement`}
        onSave={(values: MeasurementValues) =>
          addMeasurement(participant.id, testId, values)
        }
      />

      <MeasurementSheet
        open={editing != null}
        onClose={() => setEditing(null)}
        title={`${participant.name} · edit`}
        initial={editing}
        onSave={(values: MeasurementValues) =>
          editing
            ? updateMeasurement(editing.id, testId, values)
            : Promise.resolve()
        }
        onDelete={
          editing
            ? () => deleteMeasurement(editing.id, testId)
            : undefined
        }
      />
    </div>
  );
}

function Stat({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "font-display font-bold leading-tight",
          emphasis ? "text-xl text-primary" : "text-lg",
        )}
      >
        {value}
      </span>
    </div>
  );
}
