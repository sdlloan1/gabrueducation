const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Search } from "lucide-react";

import { Image } from "@/components/ui/image";
import { inr } from "@/lib/format";
import { buildSearchQuery } from "@/lib/searchQuery";

export default function SearchBar({ initialValue = "" }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const term = query.trim();

  useEffect(() => {
    const onClickAway = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, []);

  useEffect(() => {
    if (term.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    const timer = setTimeout(() => {
      db.entities.Product.filter(
        { is_active: true, ...buildSearchQuery(term) },
        { sort: "-sales_count", limit: 6 }
      )
        .then((page) => {
          if (!alive) return;
          setSuggestions(page.items || []);
          setLoading(false);
        })
        .catch(() => {
          if (!alive) return;
          setSuggestions([]);
          setLoading(false);
        });
    }, 220);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [term]);

  const submit = (event) => {
    event.preventDefault();
    if (!term) return;
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div ref={wrapRef} className="relative">
      <form onSubmit={submit}>
        <Search className="pointer-events-none absolute left-4 top-6 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search templates, prompts, courses…"
          aria-label="Search products"
          className="h-12 w-full rounded-2xl border border-border bg-white pl-11 pr-24 text-sm shadow-[0_10px_30px_-24px_rgba(30,41,59,0.6)] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-6 -translate-y-1/2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground press3d"
        >
          Search
        </button>
      </form>

      {open && term.length >= 2 && (
        <div className="absolute inset-x-0 top-[52px] z-40 overflow-hidden rounded-2xl border border-border bg-white shadow-xl">
          {loading && suggestions.length === 0 && (
            <p className="flex items-center gap-2 px-3 py-3 text-[11px] text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Searching…
            </p>
          )}

          {!loading && suggestions.length === 0 && (
            <p className="px-3 py-3 text-[11px] text-muted-foreground">
              No match for “{term}” — press Search to see all results.
            </p>
          )}

          {suggestions.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 border-b border-border/60 px-2.5 py-2 last:border-0 hover:bg-muted"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-white">
                <Image src={product.images?.[0]} alt={product.title} className="h-full w-full" fittingType="fit" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-1 block text-[12px] font-semibold text-foreground">{product.title}</span>
                <span className="line-clamp-1 block text-[10.5px] text-muted-foreground">
                  {product.category_name || product.short_description || "Digital product"}
                </span>
              </span>
              <span className="shrink-0 text-[11px] font-bold text-primary">{inr(product.discounted_price)}</span>
            </Link>
          ))}

          {suggestions.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate(`/search?q=${encodeURIComponent(term)}`);
              }}
              className="w-full bg-secondary px-3 py-2 text-left text-[11px] font-bold text-secondary-foreground"
            >
              See all results for “{term}”
            </button>
          )}
        </div>
      )}
    </div>
  );
}