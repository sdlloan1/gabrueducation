const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Download,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import { Image } from "@/components/ui/image";
import Seo from "@/components/Seo";
import ProductCard from "@/components/ProductCard";
import BannerCarousel from "@/components/BannerCarousel";
import SearchBar from "@/components/SearchBar";
import SectionHeader from "@/components/SectionHeader";
import FaqAccordion from "@/components/content/FaqAccordion";
import { HOME_FAQS } from "@/data/faqs";
import { useSettings, whatsappLink } from "@/hooks/useSettings";
import { discountPct, formatDate } from "@/lib/format";

function CategoryChip({ category, count }) {
  return (
    <Link to={`/category/${category.slug}`} className="card3d w-[92px] shrink-0 snap-item text-center sm:w-[110px]">
      <span className="mx-auto grid h-[68px] w-[68px] place-items-center overflow-hidden rounded-3xl border border-border bg-white clay sm:h-20 sm:w-20">
        <Image src={category.image_url} alt={category.name} className="h-full w-full object-cover" />
      </span>
      <span className="mt-1.5 block text-[11px] font-semibold leading-tight text-foreground">{category.name}</span>
      <span className="text-[10px] text-muted-foreground">{count} items</span>
    </Link>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const settings = useSettings();
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [counts, setCounts] = useState({});
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    db.entities.Banner.filter({ is_active: true }, { sort: "sort_order", limit: 6 })
      .then((page) => setBanners(page.items || []))
      .catch(() => {});
    db.entities.Category.filter({ is_active: true }, { sort: "sort_order", limit: 12 })
      .then((page) => setCategories(page.items || []))
      .catch(() => {});
    db.entities.Product.aggregate({ query: { is_active: true }, groupBy: "category_id" })
      .then((res) => {
        const map = {};
        (res?.rows || []).forEach((row) => {
          map[row.category_id] = row.count;
        });
        setCounts(map);
      })
      .catch(() => {});
    db.entities.Product.filter({ is_active: true }, { sort: "-sales_count", limit: 12 })
      .then((page) => setProducts(page.items || []))
      .catch(() => {});
    db.entities.Product.filter({ is_active: true, is_featured: true }, { sort: "-rating_avg", limit: 8 })
      .then((page) => setFeatured(page.items || []))
      .catch(() => {});
    db.entities.Blog.filter({ is_published: true }, { sort: "-created_date", limit: 3 })
      .then((page) => setPosts(page.items || []))
      .catch(() => {});
  }, []);

  const offers = [...products]
    .filter((p) => discountPct(p.original_price, p.discounted_price) > 0)
    .sort((a, b) => discountPct(b.original_price, b.discounted_price) - discountPct(a.original_price, a.discounted_price))
    .slice(0, 5);
  const bestChoice = featured.length ? featured : products.slice(0, 5);
  const support = whatsappLink(
    settings.support_whatsapp,
    "Hi Gabru Education, I need help choosing a template."
  );

  return (
    <div className="animate-tilt-in">
      <Seo
        title="Gabru Education — Website Templates, AI Prompts, Courses & Tools"
        description="Buy premium website and app templates, complete code files, AI prompt packs, courses, software tools and PDF books. Lifetime access, prices in INR."
        keywords={["website templates", "app templates", "AI prompts", "courses", "digital products India"]}
        image={banners[0]?.image_url}
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Gabru Education",
          url: window.location.origin,
          potentialAction: {
            "@type": "SearchAction",
            target: `${window.location.origin}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />

      <section className="mb-3 md:mb-5">
        <h1 className="font-heading text-[21px] font-extrabold leading-tight text-foreground md:text-3xl">
          Gabru Education — website templates, AI prompts & digital tools
        </h1>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground md:text-sm">
          Buy ready-to-launch website and app templates, complete code files, AI prompt packs, online
          courses, software tools and PDF books in INR. Every purchase unlocks lifetime access in your
          library once your UPI payment is approved.
        </p>
      </section>

      <section className="mb-4 md:mb-6">
        <SearchBar />
        <div className="mt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="shrink-0 text-[11px] font-medium text-muted-foreground">Popular:</span>
          {["Website template", "Prompt pack", "Next.js", "eBook"].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
              className="shrink-0 rounded-full border border-border bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-primary hover:text-primary"
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {banners.length > 0 && <BannerCarousel banners={banners} />}

      <section className="my-4 grid grid-cols-3 gap-2 md:my-6">
        {[
          { Icon: Zap, label: "Instant delivery", sub: "After approval" },
          { Icon: ShieldCheck, label: "Secure UPI", sub: "Manual verify" },
          { Icon: Download, label: "Lifetime access", sub: "Pay once" },
        ].map(({ Icon, label, sub }) => (
          <div key={label} className="rounded-2xl border border-border bg-white px-2 py-2.5 text-center clay">
            <Icon className="mx-auto mb-1 h-4 w-4 text-primary" aria-hidden="true" />
            <p className="text-[11px] font-bold leading-tight text-foreground">{label}</p>
            <p className="text-[10px] text-muted-foreground">{sub}</p>
          </div>
        ))}
      </section>

      {categories.length > 0 && (
        <section className="mb-6">
          <SectionHeader title="Shop by category" subtitle="Templates, prompts, courses & more" linkTo="/categories" />
          <div className="snap-row -mx-3 flex gap-3 overflow-x-auto px-3 pb-1 no-scrollbar md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
            {categories.map((category) => (
              <CategoryChip key={category.id} category={category} count={counts[category.id] || 0} />
            ))}
          </div>
        </section>
      )}

      {bestChoice.length > 0 && (
        <section className="mb-6">
          <SectionHeader title="Best choice" subtitle="Top-rated picks from our team" icon={BadgeCheck} linkTo="/search?q=template" />
          <div className="snap-row -mx-3 flex gap-3 overflow-x-auto px-3 pb-2 no-scrollbar">
            {bestChoice.slice(0, 5).map((product) => (
              <ProductCard key={product.id} product={product} variant="strip" />
            ))}
          </div>
        </section>
      )}

      {offers.length > 0 && (
        <section className="mb-6 rounded-3xl bg-gradient-to-br from-primary to-blue-500 p-3.5 md:p-5">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-[17px] font-bold text-white">
                <Sparkles className="h-4 w-4" aria-hidden="true" /> Best offer
              </h2>
              <p className="mt-0.5 text-xs text-white/80">Biggest discounts right now</p>
            </div>
            <Link to="/categories" className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
              See all
            </Link>
          </div>
          <div className="snap-row -mx-1 flex gap-3 overflow-x-auto px-1 pb-1 no-scrollbar">
            {offers.map((product) => (
              <ProductCard key={product.id} product={product} variant="strip" />
            ))}
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="mb-6">
          <SectionHeader title="Trending now" subtitle="What buyers are picking this week" linkTo="/categories" />
          <div className="snap-row -mx-3 flex gap-3 overflow-x-auto px-3 pb-2 no-scrollbar">
            {products.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} variant="strip" />
            ))}
          </div>
        </section>
      )}

      {products.length === 0 && (
        <section className="mb-6 rounded-3xl border border-dashed border-border bg-white p-8 text-center">
          <h2 className="text-base font-bold text-foreground">Your store is being stocked</h2>
          <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">
            Products appear here as soon as they are published from the admin panel.
          </p>
        </section>
      )}

      {posts.length > 0 && (
        <section className="mb-6">
          <SectionHeader title="From the blog" subtitle="SEO, templates and growing an online store" linkTo="/blog" icon={BookOpen} />
          <div className="grid gap-3 md:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="card3d flex gap-3 overflow-hidden rounded-2xl border border-border bg-card p-2.5 clay"
              >
                <Image src={post.cover_image} alt={post.title} className="h-20 w-24 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-foreground">{post.title}</h3>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-muted-foreground">{post.excerpt}</p>
                  <span className="mt-1 inline-block text-[10px] font-semibold text-primary">
                    {formatDate(post.created_date)} · {post.read_time || 5} min read
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mb-6">
        <SectionHeader title="Frequently asked questions" subtitle="Payments, delivery, licensing & support" linkTo="/faq" />
        <FaqAccordion faqs={HOME_FAQS} />
      </section>

      <section className="overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50 p-4 md:p-5">
        {support ? (
          <a href={support} target="_blank" rel="noreferrer" className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-500 text-white press3d">
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-emerald-950">Need help choosing a template?</h2>
              <p className="text-[11px] text-emerald-800">
                Chat with our team on WhatsApp — setup and maintenance plans available.
              </p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
          </a>
        ) : (
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-500 text-white">
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-emerald-950">Lifetime access on every product</h2>
              <p className="text-[11px] text-emerald-800">
                Files unlock automatically once your UPI payment is approved.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}