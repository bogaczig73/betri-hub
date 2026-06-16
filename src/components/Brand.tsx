import { cn } from "@/lib/cn";

/**
 * Hub brand mark: a sharp Rosso Corsa plate holding three ascending bars — a
 * nod to the three triathlon disciplines (swim / bike / run). The single
 * sanctioned use of the brand red as an identity mark; sharp corners, no
 * drop shadow — depth is carried by the colour against the near-black canvas.
 */
export function BetriMark({
  className,
  size = 44,
  inverted = false,
}: {
  className?: string;
  size?: number;
  /** White plate with primary bars — for sitting on a coloured surface. */
  inverted?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-none",
        inverted ? "bg-white text-primary" : "bg-primary text-primary-foreground",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        width={size * 0.58}
        height={size * 0.58}
        viewBox="0 0 24 24"
        fill="none"
      >
        <rect x="3" y="14" width="4.5" height="7" fill="currentColor" />
        <rect x="9.75" y="9" width="4.5" height="12" fill="currentColor" />
        <rect x="16.5" y="3" width="4.5" height="18" fill="currentColor" />
      </svg>
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-display text-xl font-semibold uppercase tracking-[0.18em]",
        className,
      )}
    >
      Betri Hub
    </span>
  );
}
