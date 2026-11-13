import { Link } from "react-router-dom";
import { ChevronLeft, Clock, ShieldCheck } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import Seo from "@/components/Seo";

export default function RefundPolicy() {
  const settings = useSettings();

  return (
    <div className="animate-tilt-in mx-auto max-w-2xl">
      <Seo
        title="Refund policy — Gabru Education"
        description="How refunds work for digital products bought on Gabru Education."
        path="/refund-policy"
      />
      <Link to="/" className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to store
      </Link>

      <div className="rounded-2xl border border-border bg-white p-4">
        <h1 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" /> Refund policy
        </h1>
        <p className="mt-2 flex items-center gap-1.5 rounded-xl bg-secondary p-2.5 text-[12px] font-semibold text-secondary-foreground">
          <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {settings.refund_enabled
            ? `Refunds are accepted within ${settings.refund_days || 0} day(s) of purchase.`
            : "All products are non-refundable by default."}
        </p>
        <div className="mt-3 whitespace-pre-wrap text-[13px] leading-relaxed text-slate-600">
          {settings.refund_policy}
        </div>
        <p className="mt-4 text-[11.5px] text-muted-foreground">
          Questions about a payment? Message our team on WhatsApp from the account page — we reply on working days.
        </p>
      </div>
    </div>
  );
}