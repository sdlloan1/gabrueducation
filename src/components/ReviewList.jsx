import { Image } from "@/components/ui/image";
import Stars from "@/components/Stars";
import { formatDate } from "@/lib/format";

function initials(name) {
  return String(name || "G")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ReviewList({ reviews = [] }) {
  if (!reviews.length) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-white px-4 py-6 text-center text-xs text-muted-foreground">
        No reviews yet. Buyers can review this product after download.
      </p>
    );
  }

  return (
    <div className="space-y-2.5">
      {reviews.map((review) => (
        <article key={review.id} className="rounded-2xl border border-border bg-white p-3">
          <header className="flex items-center gap-2">
            {review.avatar_url ? (
              <Image src={review.avatar_url} alt={review.name} className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-[11px] font-bold text-primary">
                {initials(review.name)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-[12.5px] font-bold text-foreground">{review.name}</p>
                {review.is_verified && (
                  <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-600">
                    Verified
                  </span>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-2">
                <Stars value={review.rating} size={11} />
                <span className="text-[10px] text-muted-foreground">{formatDate(review.created_date)}</span>
              </div>
            </div>
          </header>
          {review.title && <p className="mt-2 text-[12.5px] font-semibold text-foreground">{review.title}</p>}
          {review.comment && (
            <p className="mt-1 text-[12px] leading-relaxed text-slate-600">{review.comment}</p>
          )}
          {Array.isArray(review.images) && review.images.length > 0 && (
            <div className="mt-2 flex gap-1.5 overflow-x-auto no-scrollbar">
              {review.images.map((src, i) => (
                <Image key={`${src}-${i}`} src={src} alt="" className="h-16 w-16 rounded-lg object-cover" />
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}