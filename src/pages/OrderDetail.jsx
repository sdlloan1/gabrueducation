const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, Clock, Download, Loader2, XCircle } from "lucide-react";

import { useSettings } from "@/hooks/useSettings";
import Seo from "@/components/Seo";
import { Image } from "@/components/ui/image";
import { formatDate, inr, timeLeft } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function OrderDetail() {
  const { id } = useParams();
  const settings = useSettings();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    db.entities.Order.get(id)
      .then((record) => {
        if (!alive) return;
        setOrder(record);
        if (record?.payment_screenshot_uri) {
          db.integrations.Core.CreateFileSignedUrl({ file_uri: record.payment_screenshot_uri })
            .then((res) => alive && setScreenshotUrl(res?.signed_url || ""))
            .catch(() => {});
        }
      })
      .catch(() => alive && setOrder(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-lg font-bold text-foreground">Order not found</h1>
        <Link to="/orders" className="mt-3 inline-block rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">
          My orders
        </Link>
      </div>
    );
  }

  const deadline = new Date(new Date(order.created_date).getTime() + (settings.pending_hours || 24) * 3600000);

  const banners = {
    pending: {
      Icon: Clock,
      className: "border-amber-200 bg-amber-50 text-amber-900",
      title: "Payment pending verification",
      body: `Our team verifies UPI payments within ${settings.pending_hours || 24} hours. Time left: ${timeLeft(deadline)}.`,
    },
    confirmed: {
      Icon: CheckCircle2,
      className: "border-emerald-200 bg-emerald-50 text-emerald-900",
      title: "Payment approved",
      body: "Your files are unlocked for life in My Library.",
    },
    rejected: {
      Icon: XCircle,
      className: "border-red-200 bg-red-50 text-red-900",
      title: "Payment could not be verified",
      body: order.rejection_reason || "Please contact support for details.",
    },
  };
  const banner = banners[order.status] || banners.pending;

  return (
    <div className="animate-tilt-in">
      <Seo title={`Order ${order.order_number || ""} — Gabru Education`} description="Order status and payment verification." path={`/order/${id}`} />

      <Link to="/orders" className="mb-2 inline-block text-xs font-semibold text-primary">
        ← All orders
      </Link>

      <div className={cn("rounded-2xl border p-3.5", banner.className)}>
        <div className="flex items-start gap-2">
          <banner.Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <h1 className="text-sm font-extrabold">{banner.title}</h1>
            <p className="mt-0.5 text-[11.5px] leading-relaxed">{banner.body}</p>
            {order.status === "confirmed" && (
              <Link
                to="/library"
                className="mt-2 inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white press3d"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" /> Open My Library
              </Link>
            )}
          </div>
        </div>
      </div>

      <section className="mt-3 rounded-2xl border border-border bg-white p-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">{order.order_number}</h2>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase text-secondary-foreground">
            {order.status}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">Placed {formatDate(order.created_date)}</p>

        <ul className="mt-3 space-y-2">
          {(order.items || []).map((item) => (
            <li key={item.product_id} className="flex items-center gap-2">
              <Link to={`/product/${item.slug}`} className="h-12 w-14 shrink-0 overflow-hidden rounded-lg bg-secondary">
                <Image src={item.image} alt={item.title} className="h-full w-full object-cover" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link to={`/product/${item.slug}`} className="line-clamp-2 text-[12px] font-semibold text-foreground">
                  {item.title}
                </Link>
                <span className="text-[11px] text-muted-foreground">
                  {inr(item.price)}
                  {item.option_label ? ` · ${item.option_label}` : ""}
                </span>
              </div>
            </li>
          ))}
        </ul>

        <dl className="mt-3 space-y-1 border-t border-border pt-2 text-[11.5px]">
          <div className="flex justify-between text-slate-600">
            <dt>Customer</dt>
            <dd className="font-semibold text-foreground">{order.customer_name}</dd>
          </div>
          <div className="flex justify-between text-slate-600">
            <dt>Mobile</dt>
            <dd className="font-semibold text-foreground">{order.mobile}</dd>
          </div>
          <div className="flex justify-between text-slate-600">
            <dt>Payment</dt>
            <dd className="font-semibold text-foreground">UPI · {order.upi_id || "—"}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-1.5 text-sm font-extrabold text-foreground">
            <dt>Total paid</dt>
            <dd>{inr(order.total)}</dd>
          </div>
        </dl>
      </section>

      {screenshotUrl && (
        <section className="mt-3 rounded-2xl border border-border bg-white p-3">
          <h2 className="mb-2 text-[12px] font-bold text-foreground">Your payment screenshot</h2>
          <a href={screenshotUrl} target="_blank" rel="noreferrer">
            <Image src={screenshotUrl} alt="Payment screenshot" className="h-40 w-full rounded-xl object-contain" fittingType="fit" />
          </a>
        </section>
      )}

      {order.status === "pending" && (
        <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-secondary p-2.5 text-[11px] text-secondary-foreground">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          You&apos;ll get an in-app notification and an email the moment your payment is approved.
        </p>
      )}
    </div>
  );
}