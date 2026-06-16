"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useTransition } from "react";

import { deleteTest } from "../actions";

export function DeleteTest({ testId }: { testId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm("Delete this test and all its measurements?")) {
          startTransition(() => deleteTest(testId).then(() => {}));
        }
      }}
      className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
    >
      {pending ? (
        <LoaderCircle className="animate-spin" size={16} />
      ) : (
        <Trash2 size={16} />
      )}
      Delete test
    </button>
  );
}
