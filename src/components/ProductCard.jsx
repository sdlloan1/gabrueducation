import { Link } from "react-router-dom";
import { BadgeCheck, Flame, Plus, Tag } from "lucide-react";
import { Image } from "@/components/ui/image";
import Stars from "@/components/Stars";
import { useCart } from "@/context/CartContext";
import { discountPct, inr } from "@/lib/format";
import { cn } from "@/lib/utils";

const BADGES = {
  best_choice: { label: "Best Choice", className: "bg-primary text-primary-foreground", Icon: BadgeCheck },
  best_offer: { label: "Best Offer", className: "bg-emerald-500 text-white", Icon: Tag },
  trending: { label: "Trending", className: "bg-amber-500 text-white", Icon: Flame },
};

export default function ProductCard({ product, variant = "grid" }) {
  const { addItem, has } = useCart();
  const badge = BADGES[product.badge];
  const off = discountPct(product.original_price, product.discounted_price);
  const inCart = has(product.id);

  return (
    <div
      className={cn(
        "card3d group relative overflow-hidden rounded-2xl border border-border bg-card clay",
        variant === "strip" && "w-[162px] shrink-0 snap-item sm:w-[196px]"
      )}
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          <Image
            src={product.images?.[0]}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
          {badge && (
            <span
              className={cn(
                "absolute left-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-sm",
                badge.className
              )}
            >
              <badge.Icon className="h-3 w-3" aria-hidden="true" />
              {badge.label}
            </span>
          )}
          {off > 0 && (
            <span className="absolute right-2 top-2 rounded-full bg-white/95 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-600 shadow-sm">
              {off}% OFF
            </span>
          )}
        </div>
        <div className="p-3 pb-2">
          <h3 className="line-clamp-2 min-h-[34px] text-[13px] font-semibold leading-snug text-foreground">
            {product.title}
          </h3>
          <div className="mt-1.5 flex items-center gap-1.5">
            <Stars value={product.rating_avg} size={11} />
            <span className="text-[11px] font-semibold text-foreground">
              {Number(product.rating_avg || 0).toFixed(1)}
            </span>
            <span className="text-[11px] text-muted-foreground">({product.rating_count || 0})</span>
          </div>
        </div>
      </Link>
      <div className="flex items-center justify-between gap-1 px-3 pb-3">
        <div className="flex min-w-0 items-baseline gap-1.5">
          <span className="text-[15px] font-extrabold text-foreground">{inr(product.discounted_price)}</span>
          {Number(product.original_price) > Number(product.discounted_price) && (
            <span className="truncate text-[11px] text-muted-foreground line-through">
              {inr(product.original_price)}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => addItem(product)}
          aria-label={inCart ? "Already in cart" : `Add ${product.title} to cart`}
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-xl border text-primary press3d",
            inCart ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-border bg-secondary hover:bg-accent"
          )}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}