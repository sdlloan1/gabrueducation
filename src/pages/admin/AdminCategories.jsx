const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Image } from "@/components/ui/image";
import ImageUploader from "@/components/admin/ImageUploader";
import { AdminCard, Field, Toggle, inputClass } from "@/components/admin/Field";
import { toast } from "@/components/ui/use-toast";
import { slugify } from "@/lib/format";

const EMPTY = { name: "", slug: "", description: "", image_url: [], sort_order: 0, is_active: true };

export default function AdminCategories() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    db.entities.Category.filter({}, { sort: "sort_order", limit: 50 })
      .then((page) => setItems(page.items || []))
      .catch(() => setItems([]));
  };

  useEffect(load, []);

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const save = async () => {
    if (!form.name.trim()) {
      toast({ title: "Category name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug?.trim() ? slugify(form.slug) : slugify(form.name),
        description: form.description,
        image_url: form.image_url?.[0] || "",
        sort_order: Number(form.sort_order) || 0,
        is_active: Boolean(form.is_active),
      };
      if (editingId) await db.entities.Category.update(editingId, payload);
      else await db.entities.Category.create(payload);
      toast({ title: editingId ? "Category updated" : "Category added" });
      setForm(EMPTY);
      setEditingId(null);
      load();
    } catch (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const edit = (category) => {
    setEditingId(category.id);
    setForm({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      image_url: category.image_url ? [category.image_url] : [],
      sort_order: category.sort_order || 0,
      is_active: category.is_active !== false,
    });
  };

  const remove = async (category) => {
    if (!window.confirm(`Delete “${category.name}”?`)) return;
    await db.entities.Category.delete(category.id);
    load();
    toast({ title: "Category deleted" });
  };

  return (
    <div className="space-y-3">
      <header>
        <h1 className="text-xl font-extrabold text-foreground">Categories</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">Change names, images and order of the storefront categories.</p>
      </header>

      <AdminCard title={editingId ? "Edit category" : "Add a category"}>
        <div className="grid gap-2.5 md:grid-cols-2">
          <Field label="Name">
            <input value={form.name} onChange={(e) => set({ name: e.target.value })} className={inputClass} placeholder="Website Templates" />
          </Field>
          <Field label="Slug">
            <input value={form.slug} onChange={(e) => set({ slug: e.target.value })} className={inputClass} placeholder="website-templates" />
          </Field>
          <Field label="Description" className="md:col-span-2">
            <input value={form.description} onChange={(e) => set({ description: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Sort order">
            <input type="number" value={form.sort_order} onChange={(e) => set({ sort_order: e.target.value })} className={inputClass} />
          </Field>
          <div className="flex items-end pb-1">
            <Toggle checked={form.is_active} onChange={(is_active) => set({ is_active })} label="Visible in store" />
          </div>
          <div className="md:col-span-2">
            <ImageUploader value={form.image_url} onChange={(image_url) => set({ image_url })} max={1} label="Category image" />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground press3d disabled:opacity-60"
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> {editingId ? "Save category" : "Add category"}
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
        {items.map((category) => (
          <div key={category.id} className="flex items-center gap-3 rounded-2xl border border-border bg-white p-2.5">
            <div className="h-12 w-14 shrink-0 overflow-hidden rounded-lg bg-secondary">
              {category.image_url && <Image src={category.image_url} alt={category.name} className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-bold text-foreground">{category.name}</p>
              <p className="text-[11px] text-muted-foreground">/{category.slug} · order {category.sort_order || 0}</p>
            </div>
            <button type="button" onClick={() => edit(category)} className="rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-bold text-primary">
              Edit
            </button>
            <button
              type="button"
              onClick={() => remove(category)}
              aria-label="Delete category"
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