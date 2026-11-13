const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";

import { AdminCard, Field, Toggle, inputClass, textareaClass } from "@/components/admin/Field";
import { DEFAULT_SETTINGS } from "@/hooks/useSettings";
import { toast } from "@/components/ui/use-toast";

export default function AdminSettings() {
  const [form, setForm] = useState(DEFAULT_SETTINGS);
  const [recordId, setRecordId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    db.entities.SiteSettings.filter({ key: "main" })
      .then((rows) => {
        const record = Array.isArray(rows) ? rows[0] : null;
        if (record) {
          setRecordId(record.id);
          setForm({ ...DEFAULT_SETTINGS, ...record });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        key: "main",
        brand_name: form.brand_name,
        tagline: form.tagline,
        upi_id: form.upi_id,
        upi_name: form.upi_name,
        support_whatsapp: form.support_whatsapp,
        support_email: form.support_email,
        refund_enabled: Boolean(form.refund_enabled),
        refund_days: Number(form.refund_days) || 0,
        refund_policy: form.refund_policy,
        pending_hours: Number(form.pending_hours) || 24,
      };
      if (recordId) await db.entities.SiteSettings.update(recordId, payload);
      else {
        const created = await db.entities.SiteSettings.create(payload);
        setRecordId(created?.id || null);
      }
      toast({ title: "Settings saved" });
    } catch (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-16">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-foreground">Store settings</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">Payment details, support contacts and refund rules.</p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground press3d disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" aria-hidden="true" />}
          Save
        </button>
      </header>

      <AdminCard title="UPI payment" description="Buyers scan this QR and upload their screenshot — you approve each payment.">
        <div className="grid gap-2.5 md:grid-cols-2">
          <Field label="UPI ID">
            <input value={form.upi_id} onChange={(e) => set({ upi_id: e.target.value })} className={inputClass} placeholder="gabrueducation@upi" />
          </Field>
          <Field label="UPI payee name">
            <input value={form.upi_name} onChange={(e) => set({ upi_name: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Verification window (hours)">
            <input type="number" value={form.pending_hours} onChange={(e) => set({ pending_hours: e.target.value })} className={inputClass} />
          </Field>
        </div>
      </AdminCard>

      <AdminCard title="Brand & support">
        <div className="grid gap-2.5 md:grid-cols-2">
          <Field label="Brand name">
            <input value={form.brand_name} onChange={(e) => set({ brand_name: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Tagline">
            <input value={form.tagline} onChange={(e) => set({ tagline: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Support WhatsApp" hint="10-digit number or with country code">
            <input value={form.support_whatsapp} onChange={(e) => set({ support_whatsapp: e.target.value })} className={inputClass} placeholder="919876543210" />
          </Field>
          <Field label="Support email">
            <input value={form.support_email} onChange={(e) => set({ support_email: e.target.value })} className={inputClass} placeholder="support@gabrueducation.com" />
          </Field>
        </div>
      </AdminCard>

      <AdminCard title="Refunds">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-end gap-2">
            <Toggle checked={form.refund_enabled} onChange={(refund_enabled) => set({ refund_enabled })} label="Refunds enabled" />
            <Field label="Refund window (days)" className="w-40">
              <input type="number" value={form.refund_days} onChange={(e) => set({ refund_days: e.target.value })} className={inputClass} />
            </Field>
          </div>
          <Field label="Refund policy text" hint="Shown on the product page and refund page">
            <textarea rows={6} value={form.refund_policy} onChange={(e) => set({ refund_policy: e.target.value })} className={textareaClass} />
          </Field>
        </div>
      </AdminCard>
    </div>
  );
}