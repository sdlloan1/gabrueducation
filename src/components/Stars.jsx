import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Stars({ value = 0, size = 12, className, showValue = false, count }) {
  const rounded = Math.round(Number(value) || 0);
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="inline-flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className={i <= rounded ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}
            aria-hidden="true"
          />
        ))}
      </span>
      {showValue && (
        <span className="text-[11px] font-semibold text-foreground">
          {Number(value || 0).toFixed(1)}
          {count !== undefined && <span className="font-normal text-muted-foreground"> ({count})</span>}
        </span>
      )}
      <span className="sr-only">{rounded} out of 5 stars</span>
    </span>
  );
}