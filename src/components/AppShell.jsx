import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutGrid, Search, ShoppingBag, User, X } from "lucide-react";
import SiteLogo from "@/components/SiteLogo";
import BottomNav from "@/components/BottomNav";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/categories", label: "Categories" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function AppShell() {
  const { count } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [mobileSearch, setMobileSearch] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setMobileSearch(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 glass">
        <div className="mx-auto flex h-14 w-full max-w-[1240px] items-center gap-3 px-3 md:h-16 md:px-6">
          <SiteLogo />
          <form onSubmit={submit} className="hidden flex-1 items-center md:flex">
            <div className="relative w-full max-w-lg">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search templates, prompts, courses, tools…"
                aria-label="Search products"
                className="h-10 w-full rounded-full border border-border bg-white/80 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </form>
          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-3 py-1.5 text-[13px] font-semibold transition",
                    isActive ? "bg-secondary text-primary" : "text-slate-600 hover:bg-muted"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1.5 md:ml-0">
            <button
              type="button"
              onClick={() => setMobileSearch((v) => !v)}
              aria-label="Search"
              className="grid h-9 w-9 place-items-center rounded-xl text-slate-700 hover:bg-muted md:hidden"
            >
              {mobileSearch ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>
            <Link
              to="/cart"
              aria-label="Cart"
              className="relative grid h-9 w-9 place-items-center rounded-xl text-slate-700 hover:bg-muted"
            >
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>
            <Link
              to="/account"
              aria-label="Account"
              className="hidden h-9 w-9 place-items-center rounded-xl text-slate-700 hover:bg-muted md:grid"
            >
              <User className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              to="/categories"
              aria-label="Categories"
              className="hidden h-9 w-9 place-items-center rounded-xl text-slate-700 hover:bg-muted md:grid"
            >
              <LayoutGrid className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
        {mobileSearch && (
          <form onSubmit={submit} className="px-3 pb-2.5 md:hidden">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                aria-label="Search products"
                className="h-10 w-full rounded-full border border-border bg-white pl-10 pr-4 text-sm outline-none focus:border-primary"
              />
            </div>
          </form>
        )}
      </header>

      <main className="mx-auto w-full max-w-[1240px] flex-1 px-3 pb-24 pt-3 md:px-6 md:pb-14 md:pt-6">
        <Outlet />
      </main>

      <footer className="mt-4 border-t border-border bg-white pb-24 pt-8 md:pb-8">
        <div className="mx-auto grid w-full max-w-[1240px] gap-6 px-4 md:grid-cols-5 md:px-6">
          <div className="md:col-span-2">
            <SiteLogo />
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-muted-foreground">
              Gabru Education sells website templates, complete code files, AI prompt packs, courses,
              software tools and PDF books — with lifetime access after your payment is approved.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-foreground">Shop</h3>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li><Link to="/categories" className="hover:text-primary">All categories</Link></li>
              <li><Link to="/search?q=template" className="hover:text-primary">Website templates</Link></li>
              <li><Link to="/search?q=prompt" className="hover:text-primary">AI prompts</Link></li>
              <li><Link to="/blog" className="hover:text-primary">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-foreground">Help</h3>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li><Link to="/faq" className="hover:text-primary">FAQ</Link></li>
              <li><Link to="/orders" className="hover:text-primary">My orders</Link></li>
              <li><Link to="/library" className="hover:text-primary">My library</Link></li>
              <li><Link to="/refund-policy" className="hover:text-primary">Refund policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-foreground">Company</h3>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary">About us</Link></li>
              <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-primary">Privacy policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary">Terms of service</Link></li>
            </ul>
          </div>
        </div>
        <p className="mx-auto mt-6 w-full max-w-[1240px] px-4 text-[11px] text-muted-foreground md:px-6">
          © {new Date().getFullYear()} Gabru Education. All prices in INR.
        </p>
      </footer>

      <BottomNav />
    </div>
  );
}