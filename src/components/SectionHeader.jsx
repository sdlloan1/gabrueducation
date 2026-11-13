import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SectionHeader({ title, subtitle, linkTo, linkLabel = "See all", icon: Icon, className }) {
  return (
    <div className={cn("mb-3 flex items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-[17px] font-bold text-foreground">
          {Icon && <Icon className="h-4 w-4 text-primary" aria-hidden="true" />}
          <span className="truncate">{title}</span>
        </h2>
        {subtitle && <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {linkTo && (
        <Link
          to={linkTo}
          className="flex shrink-0 items-center gap-0.5 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground transition hover:bg-accent"
        >
          {linkLabel}
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}