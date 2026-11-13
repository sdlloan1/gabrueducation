const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";

import { useAuth } from "@/lib/AuthContext";
import EmptyState from "@/components/EmptyState";
import ProductCard from "@/components/ProductCard";
import Seo from "@/components/Seo";

export default function Saved() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    db.entities.SavedItem.filter({ user_id: user.id }, { sort: "-created_date", limit: 60 })
      .then(async (page) => {
        const ids = (page.items || []).map((r) => r.product_id).filter(Boolean);
        if (!ids.length) {
          if (alive) setProducts([]);
          return;
        }
        const found = await db.entities.Product.filter({ id: { $in: ids } });
        if (alive) setProducts(Array.isArray(found) ? found : []);
      })
      .catch(() => alive && setProducts([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [user?.id]);

  return (
    <div className="animate-tilt-in">
      <Seo title="Saved products — Gabru Education" description="Products you saved for later." path="/saved" />
      <h1 className="mb-3 text-xl font-extrabold text-foreground">Saved for later</h1>

      {loading && <div className="h-24 animate-pulse rounded-2xl border border-border bg-white" />}

      {!loading && products.length === 0 && (
        <EmptyState
          icon={Bookmark}
          title="Nothing saved yet"
          description="Tap the bookmark on any product to keep it here."
          action={
            <Link to="/categories" className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground press3d">
              Browse products
            </Link>
          }
        />
      )}

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}