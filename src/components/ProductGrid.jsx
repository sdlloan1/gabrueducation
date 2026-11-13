const db = globalThis.__B44_DB__ || {
  entities: new Proxy(
    {},
    {
      get: () => ({ filter: async () => [], get: async () => null, create: async () => ({}), update: async () => ({}), delete: async () => ({}) }),
    }
  ),
};

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import ProductCard from "@/components/ProductCard";
import EmptyState from "@/components/EmptyState";

/**
 * Queries Product records and renders them as a responsive card grid with a
 * "Load more" button. The query is memoised so fetching only re-runs when the
 * caller actually changes the filter or the sort.
 */
export default function ProductGrid({ query = {}, sort = "-created_date", pageSize = 12, emptyState = null }) {
  const queryKey = useMemo(() => JSON.stringify(query || {}), [query]);
  const parsedQuery = useMemo(() => JSON.parse(queryKey), [queryKey]);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(pageSize);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setItems([]);
    setTotal(0);
    setLimit(pageSize);
  }, [queryKey, sort, pageSize]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    db.entities.Product.filter(parsedQuery, { sort, limit })
      .then((page) => {
        if (!alive) return;
        const rows = Array.isArray(page) ? page : page.items || [];
        setItems(rows);
        setTotal(Array.isArray(page) ? rows.length : page.total ?? rows.length);
      })
      .catch(() => {
        if (alive) setItems([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [parsedQuery, sort, limit]);

  if (loading && items.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[230px] animate-pulse rounded-2xl border border-border bg-white" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return emptyState || <EmptyState title="Nothing here yet" description="New products are added every week." />;
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {items.length < total && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setLimit((current) => current + pageSize)}
            disabled={loading}
            className="flex h-10 items-center gap-2 rounded-xl border border-border bg-white px-4 text-xs font-bold text-foreground press3d disabled:opacity-60"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
