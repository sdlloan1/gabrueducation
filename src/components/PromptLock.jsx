const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Check, Copy, Loader2, Lock, Sparkles } from "lucide-react";

import { useAuth } from "@/lib/AuthContext";
import { toast } from "@/components/ui/use-toast";

/**
 * Shows the first 30% of a prompt for free; the rest is blurred until the buyer pays.
 */
export default function PromptLock({ product }) {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !product?.id) return;
    let alive = true;
    setLoading(true);
    db.functions
      .invoke("productContent", { product_id: product.id })
      .then((res) => alive && setData(res.data))
      .catch(() => alive && setData(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [isAuthenticated, product?.id]);

  const chars = Number(data?.prompt_char_count || product.prompt_char_count || 0);
  const preview = data?.entitled ? data.prompt_text : data?.prompt_preview || product.prompt_preview || "";
  const unlocked = Boolean(data?.entitled) && Boolean(data?.prompt_text);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(data.prompt_text);
      setCopied(true);
      toast({ title: "Prompt copied", description: `${chars.toLocaleString("en-IN")} characters copied to clipboard.` });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Copy failed", description: "Select the text and copy manually.", variant: "destructive" });
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-white p-3.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-sm font-bold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
          {unlocked ? "Your prompt" : "Prompt preview (30% free)"}
        </h2>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-secondary-foreground">
          {chars.toLocaleString("en-IN")} characters
        </span>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-border bg-slate-50">
        <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-[11.5px] leading-relaxed text-slate-700">
          {loading ? "Checking your access…" : preview || "Prompt preview unavailable."}
        </pre>

        {!unlocked && (
          <>
            <div className="space-y-1.5 px-3 pb-3" aria-hidden="true">
              {[96, 100, 88, 94, 70].map((w, i) => (
                <div
                  key={i}
                  className="h-2.5 rounded-full bg-slate-300/80"
                  style={{ width: `${w}%`, filter: "blur(3px)" }}
                />
              ))}
            </div>
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 rounded-b-xl bg-gradient-to-t from-white via-white/95 to-white/40 px-4 pb-4 pt-10 text-center">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground press3d">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" aria-hidden="true" />}
              </span>
              <p className="text-[12px] font-bold text-foreground">The remaining 70% unlocks after payment</p>
              <p className="text-[11px] text-muted-foreground">
                Buy once — the full {chars.toLocaleString("en-IN")}-character prompt stays in your library for life.
              </p>
            </div>
          </>
        )}
      </div>

      {unlocked && (
        <button
          type="button"
          onClick={copy}
          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground press3d"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied!" : "Copy full prompt"}
        </button>
      )}
    </section>
  );
}