import { cn } from "@/lib/utils";

export const inputClass =
  "h-10 w-full rounded-xl border border-border bg-white px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

export const textareaClass =
  "w-full rounded-xl border border-border bg-white p-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

export function Field({ label, hint, children, className }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[10.5px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "flex items-center gap-2 rounded-xl border px-3 py-2 text-[12px] font-semibold transition",
        checked ? "border-primary bg-secondary text-primary" : "border-border bg-white text-slate-500"
      )}
    >
      <span
        className={cn(
          "relative h-4 w-7 rounded-full transition",
          checked ? "bg-primary" : "bg-slate-300"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all",
            checked ? "left-3.5" : "left-0.5"
          )}
        />
      </span>
      {label}
    </button>
  );
}

export function AdminCard({ title, description, children, action }) {
  return (
    <section className="rounded-2xl border border-border bg-white p-4">
      {(title || action) && (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-sm font-bold text-foreground">{title}</h2>}
            {description && <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}