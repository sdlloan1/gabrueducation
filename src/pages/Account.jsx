const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Bookmark,
  ChevronRight,
  Download,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Receipt,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { useAuth } from "@/lib/AuthContext";
import { useSettings, whatsappLink } from "@/hooks/useSettings";
import Seo from "@/components/Seo";

const MENU = [
  { to: "/orders", label: "My orders", Icon: Receipt },
  { to: "/library", label: "My library", Icon: Download },
  { to: "/saved", label: "Saved products", Icon: Bookmark },
  { to: "/notifications", label: "Notifications", Icon: Bell },
  { to: "/refund-policy", label: "Refund policy", Icon: ShieldCheck },
];

export default function Account() {
  const { user, logout } = useAuth();
  const settings = useSettings();
  const [stats, setStats] = useState({ orders: 0, purchases: 0 });

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      db.entities.Order.count({ user_id: user.id }),
      db.entities.Purchase.count({ user_id: user.id }),
    ])
      .then(([orders, purchases]) => setStats({ orders, purchases }))
      .catch(() => {});
  }, [user?.id]);

  const initials = String(user?.full_name || user?.email || "G")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const support = whatsappLink(settings.support_whatsapp, "Hi Gabru Education, I need help with my account.");

  return (
    <div className="animate-tilt-in">
      <Seo title="My account — Gabru Education" description="Manage your orders, downloads and saved products." path="/account" />

      <div className="rounded-3xl border border-border bg-gradient-to-br from-primary to-blue-500 p-4 text-white">
        <div className="flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20 text-lg font-extrabold backdrop-blur">
            {initials}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-base font-extrabold">{user?.full_name || "Gabru member"}</h1>
            <p className="truncate text-[11px] text-white/80">{user?.email}</p>
            {user?.role === "admin" && (
              <span className="mt-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                Admin
              </span>
            )}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { label: "Orders", value: stats.orders },
            { label: "Owned products", value: stats.purchases },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white/15 p-2.5 text-center backdrop-blur">
              <p className="text-lg font-extrabold">{stat.value}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/80">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <nav className="mt-3 overflow-hidden rounded-2xl border border-border bg-white">
        {MENU.map(({ to, label, Icon }, index) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-2.5 px-3.5 py-3 text-[13px] font-semibold text-foreground hover:bg-muted ${
              index > 0 ? "border-t border-border" : ""
            }`}
          >
            <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="flex-1">{label}</span>
            <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
          </Link>
        ))}
        {support && (
          <a
            href={support}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 border-t border-border px-3.5 py-3 text-[13px] font-semibold text-emerald-700 hover:bg-emerald-50"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            <span className="flex-1">Chat on WhatsApp</span>
            <ChevronRight className="h-4 w-4 text-emerald-500" aria-hidden="true" />
          </a>
        )}
        {user?.role === "admin" && (
          <Link
            to="/admin"
            className="flex items-center gap-2.5 border-t border-border px-3.5 py-3 text-[13px] font-semibold text-primary hover:bg-secondary"
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            <span className="flex-1">Admin panel</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </nav>

      <div className="mt-3 rounded-2xl border border-border bg-white p-3.5">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-[11.5px] leading-relaxed text-slate-600">
            Every purchase is lifetime access — download again any time, no re-payment. Files unlock
            automatically once the admin approves your UPI payment.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => logout()}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-border bg-white py-3 text-[13px] font-bold text-destructive"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
      </button>
    </div>
  );
}