const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Receipt } from "lucide-react";

import { useAuth } from "@/lib/AuthContext";
import EmptyState from "@/components/EmptyState";
import Seo from "@/components/Seo";
import { formatDate, inr } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS = {
  pending: { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200" },
  confirmed: { label: "Confirmed", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rejected", className: "bg-red-50 text-red-700 border-red-200" },
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    db.entities.Order.filter({ user_id: user.id }, { sort: "-created_date", limit: 30 })
      .then((page) => setOrders(page.items || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  return (
    <div className="animate-tilt-in">
      <Seo title="My orders — Gabru Education" description="Track your Gabru Education orders and payment verification." path="/orders" />
      <h1 className="mb-3 text-xl font-extrabold text-foreground">My orders</h1>

      {loading && <div className="h-24 animate-pulse rounded-2xl border border-border bg-white" />}

      {!loading && orders.length === 0 && (
        <EmptyState
          icon={Receipt}
          title="No orders yet"
          description="Once you buy a product, your order and its verification status appear here."
          action={
            <Link to="/categories" className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground press3d">
              Start shopping
            </Link>
          }
        />
      )}

      <div className="space-y-2.5">
        {orders.map((order) => {
          const status = STATUS[order.status] || STATUS.pending;
          return (
            <Link
              key={order.id}
              to={`/order/${order.id}`}
              className="card3d flex items-center gap-3 rounded-2xl border border-border bg-white p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-foreground">{order.order_number || "Order"}</span>
                  <span className={cn("rounded-full border px-1.5 py-0.5 text-[9.5px] font-bold uppercase", status.className)}>
                    {status.label}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {(order.items || []).map((i) => i.title).join(" · ")}
                </p>
                <p className="mt-0.5 text-[10.5px] text-muted-foreground">
                  {formatDate(order.created_date)} · {inr(order.total)}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}