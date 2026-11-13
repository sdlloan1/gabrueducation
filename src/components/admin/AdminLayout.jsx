import { NavLink, Link, Outlet, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Image as ImageIcon,
  LayoutDashboard,
  MessageSquareQuote,
  Package,
  Receipt,
  Settings,
  Tags,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/admin", label: "Dashboard", Icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", Icon: Package },
  { to: "/admin/orders", label: "Orders", Icon: Receipt },
  { to: "/admin/categories", label: "Categories", Icon: Tags },
  { to: "/admin/reviews", label: "Reviews", Icon: MessageSquareQuote },
  { to: "/admin/blog", label: "Blog", Icon: BookOpen },
  { to: "/admin/banners", label: "Banners", Icon: ImageIcon },
  { to: "/admin/settings", label: "Settings", Icon: Settings },
];

export default function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();

  if (user && user.role !== "admin") {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-center">
        <div>
          <h1 className="text-xl font-bold text-foreground">Admins only</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            This area manages the store. Your account doesn&apos;t have admin access.
          </p>
          <Link to="/" className="mt-4 inline-block rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Back to store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="border-b border-border bg-white lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-sm font-bold text-foreground">
            <ArrowLeft className="h-4 w-4 text-primary" aria-hidden="true" />
            Gabru Admin
          </Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 no-scrollbar lg:flex-col lg:overflow-visible">
          {LINKS.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold transition",
                  isActive ? "bg-primary text-primary-foreground" : "text-slate-600 hover:bg-muted"
                )
              }
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main key={location.pathname} className="min-w-0 flex-1 px-3 py-4 md:px-6 md:py-6">
        <Outlet />
      </main>
    </div>
  );
}