import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { Image } from "@/components/ui/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/lib/AuthContext";
import EmptyState from "@/components/EmptyState";
import Seo from "@/components/Seo";
import { discountPct, inr } from "@/lib/format";

export default function Cart() {
  const { items, total, mrp, removeItem, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const savings = Math.max(0, mrp - total);

  const goToCheckout = () => {
    if (!isAuthenticated) {
      navigate(`/login?returnTo=${encodeURIComponent("/checkout")}`);
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className="animate-tilt-in">
      <Seo title="Your cart — Gabru Education" description="Review the digital products in your cart." path="/cart" />

      <header className="mb-3 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-foreground">Your cart</h1>
        {items.length > 0 && (
          <button type="button" onClick={clearCart} className="text-[11px] font-semibold text-destructive">
            Clear all
          </button>
        )}
      </header>

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Add a template, prompt pack or course to get started."
          action={
            <Link to="/categories" className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground press3d">
              Browse products
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-2.5">
            {items.map((item) => (
              <div key={item.id || item.product_id} className="flex gap-3 rounded-2xl border border-border bg-white p-2.5">
                <Link to={`/product/${item.slug}`} className="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary">
                  <Image src={item.image} alt={item.title} className="h-full w-full object-cover" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/product/${item.slug}`} className="line-clamp-2 text-[13px] font-semibold text-foreground">
                    {item.title}
                  </Link>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-sm font-extrabold text-foreground">{inr(item.price)}</span>
                    {item.original_price > item.price && (
                      <span className="text-[11px] text-muted-foreground line-through">{inr(item.original_price)}</span>
                    )}
                    {discountPct(item.original_price, item.price) > 0 && (
                      <span className="text-[10px] font-bold text-emerald-600">
                        {discountPct(item.original_price, item.price)}% off
                      </span>
                    )}
                  </div>
                  {item.option_label && (
                    <p className="mt-0.5 text-[10.5px] font-semibold text-primary">{item.option_label}</p>
                  )}
                  <p className="mt-0.5 text-[10.5px] text-muted-foreground">
                    {item.balance_due > 0
                      ? `${inr(item.balance_due)} after deployment`
                      : "Lifetime access · digital delivery"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id || item.product_id)}
                  aria-label={`Remove ${item.title}`}
                  className="grid h-8 w-8 shrink-0 place-items-center self-start rounded-lg text-slate-400 hover:bg-muted hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-white p-3.5 lg:sticky lg:top-20">
            <h2 className="text-sm font-bold text-foreground">Order summary</h2>
            <dl className="mt-2 space-y-1.5 text-[12px]">
              <div className="flex justify-between text-slate-600">
                <dt>MRP</dt>
                <dd>{inr(mrp)}</dd>
              </div>
              <div className="flex justify-between text-emerald-600">
                <dt>You save</dt>
                <dd>-{inr(savings)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-sm font-extrabold text-foreground">
                <dt>Total</dt>
                <dd>{inr(total)}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={goToCheckout}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground press3d"
            >
              Proceed to checkout
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <p className="mt-2 text-center text-[10.5px] text-muted-foreground">
              Pay by UPI · files unlock after approval
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}