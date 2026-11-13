const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Check, Copy, Loader2, QrCode, ShieldCheck, Upload, X } from "lucide-react";

import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/hooks/useSettings";
import Seo from "@/components/Seo";
import { Image } from "@/components/ui/image";
import { toast } from "@/components/ui/use-toast";
import { inr } from "@/lib/format";

export default function Checkout() {
  const { user } = useAuth();
  const settings = useSettings();
  const { items, total, mrp, clearCart } = useCart();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.full_name || "");
  const [mobile, setMobile] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [copied, setCopied] = useState(false);

  const savings = Math.max(0, mrp - total);
  const balanceTotal = items.reduce((sum, i) => sum + (Number(i.balance_due) || 0), 0);
  const upiId = settings.upi_id || "";
  const orderNumber = `GE-${Date.now().toString().slice(-6)}`;
  const upiUri = upiId
    ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(settings.upi_name || "Gabru Education")}&am=${total}&cu=INR&tn=${encodeURIComponent(orderNumber)}`
    : "";
  const qrSrc = upiUri
    ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=8&data=${encodeURIComponent(upiUri)}`
    : "";

  const uploadScreenshot = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_uri } = await db.integrations.Core.UploadPrivateFile({ file });
      setScreenshot(file_uri);
      setPreview(URL.createObjectURL(file));
    } catch (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const placeOrder = async () => {
    if (!name.trim() || name.trim().length < 3) {
      toast({ title: "Enter your full name", variant: "destructive" });
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobile.replace(/\D/g, ""))) {
      toast({ title: "Enter a valid 10-digit mobile number", variant: "destructive" });
      return;
    }
    if (!screenshot) {
      toast({ title: "Upload your payment screenshot", description: "We verify every UPI payment manually.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const order = await db.entities.Order.create({
        order_number: orderNumber,
        user_id: user.id,
        customer_name: name.trim(),
        mobile: mobile.replace(/\D/g, ""),
        email: user.email,
        items: items.map((i) => ({
          product_id: i.product_id,
          title: i.title,
          slug: i.slug,
          image: i.image,
          price: Number(i.price) || 0,
          original_price: Number(i.original_price) || 0,
          option: i.option_key || "full",
          option_label: i.option_label || "",
          balance_due: Number(i.balance_due) || 0,
        })),
        total,
        mrp,
        payment_method: "upi",
        upi_id: upiId,
        payment_screenshot_uri: screenshot,
        status: "pending",
      });
      clearCart();
      navigate(`/order/${order.id}`, { replace: true });
    } catch (error) {
      toast({ title: "Could not place order", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-lg font-bold text-foreground">Your cart is empty</h1>
        <Link to="/categories" className="mt-3 inline-block rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-tilt-in">
      <Seo title="Checkout — Gabru Education" description="Complete your UPI payment to unlock your downloads." path="/checkout" />

      <h1 className="mb-3 text-xl font-extrabold text-foreground">Checkout</h1>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {/* Details */}
          <section className="rounded-2xl border border-border bg-white p-3.5">
            <h2 className="mb-2 text-sm font-bold text-foreground">1. Your details</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold text-muted-foreground">Full name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold text-muted-foreground">Mobile number</span>
                <input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit mobile"
                  className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-primary"
                />
              </label>
            </div>
            <p className="mt-2 text-[10.5px] text-muted-foreground">
              Downloads and the receipt go to <b>{user?.email}</b>.
            </p>
          </section>

          {/* UPI */}
          <section className="rounded-2xl border border-border bg-white p-3.5">
            <h2 className="mb-1 flex items-center gap-1.5 text-sm font-bold text-foreground">
              <QrCode className="h-4 w-4 text-primary" aria-hidden="true" /> 2. Pay {inr(total)} by UPI
            </h2>

            {upiId ? (
              <>
                <div className="mt-2 flex flex-col items-center gap-2 rounded-xl border border-border bg-slate-50 p-3">
                  <div className="rounded-xl bg-white p-1.5 shadow-sm">
                    <Image src={qrSrc} alt="UPI payment QR code" className="h-44 w-44 object-contain" fittingType="fit" />
                  </div>
                  <button
                    type="button"
                    onClick={copyUpi}
                    className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-1.5 text-[11px] font-bold text-foreground"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {upiId}
                  </button>
                  <p className="text-center text-[10.5px] text-muted-foreground">
                    Scan with any UPI app or pay to the ID above. Add order {orderNumber} in the note — then upload
                    your payment screenshot below.
                  </p>
                </div>

                <div className="mt-3">
                  <h3 className="mb-1.5 text-[12px] font-bold text-foreground">3. Upload payment screenshot</h3>
                  {preview ? (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2">
                      <Image src={preview} alt="Payment screenshot" className="h-14 w-14 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-emerald-800">Screenshot attached</p>
                        <p className="text-[10px] text-emerald-700">We verify within {settings.pending_hours || 24} hours.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPreview("");
                          setScreenshot(null);
                        }}
                        aria-label="Remove screenshot"
                        className="grid h-7 w-7 place-items-center rounded-lg bg-white text-slate-500"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-slate-50 p-3">
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      </span>
                      <span className="text-[11px] font-semibold text-foreground">
                        {uploading ? "Uploading…" : "Tap to upload your payment screenshot"}
                        <span className="mt-0.5 block text-[10px] font-normal text-muted-foreground">
                          JPG or PNG · stored privately
                        </span>
                      </span>
                      <input type="file" accept="image/*" className="hidden" onChange={uploadScreenshot} disabled={uploading} />
                    </label>
                  )}
                </div>
              </>
            ) : (
              <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-amber-50 p-2.5 text-[11px] font-semibold text-amber-800">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                UPI is not configured yet. Please contact support — payment details will appear here once the admin adds a UPI ID.
              </p>
            )}
          </section>

          <div className="rounded-2xl border border-border bg-white p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-[12px] font-bold text-foreground">Refund policy</h3>
                <p className="mt-0.5 text-[10.5px] text-muted-foreground">
                  {settings.refund_enabled
                    ? `Refundable within ${settings.refund_days || 0} day(s).`
                    : "All products are non-refundable by default."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPolicy((v) => !v)}
                aria-label="Read the refund policy"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border text-[11px] font-bold text-muted-foreground"
              >
                i
              </button>
            </div>
            {showPolicy && (
              <p className="mt-2 whitespace-pre-wrap rounded-xl bg-secondary p-2.5 text-[11.5px] leading-relaxed text-secondary-foreground">
                {settings.refund_policy}
              </p>
            )}
          </div>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-border bg-white p-3.5 lg:sticky lg:top-20">
          <h2 className="text-sm font-bold text-foreground">{items.length} item{items.length > 1 ? "s" : ""}</h2>
          <ul className="mt-2 space-y-1.5">
            {items.map((item) => (
              <li key={item.id || item.product_id} className="flex justify-between gap-2 text-[11.5px]">
                <span className="min-w-0">
                  <span className="line-clamp-2 text-slate-600">{item.title}</span>
                  {item.option_label && (
                    <span className="block text-[10px] font-semibold text-primary">{item.option_label}</span>
                  )}
                </span>
                <span className="shrink-0 font-semibold text-foreground">{inr(item.price)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 space-y-1 border-t border-border pt-2 text-[12px]">
            <div className="flex justify-between text-emerald-600">
              <span>You save</span>
              <span>-{inr(savings)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-foreground">
              <span>Total</span>
              <span>{inr(total)}</span>
            </div>
          </div>
          {balanceTotal > 0 && (
            <p className="mt-2 rounded-lg bg-amber-50 px-2 py-1.5 text-[10.5px] font-semibold text-amber-800">
              {inr(balanceTotal)} is payable after your website goes live (hire-developer balance).
            </p>
          )}

          <button
            type="button"
            onClick={placeOrder}
            disabled={submitting || !upiId}
            className="mt-3 w-full rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground press3d disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit payment proof"}
          </button>
          <p className="mt-2 flex items-start gap-1.5 text-[10px] text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" aria-hidden="true" />
            Your order stays <b>Pending</b> until the admin verifies the payment (usually within {settings.pending_hours || 24} hours).
          </p>
        </aside>
      </div>
    </div>
  );
}