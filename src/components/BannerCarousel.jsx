import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";

export default function BannerCarousel({ banners = [] }) {
  const [index, setIndex] = useState(0);
  const count = banners.length;

  useEffect(() => {
    if (count < 2) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 4500);
    return () => clearInterval(id);
  }, [count]);

  if (!count) return null;

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-3xl border border-border bg-card clay">
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)]"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {banners.map((banner, i) => (
            <Link
              key={banner.id || i}
              to={banner.link || "/categories"}
              className="relative block w-full shrink-0"
              aria-label={banner.title}
            >
              <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
                <Image src={banner.image_url} alt={banner.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/72 via-slate-900/35 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-center gap-1.5 p-5 sm:p-8">
                  <span className="w-fit rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur">
                    {banner.badge || "Featured"}
                  </span>
                  <h2 className="max-w-[80%] text-lg font-extrabold leading-tight text-white sm:text-2xl">
                    {banner.title}
                  </h2>
                  <p className="max-w-[78%] text-[11px] font-medium leading-snug text-white/85 sm:text-sm">
                    {banner.subtitle}
                  </p>
                  <span className="mt-1.5 inline-flex w-fit items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-primary shadow-sm">
                    {banner.cta_label || "Explore"}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      {count > 1 && (
        <div className="mt-2.5 flex justify-center gap-1.5">
          {banners.map((banner, i) => (
            <button
              key={banner.id || i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to banner ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-5 bg-primary" : "w-1.5 bg-slate-300 hover:bg-slate-400"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}