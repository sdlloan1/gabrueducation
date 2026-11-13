const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { Star, Upload, X } from "lucide-react";

import { useAuth } from "@/lib/AuthContext";
import { Image } from "@/components/ui/image";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export default function ReviewForm({ productId, onSubmitted }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const upload = async (event) => {
    const files = Array.from(event.target.files || []).slice(0, 3 - images.length);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const { file_url } = await db.integrations.Core.UploadPublicFile({ file });
        if (file_url) uploaded.push(file_url);
      }
      setImages((prev) => [...prev, ...uploaded].slice(0, 3));
    } catch (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!comment.trim()) {
      toast({ title: "Add a comment", description: "Tell other buyers what you think.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await db.entities.Review.create({
        product_id: productId,
        user_id: user?.id,
        name: user?.full_name || "Verified buyer",
        avatar_url: user?.profile_image || "",
        rating,
        comment: comment.trim(),
        images,
        is_verified: true,
        is_hidden: false,
      });
      await db.functions.invoke("recalcRating", { product_id: productId }).catch(() => {});
      toast({ title: "Review posted", description: "Thanks for sharing your experience." });
      setComment("");
      setImages([]);
      setRating(5);
      onSubmitted?.();
    } catch (error) {
      toast({ title: "Could not post review", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-white p-3">
      <h3 className="text-sm font-bold text-foreground">Rate this product</h3>
      <div className="mt-2 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            aria-label={`${value} star${value > 1 ? "s" : ""}`}
            className="p-0.5"
          >
            <Star
              className={cn(
                "h-6 w-6 transition",
                value <= rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"
              )}
            />
          </button>
        ))}
        <span className="ml-1 text-xs font-semibold text-muted-foreground">{rating}/5</span>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="What did you build with it? Was it worth the price?"
        className="mt-2.5 w-full resize-none rounded-xl border border-border bg-white p-2.5 text-[13px] outline-none focus:border-primary"
      />

      <div className="mt-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {images.map((src, i) => (
          <div key={`${src}-${i}`} className="relative">
            <Image src={src} alt="" className="h-14 w-14 rounded-lg object-cover" />
            <button
              type="button"
              onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
              aria-label="Remove photo"
              className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-slate-900 text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {images.length < 3 && (
          <label className="flex h-14 w-14 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border text-[9px] font-semibold text-muted-foreground">
            {uploading ? "…" : <Upload className="h-4 w-4" />}
            Photo
            <input type="file" accept="image/*" multiple className="hidden" onChange={upload} disabled={uploading} />
          </label>
        )}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="mt-3 w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground press3d disabled:opacity-60"
      >
        {saving ? "Posting…" : "Post review"}
      </button>
    </form>
  );
}