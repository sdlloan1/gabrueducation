const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IndianRupee, Package, Receipt, Star, TrendingUp } from "lucide-react";

import { inr, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, pending: 0, revenue: 0, reviews: 0, orders: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    Promise.all([
      db.entities.Product.count({ is_active: true }),
      db.entities.Order.count({ status: "pending" }),
      db.entities.Order.count({}),
      db.entities.Review.count({}),
    ])
      .then(([products, pending, orders, reviews]) =>
        setStats((prev) => ({ ...prev, products, pending, orders, reviews }))
      )
      .catch(() => {});

    db.entities.Order.aggregate({ query: { status: "confirmed" }, sum: ["total"] })
      .then((res) => {
        const row = res?.rows?.[0] || {};
        setStats((prev) => ({ ...prev, revenue: Number(row.sum_total) || 0 }));
      })
      .catch(() => {});

    db.entities.Order.filter({ status: "pending" }, { sort: "-created_date", limit: 6 })
      .then((page) => setRecent(page.items || []))
      .catch(() => setRecent([]));
  }, []);

  const cards = [
    { label: "Revenue (confirmed)", value: inr(stats.revenue), Icon: IndianRupee, tone: "bg-emerald-50 text-emerald-600" },
    { label: "Pending payments", value: stats.pending, Icon: Receipt, tone: "bg-amber-50 text-amber-600" },
    { label: "Total orders", value: stats.orders, Icon: TrendingUp, tone: "bg-blue-50 text-primary" },
    { label: "Live products", value: stats.products, Icon: Package, tone: "bg-slate-100 text-slate-600" },
    { label: "Reviews", value: stats.reviews, Icon: Star, tone: "bg-yellow-50 text-yellow-600" },
  ];

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-xl font-extrabold text-foreground">Dashboard</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">Store health at a glance.</p>
      </header>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-5">
        {cards.map(({ label, value, Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-border bg-white p-3">
            <span className={cn("grid h-8 w-8 place-items-center rounded-xl", tone)}>
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="mt-2 text-lg font-extrabold leading-none text-foreground">{value}</p>
            <p className="mt-1 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <section className="mt-5 rounded-2xl border border-border bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Payments waiting for approval</h2>
          <Link to="/admin/orders" className="text-[11px] font-bold text-primary">
            Review all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="rounded-xl bg-secondary p-3 text-[12px] text-secondary-foreground">
            Nothing pending — every payment has been reviewed.
          </p>
        ) : (
          <ul className="space-y-2">
            {recent.map((order) => (
              <li key={order.id}>
                <Link
                  to="/admin/orders"
                  className="flex items-center justify-between gap-2 rounded-xl border border-border p-2.5 hover:bg-muted"
                >
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-foreground">
                      {order.order_number} · {order.customer_name}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {formatDate(order.created_date)} · {(order.items || []).length} item(s)
                    </p>
                  </div>
                  <span className="shrink-0 text-[12px] font-extrabold text-foreground">{inr(order.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}