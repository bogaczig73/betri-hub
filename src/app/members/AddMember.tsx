"use client";

import { LoaderCircle, UserPlus } from "lucide-react";
import { useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";

import { createMember } from "./actions";

export function AddMember() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    startTransition(() =>
      createMember(trimmed).then(() => {
        setName("");
        inputRef.current?.focus();
      }),
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-soft py-3 font-semibold text-primary transition-colors hover:brightness-95"
      >
        <UserPlus size={18} />
        Add member
      </button>

      <Sheet
        open={open}
        onClose={() => {
          setOpen(false);
          setName("");
        }}
        title="Add member"
        footer={
          <Button
            size="lg"
            className="w-full"
            onClick={submit}
            disabled={pending || !name.trim()}
          >
            {pending ? (
              <LoaderCircle className="animate-spin" size={20} />
            ) : null}
            Add member
          </Button>
        }
      >
        <p className="mb-2 text-sm text-muted-foreground">
          Members are shared across every Betri app.
        </p>
        <input
          ref={inputRef}
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="Full name"
          className="h-12 w-full rounded-2xl border border-input bg-card px-4 text-[15px] outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </Sheet>
    </>
  );
}
