const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Bookmark, ChevronRight, Clock, Info, Loader2, MessageCircle, Sparkles, X } from "lucide-react";

import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/context/CartContext";
import { useSettings, whatsappLink } from "@/hooks/useSettings";
import { useProductPurchase } from "@/hooks/useProductPurchase";
import Seo from "@/components/Seo";
import LinkifiedText from "@/components/LinkifiedText";
import RatioImage from "@/components/RatioImage";
import Stars from "@/components/Stars";
import ProductGallery from "@/components/ProductGallery";
import ProductOptions from "@/components/ProductOptions";
import PromptLock from "@/components/PromptLock";
import ReviewList from "@/components/ReviewList";
import ReviewForm from "@/components/ReviewForm";
import ProductCard from "@/components/ProductCard";
import ShareSheet from "@/components/ShareSheet";
import { discountPct, inr } from "@/lib/format";
import { getProductOptions } from "@/lib/productOptions";
import { cn } from "@/lib/utils";

const TYPE_LABEL = {
  template: "Website / app template",
  prompt: "Prompt pack",
  code_file: "Complete code file",
  course: "Course",
  software: "Software",
  ebook: "PDF book",
  service: "Setup & maintenance",
};

function youtubeId(url) {
  const match = String(url || "").match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/);
  return match ? match[1] : null;
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addItem, has } = useCart();
  const settings = useSettings();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPolicy, setShowPolicy] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const { purchased, ownedOptions, saved, toggleSave } = useProductPurchase({ product, user, isAuthenticated });

  useEffect(() => {
    let alive = true;
    setLoading(true);
    db.entities.Product.filter({ slug })
      .then((rows) => {
        if (!alive) return;
        const found = Array.isArray(rows) ? rows[0] || null : null;
        setProduct(found);
        setLoading(false);
        if (found) {
          db.entities.Review.filter({ product_id: found.id }, { sort: "-created_date", limit: 30 })
            .then((page) => alive && setReviews((page.items || []).filter((r) => !r.is_hidden)))
            .catch(() => {});
          db.entities.Product.filter(
            { category_id: found.category_id, is_active: true },
            { sort: "-sales_count", limit: 8 }
          )
            .then((page) => alive && setSimilar((page.items || []).filter((p) => p.id !== found.id).slice(0, 6)))
            .catch(() => {});
        }
      })
      .catch(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [slug, reloadKey]);

  const ratingInfo = useMemo(() => {
    if (!reviews.length) return { avg: Number(product?.rating_avg) || 0, count: Number(product?.rating_count) || 0 };
    const sum = reviews.reduce((total, r) => total + Number(r.rating || 0), 0);
    return { avg: sum / reviews.length, count: reviews.length };
  }, [reviews, product]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-lg font-bold text-foreground">Product not found</h1>
        <Link to="/categories" className="mt-3 inline-block rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">
          Browse categories
        </Link>
      </div>
    );
  }

  const off = discountPct(product.original_price, product.discounted_price);
  const options = getProductOptions(product);
  const selectedOption = options.find((o) => o.key === selectedKey) || options[0];
  const inCart = has(product.id, selectedOption.key);
  const video = youtubeId(product.youtube_url);
  const isService = product.type === "service";
  const devLink = whatsappLink(
    product.developer_whatsapp || settings.support_whatsapp,
    `Hi, I'm interested in "${product.title}" (${inr(product.discounted_price)}).`
  );

  const buyNow = () => {
    addItem(product, selectedOption);
    navigate("/checkout");
  };

  return (
    <div className="pb-40 md:pb-10">
      <Seo
        title={product.seo_title || `${product.title} — Gabru Education`}
        description={product.seo_description || product.short_description}
        keywords={product.seo_keywords}
        image={product.images?.[0]}
        path={`/product/${product.slug}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          description: product.seo_description || product.short_description,
          image: product.images || [],
          brand: { "@type": "Brand", name: "Gabru Education" },
          aggregateRating:
            ratingInfo.count > 0
              ? { "@type": "AggregateRating", ratingValue: Number(ratingInfo.avg.toFixed(1)), reviewCount: ratingInfo.count }
              : undefined,
          offers: {
            "@type": "Offer",
            price: Number(product.discounted_price) || 0,
            priceCurrency: "INR",
            availability: "https://schema.org/InStock",
          },
        }}
      />

      <nav className="mb-2 flex items-center gap-1 overflow-x-auto text-[11px] text-muted-foreground no-scrollbar">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/categories" className="hover:text-primary">
          {product.category_name || "Store"}
        </Link>
      </nav>

      <div className="grid gap-3 [&>*]:min-w-0 lg:grid-cols-2 lg:gap-5">
        <ProductGallery images={product.images} title={product.title} />

        <div>
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-secondary-foreground">
              {TYPE_LABEL[product.type] || "Digital product"}
            </span>
            {product.badge && product.badge !== "none" && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
                {product.badge.replace("_", " ")}
              </span>
            )}
          </div>

          <h1 className="mt-2 text-lg font-extrabold leading-tight text-foreground md:text-xl">
            {product.title}
          </h1>

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Stars value={ratingInfo.avg} size={13} showValue count={ratingInfo.count} />
            <span className="text-[11px] text-muted-foreground">
              {product.sales_count || 0} sold
            </span>
            {product.prompt_char_count > 0 && (
              <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                {Number(product.prompt_char_count).toLocaleString("en-IN")} chars
              </span>
            )}
          </div>

          {product.short_description && (
            <p className="mt-2 text-[12.5px] leading-relaxed text-slate-600">{product.short_description}</p>
          )}

          {isService ? (
            <>
              <div className="mt-3 rounded-2xl border border-border bg-white p-3">
                <div className="flex flex-wrap items-end gap-2">
                  <span className="text-2xl font-extrabold text-foreground">{inr(product.discounted_price)}</span>
                  {Number(product.original_price) > Number(product.discounted_price) && (
                    <>
                      <span className="text-sm text-muted-foreground line-through">{inr(product.original_price)}</span>
                      <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-bold text-emerald-600">
                        {off}% off
                      </span>
                    </>
                  )}
                </div>
                <div className="mt-2 space-y-1 text-[12px] text-slate-600">
                  <p>
                    Monthly salary <b className="text-foreground">{inr(product.service_monthly_min || 0)} – {inr(product.service_monthly_max || 0)}</b>
                  </p>
                  <p>
                    Advance to start <b className="text-foreground">{inr(product.service_advance || 5000)}</b>
                  </p>
                  {product.developer_name && (
                    <p>Developer: <b className="text-foreground">{product.developer_name}</b></p>
                  )}
                  {devLink && (
                    <a
                      href={devLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1.5 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-white press3d"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      Contact developer on WhatsApp
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-2.5 flex gap-2">
                {purchased ? (
                  <Link
                    to="/library"
                    className="flex h-11 flex-1 items-center justify-center rounded-xl bg-emerald-500 text-xs font-bold text-white press3d"
                  >
                    Open in my library
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={buyNow}
                    className="h-11 flex-1 rounded-xl bg-primary text-xs font-bold text-primary-foreground press3d"
                  >
                    Buy now
                  </button>
                )}
              </div>
            </>
          ) : (
            <ProductOptions
              options={options}
              selectedKey={selectedOption.key}
              onSelect={setSelectedKey}
              ownedOptions={ownedOptions}
              inCart={inCart}
              mrp={Number(product.original_price) || 0}
              onBuyNow={buyNow}
              onAddToCart={() => addItem(product, selectedOption)}
              onShowPolicy={() => setShowPolicy(true)}
            />
          )}
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSave}
              aria-label={saved ? "Remove from saved" : "Save product"}
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-xl border press3d",
                saved ? "border-primary bg-secondary text-primary" : "border-border bg-white text-slate-500"
              )}
            >
              <Bookmark className={cn("h-4 w-4", saved && "fill-primary")} aria-hidden="true" />
            </button>
            <ShareSheet
              url={typeof window !== "undefined" ? window.location.href : ""}
              title={product.title}
              className="h-10 w-10"
            />
            <span className="text-[10.5px] font-medium text-muted-foreground">
              Save it, or share it with a friend
            </span>
          </div>
        </div>
      </div>

      {video && (
        <section className="mt-5">
          <h2 className="mb-2 text-sm font-bold text-foreground">Watch it in action</h2>
          <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${video}`}
              title={`${product.title} demo`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </section>
      )}

      {product.has_prompt && (
        <div className="mt-5">
          <PromptLock product={product} />
        </div>
      )}

      {product.description && (
        <section className="mt-5 rounded-2xl border border-border bg-white p-3.5">
          <h2 className="mb-1.5 text-sm font-bold text-foreground">About this product</h2>
          <LinkifiedText
            text={product.description}
            className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-slate-600"
          />
          {Array.isArray(product.description_images) && product.description_images.length > 0 && (
            <div className="mt-3 space-y-2">
              {product.description_images.map((src, i) => (
                <RatioImage
                  key={`${src}-${i}`}
                  src={src}
                  alt={`${product.title} detail ${i + 1}`}
                  className="rounded-xl border border-border"
                />
              ))}
            </div>
          )}
        </section>
      )}

      {Array.isArray(product.tags) && product.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {product.tags.map((tag) => (
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

      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Reviews ({ratingInfo.count})</h2>
          {ratingInfo.count > 0 && <Stars value={ratingInfo.avg} size={12} showValue />}
        </div>
        {purchased && (
          <div className="mb-3">
            <ReviewForm productId={product.id} onSubmitted={() => setReloadKey((k) => k + 1)} />
          </div>
        )}
        {!purchased && (
          <p className="mb-2 flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-[11px] font-medium text-secondary-foreground">
            <Info className="h-3.5 w-3.5" aria-hidden="true" />
            Buyers can post a photo review after downloading this product.
          </p>
        )}
        <ReviewList reviews={reviews} />
      </section>

      {similar.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            Similar products
          </h2>
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
            {similar.slice(0, 4).map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky mobile buy bar */}
      <div className="above-bottom-nav fixed inset-x-0 z-30 border-t border-border bg-white/95 px-3 py-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold text-foreground">{product.title}</p>
            <p className="truncate text-[13px] font-extrabold text-foreground">
              {inr(selectedOption.payNow)}
              <span className="ml-1 text-[10px] font-semibold text-muted-foreground">{selectedOption.label}</span>
            </p>
          </div>
          {purchased ? (
            <Link to="/library" className="shrink-0 rounded-xl bg-emerald-500 px-4 py-2.5 text-[11px] font-bold text-white">
              Download
            </Link>
          ) : (
            <button type="button" onClick={buyNow} className="shrink-0 whitespace-nowrap rounded-xl bg-primary px-4 py-2.5 text-[11px] font-bold text-primary-foreground press3d">
              Buy now
            </button>
          )}
        </div>
      </div>

      {showPolicy && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 md:items-center md:p-4">
          <div className="w-full max-w-md rounded-t-3xl bg-white p-4 md:rounded-3xl">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Refund policy</h3>
              <button type="button" onClick={() => setShowPolicy(false)} aria-label="Close">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            <p className="flex items-start gap-1.5 rounded-xl bg-secondary p-2.5 text-[11.5px] font-semibold text-secondary-foreground">
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {settings.refund_enabled
                ? `Refunds accepted within ${settings.refund_days || 0} day(s) of purchase.`
                : "All products are non-refundable by default."}
            </p>
            <p className="mt-2.5 whitespace-pre-wrap text-[12px] leading-relaxed text-slate-600">
              {settings.refund_policy}
            </p>
            <button
              type="button"
              onClick={() => setShowPolicy(false)}
              className="mt-3 w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}