const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";

import { Image } from "@/components/ui/image";
import Seo from "@/components/Seo";
import { formatDate } from "@/lib/format";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.entities.Blog.filter({ is_published: true }, { sort: "-created_date", limit: 24 })
      .then((page) => setPosts(page.items || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const [featured, ...rest] = posts;

  return (
    <div className="animate-tilt-in">
      <Seo
        title="Blog — SEO, Templates & Selling Digital Products | Gabru Education"
        description="Practical guides on website templates, SEO for digital products, prompt engineering and building an online store in India."
        path="/blog"
      />

      <header className="mb-4">
        <h1 className="flex items-center gap-2 text-xl font-extrabold text-foreground">
          <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" /> The Gabru Blog
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          SEO-ready guides for builders, freelancers and small store owners.
        </p>
      </header>

      {loading && <div className="h-52 animate-pulse rounded-2xl border border-border bg-white" />}

      {!loading && !posts.length && (
        <div className="rounded-2xl border border-dashed border-border bg-white p-8 text-center text-sm text-muted-foreground">
          No posts published yet.
        </div>
      )}

      {featured && (
        <Link
          to={`/blog/${featured.slug}`}
          className="card3d mb-4 block overflow-hidden rounded-2xl border border-border bg-white clay"
        >
          <div className="aspect-[16/9] w-full overflow-hidden bg-secondary">
            <Image src={featured.cover_image} alt={featured.title} className="h-full w-full object-cover" />
          </div>
          <div className="p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
              {featured.category || "Guide"} · {featured.read_time || 5} min read
            </span>
            <h2 className="mt-1 text-base font-bold leading-snug text-foreground">{featured.title}</h2>
            <p className="mt-1 line-clamp-2 text-[12px] text-slate-600">{featured.excerpt}</p>
            <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-primary">
              Read article <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </span>
          </div>
        </Link>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {rest.map((post) => (
          <Link
            key={post.id}
            to={`/blog/${post.slug}`}
            className="card3d flex gap-3 overflow-hidden rounded-2xl border border-border bg-white p-2.5 clay"
          >
            <Image src={post.cover_image} alt={post.title} className="h-20 w-24 shrink-0 rounded-xl object-cover" />
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
                {post.category || "Guide"}
              </span>
              <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-foreground">{post.title}</h3>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">{post.excerpt}</p>
              <span className="mt-1 block text-[10px] text-muted-foreground">
                {formatDate(post.created_date)} · {post.read_time || 5} min
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}