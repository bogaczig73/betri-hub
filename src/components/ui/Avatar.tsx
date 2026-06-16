import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary",
        sizes[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
