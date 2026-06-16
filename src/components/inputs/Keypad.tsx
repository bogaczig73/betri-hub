"use client";

import { Delete } from "lucide-react";

interface KeypadProps {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onClear: () => void;
}

const keyBase =
  "flex h-16 items-center justify-center rounded-none bg-muted text-2xl font-semibold " +
  "transition-colors hover:bg-foreground/15 active:scale-[0.97] motion-reduce:active:scale-100 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring select-none";

export function Keypad({ onDigit, onDelete, onClear }: KeypadProps) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
        <button key={d} type="button" className={keyBase} onClick={() => onDigit(d)}>
          {d}
        </button>
      ))}
      <button
        type="button"
        className={`${keyBase} text-base font-medium text-muted-foreground`}
        onClick={onClear}
      >
        Clear
      </button>
      <button type="button" className={keyBase} onClick={() => onDigit("0")}>
        0
      </button>
      <button
        type="button"
        aria-label="Delete"
        className={`${keyBase} text-muted-foreground`}
        onClick={onDelete}
      >
        <Delete size={26} />
      </button>
    </div>
  );
}
