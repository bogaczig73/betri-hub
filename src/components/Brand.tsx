import { cn } from "@/lib/cn";

/**
 * Hub logo mark: a rounded badge with three ascending bars — a nod to the
 * three triathlon disciplines (swim / bike / run).
 */
export function BetriMark({
  className,
  size = 44,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm",
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
        <rect x="3" y="14" width="4.5" height="7" rx="1.5" fill="currentColor" />
        <rect
          x="9.75"
          y="9"
          width="4.5"
          height="12"
          rx="1.5"
          fill="currentColor"
        />
        <rect
          x="16.5"
          y="3"
          width="4.5"
          height="18"
          rx="1.5"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-display text-2xl font-bold uppercase tracking-wide",
        className,
      )}
    >
      Betri<span className="text-primary"> Hub</span>
    </span>
  );
}
