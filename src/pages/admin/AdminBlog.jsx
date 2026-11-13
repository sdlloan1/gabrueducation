const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { toast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/format";

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);

  const load = () => {
    db.entities.Blog.filter({}, { sort: "-created_date", limit: 100 })
      .then((page) => setPosts(page.items || []))
      .catch(() => setPosts([]));
  };

  useEffect(load, []);

  const remove = async (post) => {
    if (!window.confirm(`Delete “${post.title}”?`)) return;
    await db.entities.Blog.delete(post.id);
    load();
    toast({ title: "Post deleted" });
  };

  return (
    <div>
      <header className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-extrabold text-foreground">Blog</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">SEO articles that bring free traffic to your store.</p>
        </div>
        <Link
          to="/admin/blog/new"
          className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2.5 text-xs font-bold text-primary-foreground press3d"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> New post
        </Link>
      </header>

      <div className="space-y-2">
        {posts.map((post) => (
          <div key={post.id} className="flex items-center gap-3 rounded-2xl border border-border bg-white p-2.5">
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-[12.5px] font-bold text-foreground">{post.title}</p>
              <p className="text-[10.5px] text-muted-foreground">
                {formatDate(post.created_date)} · {post.views || 0} views · {post.is_published === false ? "Draft" : "Published"}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Link
                to={`/admin/blog/${post.id}`}
                aria-label="Edit post"
                className="grid h-8 w-8 place-items-center rounded-lg border border-border text-slate-600"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={() => remove(post)}
                aria-label="Delete post"
                className="grid h-8 w-8 place-items-center rounded-lg border border-border text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border bg-white p-6 text-center text-xs text-muted-foreground">
            No posts yet — write your first SEO article.
          </p>
        )}
      </div>
    </div>
  );
}