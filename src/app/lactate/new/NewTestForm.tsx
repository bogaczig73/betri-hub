"use client";

import { Bike, Footprints, LoaderCircle } from "lucide-react";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { SPORTS, type Sport } from "@/lib/lactate/sport";

import { createTest, type CreateTestState } from "../actions";

const SPORT_ICONS = { run: Footprints, bike: Bike } as const;

const fieldClass =
  "h-12 w-full rounded-sm border border-input bg-card px-4 text-[15px] outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30";
const labelClass =
  "eyebrow mb-2 block text-[11px] text-muted-foreground";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? <LoaderCircle className="animate-spin" size={20} /> : null}
      Create test
    </Button>
  );
}

export function NewTestForm() {
  const [state, formAction] = useActionState<CreateTestState, FormData>(
    createTest,
    {},
  );
  const today = new Date().toISOString().slice(0, 10);
  // Sport decides what a measurement is — pace or watts — so it can't be
  // changed later without the numbers meaning something else.
  const [sport, setSport] = useState<Sport>("run");

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="sport" value={sport} />

      <div>
        <span className={labelClass}>Sport</span>
        <div className="grid grid-cols-2 gap-2">
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
                  "flex h-12 items-center justify-center gap-2 rounded-sm border text-[13px] font-semibold transition-colors",
                  on
                    ? "border-primary bg-primary-soft text-foreground"
                    : "border-input bg-card text-muted-foreground hover:border-muted-foreground",
                )}
              >
                <Icon size={18} />
                {SPORTS[key].label}
                <span className="font-mono text-[11px] font-normal opacity-70">
                  {SPORTS[key].field.label.toLowerCase()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="title" className={labelClass}>
          Test name <span className="font-normal">(optional)</span>
        </label>
        <input
          id="title"
          name="title"
          placeholder="Defaults to the date"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="testDate" className={labelClass}>
          Date
        </label>
        <input
          id="testDate"
          name="testDate"
          type="date"
          defaultValue={today}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="location" className={labelClass}>
          Location <span className="font-normal">(optional)</span>
        </label>
        <input
          id="location"
          name="location"
          placeholder="e.g. Stromovka track"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>
          Notes <span className="font-normal">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Protocol, conditions, anything useful…"
          className={`${fieldClass} h-auto resize-none py-3`}
        />
      </div>

      {state.error ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
