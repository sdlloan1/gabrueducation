import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

// Shared shell for static content pages (privacy, terms, about, FAQ).
export default function LegalLayout({ title, subtitle, updated, children }) {
  return (
    <div className="animate-tilt-in mx-auto max-w-2xl">
      <Link to="/" className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to store
      </Link>
      <article className="rounded-2xl border border-border bg-white p-4 md:p-6">
        <h1 className="text-lg font-extrabold text-foreground md:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">{subtitle}</p>}
        {updated && (
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Last updated {updated}
          </p>
        )}
        <div className="mt-4 space-y-5">{children}</div>
      </article>
    </div>
  );
}

export function Section({ heading, children }) {
  return (
    <section>
      <h2 className="text-sm font-bold text-foreground md:text-[15px]">{heading}</h2>
      <div className="mt-1.5 space-y-2 text-[12.5px] leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}