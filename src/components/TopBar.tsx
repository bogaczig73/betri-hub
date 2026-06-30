import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function TopBar({
  title,
  subtitle,
  backHref,
  right,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="flex items-center gap-2 px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:px-5">
        {backHref ? (
          <Link
            href={backHref}
            aria-label="Back"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
          >
            <ChevronLeft size={22} />
          </Link>
        ) : (
          <span className="w-1" />
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-2xl leading-none md:text-3xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 truncate text-[13px] text-muted-foreground">
              {subtitle}
            </p>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
        <ThemeToggle />
      </div>
    </header>
  );
}
