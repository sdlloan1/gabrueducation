import { Link } from "react-router-dom";
import { Check, Download, ShoppingBag, Zap } from "lucide-react";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function ProductOptions({
  options,
  selectedKey,
  onSelect,
  ownedOptions = [],
  inCart,
  mrp = 0,
  onBuyNow,
  onAddToCart,
  onShowPolicy,
}) {
  const selected = options.find((o) => o.key === selectedKey) || options[0];
  const isOwned = (key) => ownedOptions.includes(key) || ownedOptions.includes("full");
  const selectedOwned = isOwned(selected.key);
  const multi = options.length > 1;
  const showMrp = !multi && Number(mrp) > Number(selected.payNow);

  return (
    <div className="mt-3">
      {multi && (
        <div className="space-y-2">
          {options.map((option) => {
            const active = option.key === selected.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => onSelect(option.key)}
                aria-pressed={active}
                className={cn(
                  "w-full rounded-2xl border p-2.5 text-left transition press3d",
                  active ? "border-primary bg-secondary/70 ring-1 ring-primary/25" : "border-border bg-white"
                )}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={cn(
                      "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border",
                      active ? "border-primary bg-primary text-primary-foreground" : "border-slate-300 bg-white"
                    )}
                  >
                    {active && <Check className="h-2.5 w-2.5" aria-hidden="true" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                      <span className="min-w-0 break-words text-[12.5px] font-bold leading-snug text-foreground">{option.label}</span>
                      <span className="shrink-0 whitespace-nowrap text-[13px] font-extrabold text-foreground">{inr(option.payNow)}</span>
                    </div>
                    <p className="mt-0.5 text-[10.5px] text-muted-foreground">{option.tagline}</p>
                    {option.balance > 0 && (
                      <p className="mt-0.5 text-[10px] font-semibold text-amber-700">
                        {inr(option.balance)} after the site goes live
                      </p>
                    )}
                    {isOwned(option.key) && (
                      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600">Owned</p>
                    )}
                  </div>
                </div>
                {active && option.benefits.length > 0 && (
                  <ul className="mt-1.5 space-y-1 pl-6">
                    {option.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-1.5 break-words text-[10.5px] text-slate-600">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" aria-hidden="true" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-2 rounded-2xl border border-border bg-white p-3">
        <div className="flex flex-wrap items-end gap-2">
          <span className="text-2xl font-extrabold text-foreground">{inr(selected.payNow)}</span>
          {showMrp && <span className="text-sm text-muted-foreground line-through">{inr(mrp)}</span>}
          {multi && (
            <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-secondary-foreground">
              {selected.label}
            </span>
          )}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Zap className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
          {selected.balance > 0
            ? `Pay ${inr(selected.payNow)} now · ${inr(selected.balance)} once it's live`
            : "Lifetime access · files unlock after payment approval"}
          {onShowPolicy && (
            <button
              type="button"
              onClick={onShowPolicy}
              aria-label="Refund policy"
              className="grid h-4 w-4 place-items-center rounded-full border border-border text-[9px] font-bold text-muted-foreground"
            >
              i
            </button>
          )}
        </div>
      </div>

      <div className="mt-2.5 flex gap-2">
        {selectedOwned ? (
          <Link
            to="/library"
            className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 text-xs font-bold text-white press3d"
          >
            <Download className="h-4 w-4" aria-hidden="true" /> Open in my library
          </Link>
        ) : (
          <>
            <button
              type="button"
              onClick={onBuyNow}
              className="h-11 flex-1 rounded-xl bg-primary text-xs font-bold text-primary-foreground press3d"
            >
              Buy now
            </button>
            <button
              type="button"
              onClick={onAddToCart}
              className={cn(
                "flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border text-xs font-bold press3d",
                inCart ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-border bg-white text-primary"
              )}
            >
              <ShoppingBag className="h-4 w-4 shrink-0" aria-hidden="true" />
              {inCart ? "In cart" : "Add to cart"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}