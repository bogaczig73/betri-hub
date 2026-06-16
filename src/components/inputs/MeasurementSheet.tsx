"use client";

import { Grid3x3, LoaderCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { cn } from "@/lib/cn";
import {
  digitsToLactate,
  digitsToTempo,
  formatLactate,
  formatTempo,
  lactateToDigits,
  tempoToDigits,
} from "@/lib/format";

import { CircularDial } from "./CircularDial";
import { Keypad } from "./Keypad";

export interface MeasurementValues {
  lactate: number | null;
  tempoSeconds: number | null;
  heartRate: number | null;
}

type FieldKey = "lactate" | "tempo" | "hr";

interface FieldConfig {
  key: FieldKey;
  label: string;
  unit: string;
  hint: string;
  maxDigits: number;
  toValue: (digits: string) => number | null;
  toDigits: (value: number) => string;
  format: (value: number | null) => string;
  dial: { min: number; max: number; step: number; default: number };
}

const FIELDS: FieldConfig[] = [
  {
    key: "lactate",
    label: "Lactate",
    unit: "mmol/L",
    hint: "Type 124 → 1.24",
    maxDigits: 4,
    toValue: digitsToLactate,
    toDigits: lactateToDigits,
    format: (v) => (v == null ? "—" : formatLactate(v)),
    dial: { min: 0, max: 20, step: 0.1, default: 2 },
  },
  {
    key: "tempo",
    label: "Pace",
    unit: "/km",
    hint: "Type 542 → 5:42",
    maxDigits: 4,
    toValue: digitsToTempo,
    toDigits: tempoToDigits,
    format: (v) => (v == null ? "—" : formatTempo(v)),
    dial: { min: 120, max: 720, step: 1, default: 300 },
  },
  {
    key: "hr",
    label: "Heart rate",
    unit: "bpm",
    hint: "Optional",
    maxDigits: 3,
    toValue: (d) => (d ? parseInt(d, 10) : null),
    toDigits: (v) => String(Math.round(v)),
    format: (v) => (v == null ? "—" : String(Math.round(v))),
    dial: { min: 60, max: 220, step: 1, default: 140 },
  },
];

const fieldByKey = Object.fromEntries(FIELDS.map((f) => [f.key, f])) as Record<
  FieldKey,
  FieldConfig
>;

function valuesToDigits(initial?: MeasurementValues | null) {
  return {
    lactate: initial?.lactate != null ? lactateToDigits(initial.lactate) : "",
    tempo:
      initial?.tempoSeconds != null ? tempoToDigits(initial.tempoSeconds) : "",
    hr: initial?.heartRate != null ? String(initial.heartRate) : "",
  } satisfies Record<FieldKey, string>;
}

interface MeasurementSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  initial?: MeasurementValues | null;
  onSave: (values: MeasurementValues) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function MeasurementSheet({
  open,
  onClose,
  title,
  initial,
  onSave,
  onDelete,
}: MeasurementSheetProps) {
  const [digits, setDigits] = useState<Record<FieldKey, string>>(
    valuesToDigits(initial),
  );
  const [active, setActive] = useState<FieldKey>("lactate");
  const [mode, setMode] = useState<"keypad" | "dial">("keypad");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Reset whenever the sheet is (re)opened for a different measurement.
  useEffect(() => {
    if (open) {
      setDigits(valuesToDigits(initial));
      setActive("lactate");
      setMode("keypad");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const cfg = fieldByKey[active];
  const activeDigits = digits[active];
  const dialValue = cfg.toValue(activeDigits) ?? cfg.dial.default;

  const setActiveDigits = (next: string) =>
    setDigits((d) => ({ ...d, [active]: next }));

  const onDigit = (digit: string) => {
    if (activeDigits.length >= cfg.maxDigits) return;
    // Avoid a leading zero building up (e.g. "00").
    const next = activeDigits === "0" ? digit : activeDigits + digit;
    setActiveDigits(next);
  };

  const values: MeasurementValues = {
    lactate: digits.lactate ? digitsToLactate(digits.lactate) : null,
    tempoSeconds: digits.tempo ? digitsToTempo(digits.tempo) : null,
    heartRate: digits.hr ? parseInt(digits.hr, 10) : null,
  };

  const canSave = values.lactate != null && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave(values);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <Button
          size="lg"
          className="w-full"
          onClick={handleSave}
          disabled={!canSave}
        >
          {saving ? <LoaderCircle className="animate-spin" size={20} /> : null}
          Save measurement
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Value chips — tap to choose which field the pad/dial controls. */}
        <div className="grid grid-cols-3 gap-2">
          {FIELDS.map((f) => {
            const isActive = f.key === active;
            const v = f.toValue(digits[f.key]);
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setActive(f.key)}
                className={cn(
                  "flex flex-col items-center rounded-2xl border px-2 py-2.5 transition-colors",
                  isActive
                    ? "border-primary bg-primary-soft"
                    : "border-border bg-card hover:bg-muted",
                )}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {f.label}
                </span>
                <span
                  className={cn(
                    "font-display text-2xl font-bold leading-tight",
                    v == null && "text-muted-foreground",
                  )}
                >
                  {f.format(v)}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {f.unit}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{cfg.hint}</p>
          {/* Input-mode toggle: keypad or dial. */}
          <div className="flex rounded-full bg-muted p-1">
            <button
              type="button"
              onClick={() => setMode("keypad")}
              aria-pressed={mode === "keypad"}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                mode === "keypad"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              <Grid3x3 size={15} /> Keypad
            </button>
            <button
              type="button"
              onClick={() => setMode("dial")}
              aria-pressed={mode === "dial"}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                mode === "dial"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              <DialGlyph /> Dial
            </button>
          </div>
        </div>

        {mode === "keypad" ? (
          <Keypad
            onDigit={onDigit}
            onDelete={() => setActiveDigits(activeDigits.slice(0, -1))}
            onClear={() => setActiveDigits("")}
          />
        ) : (
          <div className="flex justify-center py-2">
            <CircularDial
              value={dialValue}
              min={cfg.dial.min}
              max={cfg.dial.max}
              step={cfg.dial.step}
              onChange={(v) => setActiveDigits(cfg.toDigits(v))}
              format={(v) => cfg.format(v)}
              label={`${cfg.label} (${cfg.unit})`}
            />
          </div>
        )}

        {onDelete ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="mx-auto flex items-center gap-2 py-1 text-sm font-medium text-destructive disabled:opacity-50"
          >
            {deleting ? (
              <LoaderCircle className="animate-spin" size={16} />
            ) : (
              <Trash2 size={16} />
            )}
            Delete measurement
          </button>
        ) : null}
      </div>
    </Sheet>
  );
}

function DialGlyph() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.2"
        opacity="0.5"
      />
      <circle cx="16" cy="7.5" r="2.4" fill="currentColor" />
    </svg>
  );
}
