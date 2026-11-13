const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Save } from "lucide-react";

import ImageUploader from "@/components/admin/ImageUploader";
import { AdminCard, Field, Toggle, inputClass, textareaClass } from "@/components/admin/Field";
import { toast } from "@/components/ui/use-toast";
import { slugify, truncate } from "@/lib/format";

const EMPTY = {
  title: "",
  slug: "",
  cover_image: [],
  excerpt: "",
  content: "",
  category: "Guide",
  author: "Gabru Education",
  read_time: 5,
  focus_keyword: "",
  seo_title: "",
  seo_description: "",
  seo_keywords: [],
  is_published: true,
};

export default function AdminBlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === "new";
  const [form, setForm] = useState(EMPTY);
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    let alive = true;
    db.entities.Blog.get(id)
      .then((post) => {
        if (!alive || !post) return;
        setForm({
          ...EMPTY,
          ...post,
          cover_image: post.cover_image ? [post.cover_image] : [],
          seo_keywords: post.seo_keywords || [],
        });
        setTags((post.tags || []).join(", "));
      })
      .catch(() => toast({ title: "Could not load post", variant: "destructive" }))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id, isNew]);

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const save = async () => {
    if (!form.title.trim()) {
      toast({ title: "Add a title", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug?.trim() ? slugify(form.slug) : slugify(form.title),
        cover_image: form.cover_image?.[0] || "",
        excerpt: form.excerpt,
        content: form.content,
        category: form.category,
        author: form.author,
        read_time: Number(form.read_time) || 5,
        focus_keyword: form.focus_keyword,
        seo_title: form.seo_title || truncate(form.title, 60),
        seo_description: form.seo_description || truncate(form.excerpt, 160),
        seo_keywords: form.seo_keywords || [],
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        is_published: Boolean(form.is_published),
      };
      if (isNew) await db.entities.Blog.create(payload);
      else await db.entities.Blog.update(id, payload);
      toast({ title: isNew ? "Post published" : "Post updated" });
      navigate("/admin/blog");
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
    <div className="space-y-3 pb-20">
      <header className="flex items-center justify-between">
        <button type="button" onClick={() => navigate("/admin/blog")} className="flex items-center gap-1 text-xs font-bold text-primary">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Blog
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground press3d disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" aria-hidden="true" />}
          Save post
        </button>
      </header>

      <AdminCard title="Article">
        <div className="grid gap-2.5 md:grid-cols-2">
          <Field label="Title (H1)" className="md:col-span-2">
            <input value={form.title} onChange={(e) => set({ title: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Slug" hint="Lowercase words separated by dashes">
            <input value={form.slug} onChange={(e) => set({ slug: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Category">
            <input value={form.category} onChange={(e) => set({ category: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Excerpt" className="md:col-span-2" hint="Also used as the meta description if none is set">
            <textarea rows={2} value={form.excerpt} onChange={(e) => set({ excerpt: e.target.value })} className={textareaClass} />
          </Field>
          <Field label="Content (Markdown)" className="md:col-span-2" hint="Use ## for headings, **bold**, - for lists and [text](url) for links">
            <textarea rows={14} value={form.content} onChange={(e) => set({ content: e.target.value })} className={`${textareaClass} font-mono text-[12px]`} />
          </Field>
          <div className="md:col-span-2">
            <ImageUploader value={form.cover_image} onChange={(cover_image) => set({ cover_image })} max={1} label="Cover image" />
          </div>
          <Field label="Tags" hint="Comma separated">
            <input value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Read time (minutes)">
            <input type="number" value={form.read_time} onChange={(e) => set({ read_time: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Author">
            <input value={form.author} onChange={(e) => set({ author: e.target.value })} className={inputClass} />
          </Field>
          <div className="flex items-end pb-1">
            <Toggle checked={form.is_published} onChange={(is_published) => set({ is_published })} label="Published" />
          </div>
        </div>
      </AdminCard>

      <AdminCard title="SEO" description="How this article appears in Google search results.">
        <div className="grid gap-2.5">
          <Field label="Focus keyword">
            <input value={form.focus_keyword} onChange={(e) => set({ focus_keyword: e.target.value })} className={inputClass} placeholder="sell website templates india" />
          </Field>
          <Field label="SEO title" hint={`${(form.seo_title || form.title || "").length}/60 characters`}>
            <input value={form.seo_title} onChange={(e) => set({ seo_title: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Meta description" hint={`${(form.seo_description || form.excerpt || "").length}/160 characters`}>
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
        <div className="mt-3 rounded-xl border border-border bg-slate-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Google preview</p>
          <p className="mt-1 truncate text-[13px] font-semibold text-blue-700">
            {form.seo_title || form.title || "Your article title"}
          </p>
          <p className="text-[11px] text-emerald-700">gabrueducation.com › blog › {form.slug || slugify(form.title)}</p>
          <p className="mt-0.5 line-clamp-2 text-[11.5px] text-slate-600">
            {form.seo_description || form.excerpt || "Your meta description appears here."}
          </p>
        </div>
      </AdminCard>
    </div>
  );
}