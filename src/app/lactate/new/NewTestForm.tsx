"use client";

import { LoaderCircle } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/Button";

import { createTest, type CreateTestState } from "../actions";

const fieldClass =
  "h-12 w-full rounded-2xl border border-input bg-card px-4 text-[15px] outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30";
const labelClass = "mb-1.5 block text-sm font-medium text-muted-foreground";

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

  return (
    <form action={formAction} className="flex flex-col gap-5">
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
