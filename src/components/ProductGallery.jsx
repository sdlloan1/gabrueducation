import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";

export default function ProductGallery({ images = [], title = "" }) {
  const [active, setActive] = useState(0);
  const [dims, setDims] = useState({});
  const trackRef = useRef(null);
  const list = (images || []).filter(Boolean);

  if (!list.length) {
    return <div className="h-[42vh] max-h-[360px] w-full rounded-2xl border border-border bg-secondary" />;
  }

  const goTo = (index) => {
    const el = trackRef.current;
    const next = Math.max(0, Math.min(list.length - 1, index));
    if (el) el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    setActive(next);
  };

  const handleScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    if (index !== active && index >= 0 && index < list.length) setActive(index);
  };

  // Measure each photo once so the slide can show it at its own shape, never cropped.
  const rememberSize = (src) => (event) => {
    const el = event?.currentTarget;
    if (!el?.naturalWidth || !el?.naturalHeight) return;
    setDims((prev) =>
      prev[src] ? prev : { ...prev, [src]: { width: el.naturalWidth, height: el.naturalHeight } }
    );
  };

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl border border-border bg-secondary clay">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory overflow-x-auto no-scrollbar"
        >
          {list.map((src, i) => (
            <div key={`${src}-${i}`} className="w-full shrink-0 snap-center">
              <div className="flex h-[42vh] max-h-[360px] min-h-[190px] w-full items-center justify-center px-3 md:h-auto md:max-h-none md:min-h-0 md:aspect-[16/11] md:px-4">
                <Image
                  src={src}
                  alt={`${title} — image ${i + 1}`}
                  className={cn(
                    "max-w-full overflow-hidden rounded-xl shadow-[0_16px_34px_-22px_rgba(15,23,42,0.55)]",
                    dims[src] ? "h-full w-auto" : "h-full w-full"
                  )}
                  fittingType="fit"
                  originWidth={dims[src]?.width}
                  originHeight={dims[src]?.height}
                  onLoad={rememberSize(src)}
                  priority={i === 0 ? "high" : undefined}
                />
              </div>
            </div>
          ))}
        </div>

        {list.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              disabled={active === 0}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-border bg-white/90 text-slate-700 shadow-sm disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              disabled={active === list.length - 1}
              aria-label="Next image"
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-border bg-white/90 text-slate-700 shadow-sm disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="absolute bottom-2 right-2 rounded-full bg-slate-900/70 px-2 py-0.5 text-[10px] font-semibold text-white">
              {active + 1}/{list.length}
            </span>
          </>
        )}
      </div>

      {list.length > 1 && (
        <div className="mt-1.5 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {list.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show image ${i + 1}`}
              className={cn(
                "h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition",
                i === active ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image src={src} alt="" className="h-full w-full p-0.5" fittingType="fit" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}