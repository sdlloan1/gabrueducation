const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function inr(value) {
  const n = Number(value) || 0;
  return inrFormatter.format(n);
}

export function discountPct(original, discounted) {
  const o = Number(original) || 0;
  const d = Number(discounted) || 0;
  if (!o || d >= o) return 0;
  return Math.round(((o - d) / o) * 100);
}

export function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 70);
}

export function truncate(text, max = 140) {
  const s = String(text || "");
  return s.length > max ? s.slice(0, max).trimEnd() + "…" : s;
}

export function first30Percent(text) {
  const s = String(text || "");
  return s.slice(0, Math.max(1, Math.round(s.length * 0.3)));
}

export function formatDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function timeLeft(deadline) {
  const ms = new Date(deadline).getTime() - Date.now();
  if (Number.isNaN(ms) || ms <= 0) return "0h 00m";
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}