import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/assets";

export default function SiteLogo({ className, compact = false }) {
  return (
    <Link to="/" className={cn("group flex items-center gap-2.5", className)} aria-label={`${BRAND.name} home`}>
      <img
        src={BRAND.logoSmall}
        alt={`${BRAND.name} logo`}
        width="36"
        height="36"
        className="h-9 w-9 shrink-0 rounded-[11px] object-contain shadow-sm"
      />
      {!compact && (
        <span className="leading-none">
          <span className="block whitespace-nowrap font-heading text-[16px] font-extrabold tracking-tight text-foreground md:text-[17px]">
            Gabru Education
          </span>
          <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Digital Store
          </span>
        </span>
      )}
    </Link>
  );
}