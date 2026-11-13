const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PackageSearch, Sparkles } from "lucide-react";

import Seo from "@/components/Seo";
import ProductGrid from "@/components/ProductGrid";
import ProductCard from "@/components/ProductCard";
import EmptyState from "@/components/EmptyState";
import { buildSearchQuery } from "@/lib/searchQuery";

export default function SearchResults() {
  const [params] = useSearchParams();
  const q = (params.get("q") || "").trim();
  const [related, setRelated] = useState([]);
  const [resultCount, setResultCount] = useState(null);

  useEffect(() => {
    setResultCount(null);
    if (!q) return;
    db.entities.Product.count({ is_active: true, ...buildSearchQuery(q) })
      .then(setResultCount)
      .catch(() => setResultCount(0));

    db.entities.Product.filter({ is_active: true }, { sort: "-sales_count", limit: 8 })
      .then((page) => setRelated(page.items || []))
      .catch(() => setRelated([]));
  }, [q]);

  const query = buildSearchQuery(q);

  return (
    <div className="animate-tilt-in">
      <Seo
        title={q ? `Search: ${q} — Gabru Education` : "Search — Gabru Education"}
        description={`Search results for ${q} across website templates, prompts, courses and digital tools.`}
        path={`/search?q=${encodeURIComponent(q)}`}
      />

      <header className="mb-3">
        <h1 className="text-lg font-extrabold text-foreground">
          {q ? `Results for “${q}”` : "Search the store"}
        </h1>
        {resultCount !== null && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {resultCount} product{resultCount === 1 ? "" : "s"} found
          </p>
        )}
      </header>

      <ProductGrid
        key={q}
        query={query}
        sort="-sales_count"
        pageSize={12}
        emptyState={
          <EmptyState
            icon={PackageSearch}
            title={q ? `No exact match for “${q}”` : "Nothing here yet"}
            description="Try a shorter keyword like “template”, “prompt” or “course” — or explore the similar picks below."
            action={
              <Link to="/categories" className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground press3d">
                Browse categories
              </Link>
            }
          />
        }
      />

      {related.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            You may also like
          </h2>
          <div className="snap-row -mx-3 flex gap-3 overflow-x-auto px-3 pb-2 no-scrollbar">
            {related.map((product) => (
              <ProductCard key={product.id} product={product} variant="strip" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}