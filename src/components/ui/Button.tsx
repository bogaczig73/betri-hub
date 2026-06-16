import { cn } from "@/lib/cn";

type Variant = "primary" | "accent" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium " +
  "transition-colors duration-150 cursor-pointer select-none " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 " +
  "active:scale-[0.98] motion-reduce:active:scale-100";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  accent: "bg-accent text-accent-foreground hover:bg-accent/90",
  outline: "border border-border bg-card text-foreground hover:bg-muted",
  ghost: "text-foreground hover:bg-muted",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-14 px-6 text-base font-semibold",
  icon: "h-11 w-11",
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
