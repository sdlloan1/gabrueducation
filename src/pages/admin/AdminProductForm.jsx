const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Save } from "lucide-react";

import ImageUploader from "@/components/admin/ImageUploader";
import FileUploader from "@/components/admin/FileUploader";
import { AdminCard, Field, Toggle, inputClass, textareaClass } from "@/components/admin/Field";
import { toast } from "@/components/ui/use-toast";
import { first30Percent, slugify } from "@/lib/format";

const TYPES = [
  { value: "template", label: "Website / app template" },
  { value: "prompt", label: "Prompt pack" },
  { value: "code_file", label: "Complete code file" },
  { value: "course", label: "Course" },
  { value: "software", label: "Software" },
  { value: "ebook", label: "PDF book" },
  { value: "service", label: "Setup & maintenance (service)" },
];

const BADGES = [
  { value: "none", label: "No badge" },
  { value: "best_choice", label: "Best Choice" },
  { value: "best_offer", label: "Best Offer" },
  { value: "trending", label: "Trending" },
];

const EMPTY = {
  title: "",
  slug: "",
  type: "template",
  category_id: "",
  images: [],
  youtube_url: "",
  short_description: "",
  description: "",
  description_images: [],
  tags: [],
  original_price: "",
  discounted_price: "",
  prompt_price: "",
  code_price: "",
  developer_price: "",
  app_dev_price: "",
  badge: "none",
  has_prompt: false,
  has_code_file: false,
  delivery_note: "",
  service_monthly_min: "",
  service_monthly_max: "",
  service_advance: "",
  developer_name: "",
  developer_whatsapp: "",
  is_active: true,
  is_featured: false,
  seo_title: "",
  seo_description: "",
  seo_keywords: [],
};

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === "new";

  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [promptText, setPromptText] = useState("");
  const [promptFile, setPromptFile] = useState({ file_uri: "", file_name: "" });
  const [file, setFile] = useState({ file_uri: "", file_name: "" });
  const [secretId, setSecretId] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    db.entities.Category.filter({}, { sort: "sort_order", limit: 50 })
      .then((page) => setCategories(page.items || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isNew) {
      setForm(EMPTY);
      setPromptText("");
      setPromptFile({ file_uri: "", file_name: "" });
      setFile({ file_uri: "", file_name: "" });
      return;
    }
    let alive = true;
    Promise.all([
      db.entities.Product.get(id),
      db.entities.ProductSecret.filter({ product_id: id }),
    ])
      .then(([product, secrets]) => {
        if (!alive || !product) return;
        setForm({
          ...EMPTY,
          ...product,
          images: product.images || [],
          description_images: product.description_images || [],
          tags: product.tags || [],
          seo_keywords: product.seo_keywords || [],
          original_price: product.original_price ?? "",
          discounted_price: product.discounted_price ?? "",
          prompt_price: product.prompt_price ?? "",
          code_price: product.code_price ?? "",
          developer_price: product.developer_price ?? "",
          app_dev_price: product.app_dev_price ?? "",
          service_monthly_min: product.service_monthly_min ?? "",
          service_monthly_max: product.service_monthly_max ?? "",
          service_advance: product.service_advance ?? "",
        });
        const secret = Array.isArray(secrets) ? secrets[0] : null;
        if (secret) {
          setSecretId(secret.id);
          setPromptText(secret.full_prompt_text || "");
          setPromptFile({ file_uri: secret.prompt_file_uri || "", file_name: secret.prompt_file_name || "" });
          setFile({ file_uri: secret.delivery_file_uri || "", file_name: secret.delivery_file_name || "" });
        }
        setTagInput((product.tags || []).join(", "));
      })
      .catch(() => toast({ title: "Could not load product", variant: "destructive" }))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id, isNew]);

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const save = async () => {
    if (!form.title.trim()) {
      toast({ title: "Add a product title", variant: "destructive" });
      return;
    }
    const optionPrices = [form.prompt_price, form.code_price, form.developer_price, form.app_dev_price]
      .map((price) => Number(price) || 0)
      .filter((price) => price > 0);
    if (!optionPrices.length && !Number(form.discounted_price)) {
      toast({ title: "Add a price for at least one purchase option", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const category = categories.find((c) => c.id === form.category_id);
      const tags = tagInput.split(",").map((t) => t.trim()).filter(Boolean);
      const payload = {
        ...form,
        slug: form.slug?.trim() ? slugify(form.slug) : slugify(form.title),
        category_name: category?.name || "",
        tags,
        original_price: Number(form.original_price) || Number(form.discounted_price) || 0,
        prompt_price: Number(form.prompt_price) || 0,
        code_price: Number(form.code_price) || 0,
        developer_price: Number(form.developer_price) || 0,
        app_dev_price: Number(form.app_dev_price) || 0,
        discounted_price: optionPrices.length ? Math.min(...optionPrices) : Number(form.discounted_price) || 0,
        service_monthly_min: Number(form.service_monthly_min) || 0,
        service_monthly_max: Number(form.service_monthly_max) || 0,
        service_advance: Number(form.service_advance) || 0,
        has_prompt: Boolean(promptText.trim()),
        prompt_char_count: promptText.trim() ? promptText.trim().length : 0,
        prompt_preview: promptText.trim() ? first30Percent(promptText.trim()) : "",
        has_code_file: Boolean(file.file_uri),
        rating_avg: Number(form.rating_avg) || 0,
        rating_count: Number(form.rating_count) || 0,
      };
      delete payload.id;
      delete payload.created_date;
      delete payload.updated_date;
      delete payload.created_by_id;

      const saved = isNew
        ? await db.entities.Product.create(payload)
        : await db.entities.Product.update(id, payload);

      const productId = saved?.id || id;
      const secretPayload = {
        product_id: productId,
        full_prompt_text: promptText,
        prompt_file_uri: promptFile.file_uri,
        prompt_file_name: promptFile.file_name,
        delivery_file_uri: file.file_uri,
        delivery_file_name: file.file_name,
      };
      if (secretId) await db.entities.ProductSecret.update(secretId, secretPayload);
      else if (promptText || promptFile.file_uri || file.file_uri) await db.entities.ProductSecret.create(secretPayload);

      toast({ title: isNew ? "Product created" : "Product updated" });
      navigate("/admin/products");
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
    <div className="space-y-3 pb-24">
      <header className="flex items-center justify-between">
        <button type="button" onClick={() => navigate("/admin/products")} className="flex items-center gap-1 text-xs font-bold text-primary">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Products
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground press3d disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" aria-hidden="true" />}
          {isNew ? "Publish product" : "Save changes"}
        </button>
      </header>

      <AdminCard title="Basics">
        <div className="grid gap-2.5 md:grid-cols-2">
          <Field label="Product title" className="md:col-span-2">
            <input value={form.title} onChange={(e) => set({ title: e.target.value })} className={inputClass} placeholder="Nova — Portfolio Website Template" />
          </Field>
          <Field label="URL slug" hint="Leave blank to generate from the title">
            <input value={form.slug} onChange={(e) => set({ slug: e.target.value })} className={inputClass} placeholder="nova-portfolio-template" />
          </Field>
          <Field label="Product type">
            <select value={form.type} onChange={(e) => set({ type: e.target.value })} className={inputClass}>
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Category">
            <select value={form.category_id} onChange={(e) => set({ category_id: e.target.value })} className={inputClass}>
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Badge">
            <select value={form.badge} onChange={(e) => set({ badge: e.target.value })} className={inputClass}>
              {BADGES.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Short description" className="md:col-span-2" hint="Shown on cards and in Google results">
            <input value={form.short_description} onChange={(e) => set({ short_description: e.target.value })} className={inputClass} />
          </Field>
          <Field
            label="Full description"
            className="md:col-span-2"
            hint="Paste any link (https://…) — it becomes clickable on the product page"
          >
            <textarea rows={5} value={form.description} onChange={(e) => set({ description: e.target.value })} className={textareaClass} />
          </Field>
          <Field label="Tags" className="md:col-span-2" hint="Comma separated — powers search and similar products">
            <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} className={inputClass} placeholder="next.js, portfolio, template" />
          </Field>
        </div>
      </AdminCard>

      <AdminCard title="Media">
        <div className="space-y-3">
          <ImageUploader value={form.images} onChange={(images) => set({ images })} label="Product photos (first is the cover)" max={8} />
          <Field label="YouTube video link">
            <input value={form.youtube_url} onChange={(e) => set({ youtube_url: e.target.value })} className={inputClass} placeholder="https://youtu.be/…" />
          </Field>
          <ImageUploader value={form.description_images} onChange={(description_images) => set({ description_images })} label="Images inside the description" max={6} />
        </div>
      </AdminCard>

      <AdminCard
        title="Purchase options (INR)"
        description="Buyers can pick what they want. Leave a price blank to hide that option — the store shows the lowest price."
      >
        <div className="grid gap-2.5 md:grid-cols-2">
          <Field label="MRP / original price (₹)" hint="Shown struck through when it is higher">
            <input type="number" value={form.original_price} onChange={(e) => set({ original_price: e.target.value })} className={inputClass} placeholder="2499" />
          </Field>
          <Field label="Prompt only (₹)">
            <input type="number" value={form.prompt_price} onChange={(e) => set({ prompt_price: e.target.value })} className={inputClass} placeholder="499" />
          </Field>
          <Field label="Complete code (₹)">
            <input type="number" value={form.code_price} onChange={(e) => set({ code_price: e.target.value })} className={inputClass} placeholder="1499" />
          </Field>
          <Field label="Hire developer (₹)" hint="Buyer pays 50% now, the balance after the site goes live">
            <input type="number" value={form.developer_price} onChange={(e) => set({ developer_price: e.target.value })} className={inputClass} placeholder="9999" />
          </Field>
          <Field label="App development (₹)" hint="Complete full stack app development — paid in full at checkout">
            <input type="number" value={form.app_dev_price} onChange={(e) => set({ app_dev_price: e.target.value })} className={inputClass} placeholder="49999" />
          </Field>
        </div>
        <p className="mt-2 rounded-xl bg-secondary p-2 text-[11px] font-medium text-secondary-foreground">
          Hire-developer buyers also get a free custom domain (.com / .in), free hosting, backend setup and full access.
          App-development buyers get a complete full stack app — iOS, Android and web — built to order.
        </p>
      </AdminCard>

      {form.type === "service" && (
        <AdminCard title="Service details" description="Setup & maintenance engagements">
          <div className="grid gap-2.5 md:grid-cols-3">
            <Field label="Monthly from (₹)">
              <input type="number" value={form.service_monthly_min} onChange={(e) => set({ service_monthly_min: e.target.value })} className={inputClass} placeholder="20000" />
            </Field>
            <Field label="Monthly up to (₹)">
              <input type="number" value={form.service_monthly_max} onChange={(e) => set({ service_monthly_max: e.target.value })} className={inputClass} placeholder="50000" />
            </Field>
            <Field label="Advance (₹)">
              <input type="number" value={form.service_advance} onChange={(e) => set({ service_advance: e.target.value })} className={inputClass} placeholder="5000" />
            </Field>
            <Field label="Developer name">
              <input value={form.developer_name} onChange={(e) => set({ developer_name: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Developer WhatsApp">
              <input value={form.developer_whatsapp} onChange={(e) => set({ developer_whatsapp: e.target.value })} className={inputClass} placeholder="919876543210" />
            </Field>
          </div>
        </AdminCard>
      )}

      <AdminCard title="Prompt & delivery files" description="Buyers see the first 30% of the prompt; the rest unlocks after payment. Each purchase option delivers its own file.">
        <div className="space-y-2.5">
          <Field label="Full prompt text" hint={promptText ? `${promptText.length.toLocaleString("en-IN")} characters · preview shows ${Math.round(promptText.length * 0.3).toLocaleString("en-IN")}` : "Paste the complete prompt — customers can copy it after purchase"}>
            <textarea rows={7} value={promptText} onChange={(e) => setPromptText(e.target.value)} className={`${textareaClass} font-mono text-[12px]`} />
          </Field>
          <FileUploader
            label="Prompt file (pdf / doc / zip) — for Prompt-only buyers"
            value={promptFile.file_uri}
            fileName={promptFile.file_name}
            onChange={setPromptFile}
          />
          <FileUploader
            label="Complete code file (zip / pdf) — for Code & Developer buyers"
            value={file.file_uri}
            fileName={file.file_name}
            onChange={setFile}
          />
          <Field label="Delivery note" hint="Shown to buyers in their library">
            <input value={form.delivery_note} onChange={(e) => set({ delivery_note: e.target.value })} className={inputClass} placeholder="Zip includes Figma + React source." />
          </Field>
        </div>
      </AdminCard>

      <AdminCard title="SEO" description="Used for the page title, meta description and search keywords.">
        <div className="grid gap-2.5">
          <Field label="SEO title" hint={`${(form.seo_title || form.title || "").length}/60 characters`}>
            <input value={form.seo_title} onChange={(e) => set({ seo_title: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Meta description" hint={`${(form.seo_description || form.short_description || "").length}/160 characters`}>
            <textarea rows={2} value={form.seo_description} onChange={(e) => set({ seo_description: e.target.value })} className={textareaClass} />
          </Field>
          <Field label="Keywords" hint="Comma separated">
            <input
              value={(form.seo_keywords || []).join(", ")}
              onChange={(e) => set({ seo_keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean) })}
              className={inputClass}
            />
          </Field>
        </div>
      </AdminCard>

      <AdminCard title="Visibility">
        <div className="flex flex-wrap gap-2">
          <Toggle checked={form.is_active} onChange={(is_active) => set({ is_active })} label="Live in store" />
          <Toggle checked={form.is_featured} onChange={(is_featured) => set({ is_featured })} label="Featured" />
        </div>
      </AdminCard>
    </div>
  );
}