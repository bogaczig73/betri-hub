"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/cn";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Optional element pinned to the bottom (e.g. a primary action). */
  footer?: React.ReactNode;
  /** Allow dragging the grab handle to expand / collapse / close. */
  expandable?: boolean;
}

export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
  expandable = false,
}: SheetProps) {
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startYRef = useRef(0);

  useEffect(() => setMounted(true), []);

  // Collapse back to the default size each time the sheet opens.
  useEffect(() => {
    if (open) {
      setExpanded(false);
      setDragY(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    // Lock background scroll. `overflow: hidden` alone is ignored by iOS
    // Safari, so pin the body in place and restore the scroll position on
    // close.
    const body = document.body;
    const scrollY = window.scrollY;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const onHandleDown = (e: React.PointerEvent) => {
    if (!expandable) return;
    startYRef.current = e.clientY;
    setDragging(true);
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  };
  const onHandleMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragY(e.clientY - startYRef.current);
  };
  const onHandleUp = () => {
    if (!dragging) return;
    setDragging(false);
    const dy = dragY;
    const T = 50;
    if (dy < -T) {
      setExpanded(true); // pulled up
    } else if (dy > T) {
      if (expanded)
        setExpanded(false); // pulled down from expanded → collapse
      else onClose(); // pulled down from default → close
    } else if (Math.abs(dy) < 8) {
      setExpanded((v) => !v); // tap the handle toggles expand
    }
    setDragY(0);
  };

  const heightClass = expandable
    ? expanded
      ? "h-[92dvh]"
      : "max-h-[85dvh]"
    : "max-h-[92dvh]";

  const panelStyle: React.CSSProperties | undefined =
    dragY > 0
      ? {
          transform: `translateY(${dragY}px)`,
          transition: dragging ? "none" : undefined,
        }
      : undefined;

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
        className="no-tap absolute inset-0 touch-none bg-black/50 backdrop-blur-[1px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={panelStyle}
        className={cn(
          "relative flex w-full max-w-md touch-pan-y flex-col overscroll-contain rounded-t-[24px] md:max-w-lg",
          "border-t-2 border-primary bg-card text-card-foreground",
          "transition-transform duration-300 ease-out",
          heightClass,
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div
          onPointerDown={onHandleDown}
          onPointerMove={onHandleMove}
          onPointerUp={onHandleUp}
          onPointerCancel={onHandleUp}
          className={cn(
            "flex shrink-0 items-center justify-center pb-1 pt-3",
            expandable && "cursor-grab touch-none active:cursor-grabbing",
          )}
        >
          <div
            className={cn(
              "h-1.5 rounded-full bg-border transition-all",
              expandable ? "w-12" : "w-10",
            )}
          />
        </div>
        <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-1">
          {title ? (
            <h2 className="text-lg font-bold">{title}</h2>
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
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-2">
          {children}
        </div>
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
