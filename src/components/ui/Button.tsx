import { cn } from "@/lib/cn";

type Variant = "primary" | "accent" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

// Sharp 0px corners, uppercase labels with generous tracking — the Ferrari
// CTA voice. Depth comes from colour + hairlines, never drop shadows.
const base =
  "inline-flex items-center justify-center gap-2 rounded-none font-bold uppercase " +
  "tracking-[0.1em] transition-colors duration-150 cursor-pointer select-none " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 " +
  "active:scale-[0.99] motion-reduce:active:scale-100";

const variants: Record<Variant, string> = {
  // The signature Rosso Corsa CTA.
  primary: "bg-primary text-primary-foreground hover:bg-primary-active",
  // No second saturated brand colour — accent folds into Rosso Corsa.
  accent: "bg-primary text-primary-foreground hover:bg-primary-active",
  // button-outline-on-dark: transparent with a 1px white border.
  outline: "border border-foreground/70 text-foreground hover:bg-foreground/10",
  ghost: "text-foreground hover:bg-muted",
  destructive:
    "bg-destructive text-destructive-foreground hover:brightness-110",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-xs",
  md: "h-12 px-6 text-[13px]",
  lg: "h-12 px-8 text-sm",
  icon: "h-12 w-12",
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
