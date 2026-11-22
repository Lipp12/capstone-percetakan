import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminPageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
}

export default function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary">
          {eyebrow}
        </span>
        <h1 className="mt-1 font-headline-lg text-headline-lg-mobile tracking-tight text-primary md:text-headline-lg">
          {title}
        </h1>
        <p className="mt-1 max-w-3xl font-body-sm text-body-sm text-on-surface-variant">
          {description}
        </p>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
