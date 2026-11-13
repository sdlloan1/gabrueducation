const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Image } from "@/components/ui/image";
import ImageUploader from "@/components/admin/ImageUploader";
import { AdminCard, Field, Toggle, inputClass } from "@/components/admin/Field";
import { toast } from "@/components/ui/use-toast";

const EMPTY = { title: "", subtitle: "", badge: "", cta_label: "Shop now", link: "/categories", image_url: [], sort_order: 0, is_active: true };

export default function AdminBanners() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    db.entities.Banner.filter({}, { sort: "sort_order", limit: 30 })
      .then((page) => setItems(page.items || []))
      .catch(() => setItems([]));
  };

  useEffect(load, []);

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const save = async () => {
    if (!form.title.trim()) {
      toast({ title: "Add a banner title", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle,
        badge: form.badge,
        cta_label: form.cta_label,
        link: form.link,
        image_url: form.image_url?.[0] || "",
        sort_order: Number(form.sort_order) || 0,
        is_active: Boolean(form.is_active),
      };
      if (editingId) await db.entities.Banner.update(editingId, payload);
      else await db.entities.Banner.create(payload);
      toast({ title: editingId ? "Banner updated" : "Banner added" });
      setForm(EMPTY);
      setEditingId(null);
      load();
    } catch (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const edit = (banner) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      badge: banner.badge || "",
      cta_label: banner.cta_label || "Shop now",
      link: banner.link || "/categories",
      image_url: banner.image_url ? [banner.image_url] : [],
      sort_order: banner.sort_order || 0,
      is_active: banner.is_active !== false,
    });
  };

  const remove = async (banner) => {
    if (!window.confirm(`Delete “${banner.title}”?`)) return;
    await db.entities.Banner.delete(banner.id);
    load();
    toast({ title: "Banner deleted" });
  };

  return (
    <div className="space-y-3">
      <header>
        <h1 className="text-xl font-extrabold text-foreground">Home banners</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">The carousel at the top of the storefront.</p>
      </header>

      <AdminCard title={editingId ? "Edit banner" : "Add a banner"}>
        <div className="grid gap-2.5 md:grid-cols-2">
          <Field label="Title">
            <input value={form.title} onChange={(e) => set({ title: e.target.value })} className={inputClass} placeholder="Up to 70% off template bundles" />
          </Field>
          <Field label="Badge">
            <input value={form.badge} onChange={(e) => set({ badge: e.target.value })} className={inputClass} placeholder="Limited time" />
          </Field>
          <Field label="Subtitle" className="md:col-span-2">
            <input value={form.subtitle} onChange={(e) => set({ subtitle: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Button label">
            <input value={form.cta_label} onChange={(e) => set({ cta_label: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Link" hint="e.g. /category/website-templates or /search?q=offer">
            <input value={form.link} onChange={(e) => set({ link: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Sort order">
            <input type="number" value={form.sort_order} onChange={(e) => set({ sort_order: e.target.value })} className={inputClass} />
          </Field>
          <div className="flex items-end pb-1">
            <Toggle checked={form.is_active} onChange={(is_active) => set({ is_active })} label="Active" />
          </div>
          <div className="md:col-span-2">
            <ImageUploader value={form.image_url} onChange={(image_url) => set({ image_url })} max={1} label="Banner artwork" />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground press3d disabled:opacity-60"
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> {editingId ? "Save banner" : "Add banner"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(EMPTY);
              }}
              className="rounded-xl border border-border bg-white px-4 py-2 text-xs font-bold text-slate-600"
            >
              Cancel
            </button>
          )}
        </div>
      </AdminCard>

      <div className="space-y-2">
        {items.map((banner) => (
          <div key={banner.id} className="flex items-center gap-3 rounded-2xl border border-border bg-white p-2.5">
            <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
              {banner.image_url && <Image src={banner.image_url} alt={banner.title} className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-[12.5px] font-bold text-foreground">{banner.title}</p>
              <p className="text-[10.5px] text-muted-foreground">
                {banner.link} · order {banner.sort_order || 0} · {banner.is_active === false ? "Hidden" : "Active"}
              </p>
            </div>
            <button type="button" onClick={() => edit(banner)} className="rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-bold text-primary">
              Edit
            </button>
            <button
              type="button"
              onClick={() => remove(banner)}
              aria-label="Delete banner"
              className="grid h-8 w-8 place-items-center rounded-lg border border-border text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}