import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminStatTone = "yellow" | "mint" | "rose" | "lavender";

interface AdminStatCardProps {
  label: string;
  value: string | number;
  caption: string;
  icon: LucideIcon;
  tone?: AdminStatTone;
  className?: string;
  valueClassName?: string;
  footer?: React.ReactNode;
}

const toneClasses: Record<AdminStatTone, string> = {
  yellow: "bg-pastel-bento-yellow text-[#321203]",
  mint: "bg-pastel-bento-mint text-[#001f27]",
  rose: "bg-pastel-bento-rose text-[#410007]",
  lavender: "bg-pastel-bento-lavender text-[#492411]",
};

export default function AdminStatCard({
  label,
  value,
  caption,
  icon: Icon,
  tone = "yellow",
  className,
  valueClassName,
  footer,
}: AdminStatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl p-5 shadow-sm",
        toneClasses[tone],
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="font-label-sm text-label-sm uppercase tracking-widest opacity-75">
            {label}
          </span>
          <p
            className={cn(
              "mt-1 break-words font-headline-lg text-headline-lg tracking-tight",
              valueClassName,
            )}
          >
            {value}
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/80 shadow-sm">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
      {footer ? (
        <div className="mt-4 border-t border-current/10 pt-3">{footer}</div>
      ) : (
        <p className="mt-4 border-t border-current/10 pt-3 font-body-sm text-body-sm opacity-70">
          {caption}
        </p>
      )}
    </div>
  );
}
