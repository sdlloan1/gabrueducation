import { NavLink } from "react-router-dom";
import { Bell, Home, LayoutGrid, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/categories", label: "Categories", Icon: LayoutGrid },
  { to: "/notifications", label: "Alerts", Icon: Bell },
  { to: "/account", label: "Account", Icon: User },
  { to: "/cart", label: "Cart", Icon: ShoppingBag, isCart: true },
];

export default function BottomNav() {
  const { count } = useCart();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-white/95 backdrop-blur-xl md:hidden">
      <ul className="safe-bottom mx-auto flex h-16 max-w-md items-stretch justify-between px-2">
        {ITEMS.map(({ to, label, Icon, isCart }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "relative flex flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition-colors",
                  isActive ? "text-primary" : "text-slate-500 hover:text-slate-800"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "relative grid h-8 w-12 place-items-center rounded-xl transition-all",
                      isActive ? "bg-secondary shadow-[inset_0_-2px_0_rgba(37,99,235,0.15)]" : "bg-transparent"
                    )}
                  >
                    <Icon className="h-[19px] w-[19px]" aria-hidden="true" />
                    {isCart && count > 0 && (
                      <span className="absolute right-2.5 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                        {count}
                      </span>
                    )}
                  </span>
                  <span className="leading-none">{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}