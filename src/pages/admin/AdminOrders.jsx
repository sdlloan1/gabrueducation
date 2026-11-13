const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Check, ExternalLink, Loader2, X } from "lucide-react";

import { Image } from "@/components/ui/image";
import { toast } from "@/components/ui/use-toast";
import { formatDate, inr, timeLeft } from "@/lib/format";
import { inputClass } from "@/components/admin/Field";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/useSettings";

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];

export default function AdminOrders() {
  const settings = useSettings();
  const [tab, setTab] = useState("pending");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [shots, setShots] = useState({});
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState("");

  const load = () => {
    setLoading(true);
    const query = tab === "all" ? {} : { status: tab };
    db.entities.Order.filter(query, { sort: "-created_date", limit: 60 })
      .then((page) => setOrders(page.items || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [tab]);

  const viewShot = async (order) => {
    if (shots[order.id]) return;
    try {
      const { signed_url } = await db.integrations.Core.CreateFileSignedUrl({
        file_uri: order.payment_screenshot_uri,
      });
      setShots((prev) => ({ ...prev, [order.id]: signed_url }));
    } catch (error) {
      toast({ title: "Could not open screenshot", description: error.message, variant: "destructive" });
    }
  };

  const approve = async (order) => {
    if (!window.confirm(`Approve payment of ${inr(order.total)} for ${order.order_number}? Downloads unlock immediately.`)) return;
    setBusyId(order.id);
    try {
      const res = await db.functions.invoke("confirmOrder", { order_id: order.id });
      if (res.data?.error) throw new Error(res.data.error);
      toast({ title: "Payment approved", description: "Buyer notified and files unlocked." });
      load();
    } catch (error) {
      toast({ title: "Approval failed", description: error.message, variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const reject = async () => {
    if (!reason.trim()) {
      toast({ title: "Tell the buyer why", description: "A reason is required.", variant: "destructive" });
      return;
    }
    setBusyId(rejecting.id);
    try {
      const res = await db.functions.invoke("rejectOrder", { order_id: rejecting.id, reason: reason.trim() });
      if (res.data?.error) throw new Error(res.data.error);
      toast({ title: "Payment rejected", description: "The buyer has been told why." });
      setRejecting(null);
      setReason("");
      load();
    } catch (error) {
      toast({ title: "Rejection failed", description: error.message, variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <header className="mb-3">
        <h1 className="text-xl font-extrabold text-foreground">Orders & payments</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Verify UPI screenshots, then approve to unlock lifetime downloads.
        </p>
      </header>

      <div className="mb-3 flex gap-1.5 overflow-x-auto no-scrollbar">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold transition",
              tab === item.key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white text-slate-600"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading && <div className="h-24 animate-pulse rounded-2xl border border-border bg-white" />}

      {!loading && orders.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border bg-white p-6 text-center text-xs text-muted-foreground">
          No {tab === "all" ? "" : tab} orders right now.
        </p>
      )}

      <div className="space-y-2.5">
        {orders.map((order) => {
          const deadline = new Date(new Date(order.created_date).getTime() + (settings.pending_hours || 24) * 3600000);
          return (
            <article key={order.id} className="rounded-2xl border border-border bg-white p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[12.5px] font-bold text-foreground">
                    {order.order_number} · {order.customer_name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {order.mobile} · {order.email}
                  </p>
                  <p className="text-[10.5px] text-muted-foreground">
                    {formatDate(order.created_date)}
                    {order.status === "pending" && ` · verify in ${timeLeft(deadline)}`}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-extrabold text-foreground">{inr(order.total)}</p>
                  <span
                    className={cn(
                      "mt-1 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase",
                      order.status === "confirmed" && "bg-emerald-50 text-emerald-600",
                      order.status === "pending" && "bg-amber-50 text-amber-600",
                      order.status === "rejected" && "bg-red-50 text-red-600"
                    )}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              <ul className="mt-2 space-y-1 border-t border-border pt-2">
                {(order.items || []).map((item) => (
                  <li key={item.product_id} className="flex justify-between gap-2 text-[11.5px]">
                    <span className="line-clamp-1 text-slate-600">
                      {item.title}
                      {item.option_label ? ` · ${item.option_label}` : ""}
                    </span>
                    <span className="shrink-0 font-semibold text-foreground">{inr(item.price)}</span>
                  </li>
                ))}
              </ul>

              {order.rejection_reason && (
                <p className="mt-2 rounded-lg bg-red-50 p-2 text-[11px] text-red-700">
                  Rejected: {order.rejection_reason}
                </p>
              )}

              {order.payment_screenshot_uri && (
                <div className="mt-2">
                  {shots[order.id] ? (
                    <a href={shots[order.id]} target="_blank" rel="noreferrer" className="block">
                      <Image src={shots[order.id]} alt="Payment screenshot" className="h-40 w-full rounded-xl border border-border object-contain" fittingType="fit" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => viewShot(order)}
                      className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-bold text-primary"
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> View payment screenshot
                    </button>
                  )}
                </div>
              )}

              {order.status === "pending" && (
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => approve(order)}
                    disabled={busyId === order.id}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2 text-[11px] font-bold text-white press3d disabled:opacity-60"
                  >
                    {busyId === order.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                    Approve & unlock
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRejecting(order);
                      setReason("");
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2 text-[11px] font-bold text-destructive"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" /> Reject
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 md:items-center md:p-4">
          <div className="w-full max-w-md rounded-t-3xl bg-white p-4 md:rounded-3xl">
            <h3 className="text-sm font-bold text-foreground">Reject {rejecting.order_number}</h3>
            <p className="mt-0.5 text-[11px] text-muted-foreground">The buyer sees this reason in their order and email.</p>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Payment not received for this UTR / screenshot unreadable"
              className={`${inputClass} mt-2 h-auto py-2`}
            />
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={reject} className="flex-1 rounded-xl bg-destructive py-2.5 text-xs font-bold text-destructive-foreground">
                Reject payment
              </button>
              <button
                type="button"
                onClick={() => setRejecting(null)}
                className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}