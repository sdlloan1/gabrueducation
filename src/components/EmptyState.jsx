import { cn } from "@/lib/utils";

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn("rounded-3xl border border-dashed border-border bg-card px-6 py-12 text-center", className)}>
      {Icon && (
        <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-primary">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      )}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}