const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { Image } from "@/components/ui/image";
import Seo from "@/components/Seo";
import ShareSheet from "@/components/ShareSheet";
import ProductCard from "@/components/ProductCard";
import { formatDate } from "@/lib/format";

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    db.entities.Blog.filter({ slug })
      .then((rows) => {
        if (!alive) return;
        const found = Array.isArray(rows) ? rows[0] || null : null;
        setPost(found);
        if (found) {
          db.entities.Product.filter({ is_active: true }, { sort: "-sales_count", limit: 4 })
            .then((page) => alive && setProducts(page.items || []))
            .catch(() => {});
          db.entities.Blog.update(found.id, { views: (Number(found.views) || 0) + 1 }).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-lg font-bold text-foreground">Article not found</h1>
        <Link to="/blog" className="mt-3 inline-block rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">
          Back to blog
        </Link>
      </div>
    );
  }

  return (
    <article className="animate-tilt-in">
      <Seo
        title={post.seo_title || `${post.title} — Gabru Education`}
        description={post.seo_description || post.excerpt}
        keywords={post.seo_keywords}
        image={post.cover_image}
        path={`/blog/${post.slug}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.seo_description || post.excerpt,
          image: post.cover_image,
          datePublished: post.created_date,
          author: { "@type": "Person", name: post.author || "Gabru Education" },
        }}
      />

      <Link to="/blog" className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" /> All articles
      </Link>

      <header className="mb-3">
        <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
          {post.category || "Guide"} · {post.read_time || 5} min read
        </span>
        <h1 className="mt-1 text-xl font-extrabold leading-tight text-foreground md:text-2xl">{post.title}</h1>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            {post.author || "Gabru Education"} · {formatDate(post.created_date)}
          </p>
          <ShareSheet url={typeof window !== "undefined" ? window.location.href : ""} title={post.title} />
        </div>
      </header>

      {post.cover_image && (
        <div className="mb-4 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-secondary">
          <Image src={post.cover_image} alt={post.title} className="h-full w-full object-cover" />
        </div>
      )}

      <div className="prose-sm max-w-none text-[13.5px] leading-[1.7] text-slate-700 [&_a]:font-semibold [&_a]:text-primary [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-3 [&_blockquote]:italic [&_h2]:mb-1.5 [&_h2]:mt-5 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:mb-1 [&_h3]:mt-4 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-foreground [&_li]:my-1 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2">
        <ReactMarkdown>{post.content || post.excerpt || ""}</ReactMarkdown>
      </div>

      {Array.isArray(post.tags) && post.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              to={`/search?q=${encodeURIComponent(tag)}`}
              className="rounded-full border border-border bg-white px-2 py-0.5 text-[10.5px] font-medium text-slate-600 hover:border-primary hover:text-primary"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {products.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" /> Shop what this article covers
          </h2>
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}