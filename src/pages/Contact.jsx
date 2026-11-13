const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { CheckCircle2, Loader2, Mail, MessageCircle, Send } from "lucide-react";

import Seo from "@/components/Seo";
import { useSettings, whatsappLink } from "@/hooks/useSettings";
import { toast } from "@/components/ui/use-toast";
import { BRAND } from "@/lib/assets";

const SUBJECTS = [
  "Order or payment help",
  "Question about a product",
  "Custom development",
  "Partnership",
  "Something else",
];

const fieldClass =
  "h-10 w-full rounded-xl border border-border bg-white px-3 text-[13px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function Contact() {
  const settings = useSettings();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: SUBJECTS[0], message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));
  const wa = whatsappLink(settings.support_whatsapp, "Hi Gabru Education, I need help with my order.");

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: "Add your name, email and message", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      await db.entities.ContactMessage.create({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject,
        message: form.message.trim(),
      });
      setSent(true);
      toast({ title: "Message sent", description: "We reply on working days, usually within 24 hours." });
    } catch (error) {
      toast({ title: "Could not send", description: error.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="animate-tilt-in mx-auto max-w-2xl">
      <Seo
        title="Contact Gabru Education — Support, Orders & Custom Work"
        description="Contact Gabru Education for order and payment help, product questions or custom website and app development. Email, WhatsApp and contact form support on working days."
        keywords={["contact Gabru Education", "digital product support India", "website template support", "custom app development India"]}
        path="/contact"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact Gabru Education",
          url: `${BRAND.siteUrl}/contact`,
          mainEntity: {
            "@type": "Organization",
            name: BRAND.name,
            url: BRAND.siteUrl,
            logo: BRAND.logo,
            email: settings.support_email || "gabrueducation@gmail.com",
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "customer support",
              email: settings.support_email || "gabrueducation@gmail.com",
              telephone: settings.support_whatsapp ? `+91${String(settings.support_whatsapp).replace(/\D/g, "").slice(-10)}` : undefined,
              areaServed: "IN",
              availableLanguage: ["en", "hi", "pa"],
            },
          },
        }}
      />

      <h1 className="text-lg font-extrabold text-foreground md:text-2xl">Contact Gabru Education</h1>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
        Order or payment problem, product question, or need something built? Send a message and we reply
        on working days, usually within 24 hours.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 press3d"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-[12.5px] font-bold text-emerald-950">WhatsApp us</span>
              <span className="block truncate text-[11px] text-emerald-800">{settings.support_whatsapp}</span>
            </span>
          </a>
        )}
        {settings.support_email && (
          <a
            href={`mailto:${settings.support_email}`}
            className="flex items-center gap-2.5 rounded-2xl border border-border bg-white p-3 press3d"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
              <Mail className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-[12.5px] font-bold text-foreground">Email us</span>
              <span className="block truncate text-[11px] text-muted-foreground">{settings.support_email}</span>
            </span>
          </a>
        )}
      </div>

      {sent ? (
        <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" aria-hidden="true" />
          <h2 className="mt-2 text-sm font-bold text-emerald-950">Message received</h2>
          <p className="mx-auto mt-1 max-w-sm text-[12px] leading-relaxed text-emerald-800">
            Thanks {form.name.split(" ")[0] || "there"} — our team will reply to {form.email} on the next
            working day.
          </p>
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setForm({ name: "", email: "", phone: "", subject: SUBJECTS[0], message: "" });
            }}
            className="mt-3 rounded-xl border border-emerald-300 bg-white px-3 py-1.5 text-[11.5px] font-bold text-emerald-700"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-3 space-y-2.5 rounded-2xl border border-border bg-white p-3.5">
          <div className="grid gap-2.5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold text-foreground">Your name *</span>
              <input value={form.name} onChange={(e) => set({ name: e.target.value })} className={fieldClass} placeholder="Full name" />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold text-foreground">Email *</span>
              <input type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} className={fieldClass} placeholder="you@email.com" />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold text-foreground">WhatsApp number</span>
              <input value={form.phone} onChange={(e) => set({ phone: e.target.value })} className={fieldClass} placeholder="Optional" />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold text-foreground">Subject</span>
              <select value={form.subject} onChange={(e) => set({ subject: e.target.value })} className={fieldClass}>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold text-foreground">Message *</span>
            <textarea
              value={form.message}
              onChange={(e) => set({ message: e.target.value })}
              rows={5}
              className="w-full rounded-xl border border-border bg-white p-3 text-[13px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Tell us what you need — include your order number if it is about a payment."
            />
          </label>
          <button
            type="submit"
            disabled={sending}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-[12.5px] font-bold text-primary-foreground press3d disabled:opacity-60"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" aria-hidden="true" />}
            {sending ? "Sending…" : "Send message"}
          </button>
          <p className="text-center text-[10.5px] text-muted-foreground">
            By sending this form you agree to our privacy policy. We never share your details.
          </p>
        </form>
      )}
    </div>
  );
}