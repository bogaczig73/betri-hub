"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/cn";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Optional element pinned to the bottom (e.g. a primary action). */
  footer?: React.ReactNode;
}

export function Sheet({ open, onClose, title, children, footer }: SheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-200",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <button
        aria-label="Close"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative flex max-h-[92dvh] w-full max-w-md flex-col rounded-t-[1.75rem]",
          "border border-b-0 border-border bg-card text-card-foreground shadow-2xl",
          "transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="flex items-center justify-between px-5 pt-4">
          <div className="mx-auto h-1.5 w-10 rounded-full bg-border" />
        </div>
        <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-2">
          {title ? (
            <h2 className="text-xl font-semibold">{title}</h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-2">{children}</div>
        {footer ? (
          <div className="border-t border-border bg-card px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
            {footer}
          </div>
        ) : (
          <div className="pb-[max(1rem,env(safe-area-inset-bottom))]" />
        )}
      </div>
    </div>,
    document.body,
  );
}
