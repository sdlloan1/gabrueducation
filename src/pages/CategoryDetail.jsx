const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Info, SlidersHorizontal } from "lucide-react";

import { Image } from "@/components/ui/image";
import Seo from "@/components/Seo";
import ProductGrid from "@/components/ProductGrid";
import { cn } from "@/lib/utils";

const SORTS = [
  { key: "-created_date", label: "Newest" },
  { key: "discounted_price", label: "Price ↑" },
  { key: "-discounted_price", label: "Price ↓" },
  { key: "-sales_count", label: "Bestselling" },
  { key: "-rating_avg", label: "Top rated" },
];

const TYPES = [
  { key: "", label: "All" },
  { key: "template", label: "Templates" },
  { key: "prompt", label: "Prompts" },
  { key: "code_file", label: "Code files" },
  { key: "course", label: "Courses" },
  { key: "software", label: "Software" },
  { key: "ebook", label: "Books" },
];

export default function CategoryDetail() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [sort, setSort] = useState("-created_date");
  const [type, setType] = useState("");

  useEffect(() => {
    setCategory(null);
    db.entities.Category.filter({ slug })
      .then((rows) => setCategory(Array.isArray(rows) ? rows[0] || null : null))
      .catch(() => setCategory(null));
  }, [slug]);

  const query = { category_id: category?.id, ...(type ? { type } : {}) };

  return (
    <div className="animate-tilt-in">
      <Seo
        title={category ? `${category.name} — Gabru Education` : "Category — Gabru Education"}
        description={category?.seo_description || category?.description || "Browse digital products on Gabru Education."}
        keywords={category?.seo_title ? [category.seo_title] : undefined}
        image={category?.image_url}
        path={`/category/${slug}`}
      />

      <Link to="/categories" className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" /> All categories
      </Link>

      {/* Small category banner */}
      <div className="relative mb-4 overflow-hidden rounded-2xl border border-border bg-primary">
        <div className="absolute inset-0">
          <Image src={category?.image_url} alt="" className="h-full w-full object-cover opacity-35" />
        </div>
        <div className="relative flex items-center gap-3 p-3.5">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-extrabold leading-tight text-white">
              {category?.name || "Loading category…"}
            </h1>
            <p className="mt-0.5 line-clamp-2 text-[11px] text-white/85">
              {category?.description || "Hand-picked digital products with lifetime access."}
            </p>
          </div>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/15 text-white backdrop-blur">
            <Info className="h-5 w-5" aria-hidden="true" />
          </span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="sticky top-14 z-20 -mx-3 mb-3 bg-background/95 px-3 py-2 backdrop-blur md:static md:mx-0 md:px-0">
        <div className="mb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          {TYPES.map((item) => (
            <button
              key={item.key || "all"}
              type="button"
              onClick={() => setType(item.key)}
              className={cn(
                "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition",
                type === item.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-white text-slate-600"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {SORTS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setSort(item.key)}
              className={cn(
                "shrink-0 rounded-lg px-2 py-1 text-[11px] font-semibold transition",
                sort === item.key ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-muted"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {category ? (
        <ProductGrid key={`${category.id}-${type}-${sort}`} query={query} sort={sort} pageSize={12} />
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[230px] animate-pulse rounded-2xl border border-border bg-white" />
          ))}
        </div>
      )}
    </div>
  );
}