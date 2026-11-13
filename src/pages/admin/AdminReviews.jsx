const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Eye, EyeOff, Star, Trash2 } from "lucide-react";

import { Image } from "@/components/ui/image";
import ImageUploader from "@/components/admin/ImageUploader";
import { AdminCard, Field, inputClass, textareaClass } from "@/components/admin/Field";
import { toast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const EMPTY = { name: "", rating: 5, title: "", comment: "", images: [] };

export default function AdminReviews() {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    db.entities.Product.filter({}, { sort: "-created_date", limit: 100 })
      .then((page) => {
        const items = page.items || [];
        setProducts(items);
        if (items[0]) setProductId(items[0].id);
      })
      .catch(() => {});
  }, []);

  const load = (id) => {
    if (!id) return;
    db.entities.Review.filter({ product_id: id }, { sort: "-created_date", limit: 100 })
      .then((page) => setReviews(page.items || []))
      .catch(() => setReviews([]));
  };

  useEffect(() => load(productId), [productId]);

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const addReview = async () => {
    if (!form.name.trim() || !form.comment.trim()) {
      toast({ title: "Add a name and comment", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await db.entities.Review.create({
        product_id: productId,
        name: form.name.trim(),
        rating: Number(form.rating) || 5,
        title: form.title,
        comment: form.comment.trim(),
        images: form.images,
        is_verified: true,
        is_hidden: false,
      });
      await db.functions.invoke("recalcRating", { product_id: productId }).catch(() => {});
      toast({ title: "Review added" });
      setForm(EMPTY);
      load(productId);
    } catch (error) {
      toast({ title: "Could not add review", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleHidden = async (review) => {
    await db.entities.Review.update(review.id, { is_hidden: !review.is_hidden });
    await db.functions.invoke("recalcRating", { product_id: productId }).catch(() => {});
    load(productId);
  };

  const remove = async (review) => {
    if (!window.confirm("Delete this review?")) return;
    await db.entities.Review.delete(review.id);
    await db.functions.invoke("recalcRating", { product_id: productId }).catch(() => {});
    load(productId);
    toast({ title: "Review deleted" });
  };

  return (
    <div className="space-y-3">
      <header>
        <h1 className="text-xl font-extrabold text-foreground">Reviews & ratings</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Add authentic buyer reviews with photos — they appear on the product page instantly.
        </p>
      </header>

      <AdminCard title="Product">
        <select value={productId} onChange={(e) => setProductId(e.target.value)} className={inputClass}>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.title}
            </option>
          ))}
        </select>
      </AdminCard>

      <AdminCard title="Add a review">
        <div className="grid gap-2.5 md:grid-cols-2">
          <Field label="Reviewer name">
            <input value={form.name} onChange={(e) => set({ name: e.target.value })} className={inputClass} placeholder="Rahul S." />
          </Field>
          <Field label="Rating">
            <select value={form.rating} onChange={(e) => set({ rating: e.target.value })} className={inputClass}>
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>{r} star{r > 1 ? "s" : ""}</option>
              ))}
            </select>
          </Field>
          <Field label="Headline" className="md:col-span-2">
            <input value={form.title} onChange={(e) => set({ title: e.target.value })} className={inputClass} placeholder="Worth every rupee" />
          </Field>
          <Field label="Comment" className="md:col-span-2">
            <textarea rows={3} value={form.comment} onChange={(e) => set({ comment: e.target.value })} className={textareaClass} />
          </Field>
          <div className="md:col-span-2">
            <ImageUploader value={form.images} onChange={(images) => set({ images })} label="Review photos" max={3} />
          </div>
        </div>
        <button
          type="button"
          onClick={addReview}
          disabled={saving || !productId}
          className="mt-3 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground press3d disabled:opacity-60"
        >
          {saving ? "Saving…" : "Add review"}
        </button>
      </AdminCard>

      <div className="space-y-2">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-2xl border border-border bg-white p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[12px] font-bold text-foreground">
                  {review.name}
                  <span className="flex items-center gap-0.5 text-amber-500">
                    <Star className="h-3 w-3 fill-amber-400" aria-hidden="true" />
                    {review.rating}
                  </span>
                  {review.is_hidden && (
                    <span className="rounded bg-slate-100 px-1 text-[9px] font-bold uppercase text-slate-500">Hidden</span>
                  )}
                </p>
                <p className="text-[10.5px] text-muted-foreground">{formatDate(review.created_date)}</p>
                {review.comment && <p className="mt-1 text-[11.5px] text-slate-600">{review.comment}</p>}
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => toggleHidden(review)}
                  aria-label={review.is_hidden ? "Show review" : "Hide review"}
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-lg border border-border",
                    review.is_hidden ? "text-slate-500" : "text-emerald-600"
                  )}
                >
                  {review.is_hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => remove(review)}
                  aria-label="Delete review"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-border text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
            {Array.isArray(review.images) && review.images.length > 0 && (
              <div className="mt-2 flex gap-1.5">
                {review.images.map((src, i) => (
                  <Image key={`${src}-${i}`} src={src} alt="" className="h-12 w-12 rounded-lg object-cover" />
                ))}
              </div>
            )}
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border bg-white p-6 text-center text-xs text-muted-foreground">
            No reviews on this product yet.
          </p>
        )}
      </div>
    </div>
  );
}