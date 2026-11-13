const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid } from "lucide-react";

import { Image } from "@/components/ui/image";
import Seo from "@/components/Seo";
import ProductGrid from "@/components/ProductGrid";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    db.entities.Category.filter({ is_active: true }, { sort: "sort_order", limit: 50 })
      .then((page) => setCategories(page.items || []))
      .catch(() => setCategories([]));
    db.entities.Product.aggregate({ query: { is_active: true }, groupBy: "category_id" })
      .then((res) => {
        const map = {};
        (res?.rows || []).forEach((row) => {
          map[row.category_id] = row.count;
        });
        setCounts(map);
      })
      .catch(() => setCounts({}));
  }, []);

  return (
    <div className="animate-tilt-in">
      <Seo
        title="All Categories — Templates, Prompts, Courses, Tools | Gabru Education"
        description="Browse every Gabru Education category: website and app templates, AI prompt packs, courses, software tools and PDF books."
        path="/categories"
      />
      <header className="mb-4">
        <h1 className="text-xl font-extrabold text-foreground">All categories</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Digital assets you can download the moment your payment is approved.
        </p>
      </header>

      {categories.length === 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl border border-border bg-white" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="card3d group overflow-hidden rounded-2xl border border-border bg-white clay"
            >
              <div className="aspect-[4/3] overflow-hidden bg-secondary">
                <Image
                  src={category.image_url}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-2.5">
                <h2 className="text-[13px] font-bold leading-tight text-foreground">{category.name}</h2>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {counts[category.id] || 0} products
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <section className="mt-6">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-foreground">
          <LayoutGrid className="h-4 w-4 text-primary" aria-hidden="true" />
          Newest arrivals
        </h2>
        <ProductGrid query={{}} sort="-created_date" pageSize={8} />
      </section>
    </div>
  );
}