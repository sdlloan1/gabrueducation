const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";

import { Image } from "@/components/ui/image";
import { toast } from "@/components/ui/use-toast";
import { inr } from "@/lib/format";
import { inputClass } from "@/components/admin/Field";

export default function AdminProducts() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    db.entities.Product.filter({}, { sort: "-created_date", limit: 100 })
      .then((page) => setItems(page.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (product) => {
    if (!window.confirm(`Delete “${product.title}”? This cannot be undone.`)) return;
    await db.entities.Product.delete(product.id);
    toast({ title: "Product deleted" });
    load();
  };

  const toggleLive = async (product) => {
    await db.entities.Product.update(product.id, { is_active: !product.is_active });
    load();
  };

  const filtered = items.filter((p) => p.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-extrabold text-foreground">Products</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">{items.length} products in the store</p>
        </div>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2.5 text-xs font-bold text-primary-foreground press3d"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> New product
        </Link>
      </header>

      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by title"
          className={`${inputClass} pl-9`}
        />
      </div>

      {loading && <div className="h-24 animate-pulse rounded-2xl border border-border bg-white" />}

      <div className="space-y-2">
        {filtered.map((product) => (
          <div key={product.id} className="flex items-center gap-3 rounded-2xl border border-border bg-white p-2.5">
            <div className="h-14 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary">
              <Image src={product.images?.[0]} alt={product.title} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-[12.5px] font-bold text-foreground">{product.title}</p>
              <p className="text-[11px] text-muted-foreground">
                {inr(product.discounted_price)} · {product.category_name || "No category"} · {product.type}
              </p>
              <button
                type="button"
                onClick={() => toggleLive(product)}
                className={`mt-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-bold uppercase ${
                  product.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                }`}
              >
                {product.is_active ? "Live" : "Draft"}
              </button>
            </div>
            <div className="flex shrink-0 gap-1">
              <Link
                to={`/admin/products/${product.id}`}
                aria-label="Edit product"
                className="grid h-8 w-8 place-items-center rounded-lg border border-border text-slate-600 hover:bg-muted"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={() => remove(product)}
                aria-label="Delete product"
                className="grid h-8 w-8 place-items-center rounded-lg border border-border text-destructive hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}