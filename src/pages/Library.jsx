const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Lock } from "lucide-react";

import { useAuth } from "@/lib/AuthContext";
import EmptyState from "@/components/EmptyState";
import LibraryCard from "@/components/LibraryCard";
import Seo from "@/components/Seo";

export default function Library() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    db.entities.Purchase.filter({ user_id: user.id }, { sort: "-created_date", limit: 60 })
      .then(async (page) => {
        if (!alive) return;
        const rows = page.items || [];
        setPurchases(rows);
        const ids = [...new Set(rows.map((r) => r.product_id).filter(Boolean))];
        if (ids.length) {
          const found = await db.entities.Product.filter({ id: { $in: ids } });
          const map = {};
          (Array.isArray(found) ? found : []).forEach((p) => {
            map[p.id] = p;
          });
          if (alive) setProducts(map);
        }
      })
      .catch(() => setPurchases([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [user?.id]);

  return (
    <div className="animate-tilt-in">
      <Seo title="My library — Gabru Education" description="Download the products you own, for life." path="/library" />
      <header className="mb-3">
        <h1 className="text-xl font-extrabold text-foreground">My library</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Everything you&apos;ve paid for — download files or copy prompts any time.
        </p>
      </header>

      {loading && <div className="h-24 animate-pulse rounded-2xl border border-border bg-white" />}

      {!loading && purchases.length === 0 && (
        <EmptyState
          icon={Lock}
          title="Nothing unlocked yet"
          description="After the admin approves your UPI payment, the product appears here for life."
          action={
            <Link to="/categories" className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground press3d">
              Browse products
            </Link>
          }
        />
      )}

      <div className="grid gap-2.5 md:grid-cols-2">
        {purchases.map((purchase) => (
          <LibraryCard key={purchase.id} purchase={purchase} product={products[purchase.product_id]} />
        ))}
      </div>

      {!loading && purchases.length > 0 && (
        <p className="mt-3 flex items-center gap-1.5 rounded-xl bg-secondary p-2.5 text-[11px] text-secondary-foreground">
          <Download className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Download links expire after one hour for security — open this page again whenever you need a fresh link.
        </p>
      )}
    </div>
  );
}