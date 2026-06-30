import { cn } from "@/lib/cn";

type Variant = "primary" | "accent" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

// Rounded pills, mono-uppercase labels with open tracking — the Verge CTA
// voice. Depth comes from colour + hairlines, never drop shadows.
const base =
  "inline-flex items-center justify-center gap-2 rounded-[24px] font-mono font-bold uppercase " +
  "tracking-[0.15em] transition-colors duration-150 cursor-pointer select-none " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 " +
  "active:scale-[0.99] motion-reduce:active:scale-100";

const variants: Record<Variant, string> = {
  // The signature hazard-orange pill CTA.
  primary: "bg-primary text-primary-foreground hover:bg-primary-active",
  // No second saturated brand colour — accent folds into the orange hazard.
  accent: "bg-primary text-primary-foreground hover:bg-primary-active",
  // Outlined CTA pill — the loudest pill in the system (40px radius).
  outline:
    "rounded-[40px] border border-primary text-primary hover:bg-primary hover:text-primary-foreground",
  ghost: "text-foreground hover:bg-muted",
  destructive:
    "bg-destructive text-destructive-foreground hover:brightness-110",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-5 text-[11px]",
  md: "h-12 px-6 text-xs",
  lg: "h-12 px-8 text-xs",
  icon: "h-12 w-12 rounded-full",
};

export function buttonClasses(opts?: {
  variant?: Variant;
  size?: Size;
  className?: string;
}): string {
  return cn(
    base,
    variants[opts?.variant ?? "primary"],
    sizes[opts?.size ?? "md"],
    opts?.className,
  );
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonClasses({ variant, size, className })}
      {...props}
    />
  );
}
