"use client";

import { LoaderCircle, Lock } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/Button";

import { login, type LoginState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? (
        <LoaderCircle className="animate-spin" size={20} />
      ) : (
        <Lock size={18} />
      )}
      Unlock
    </Button>
  );
}

export function LoginForm({ from }: { from: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="from" value={from} />
      <div>
        <label
          htmlFor="passcode"
          className="mb-2 block text-sm font-medium text-muted-foreground"
        >
          Group passcode
        </label>
        <input
          id="passcode"
          name="passcode"
          type="password"
          inputMode="text"
          autoComplete="current-password"
          autoFocus
          placeholder="Enter passcode"
          aria-invalid={state.error ? true : undefined}
          className="h-14 w-full rounded-2xl border border-input bg-card px-5 text-lg outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30 aria-[invalid=true]:border-destructive"
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
