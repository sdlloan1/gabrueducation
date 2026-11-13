const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, Download, FileText, Loader2 } from "lucide-react";

import { Image } from "@/components/ui/image";
import { toast } from "@/components/ui/use-toast";
import { inr } from "@/lib/format";

export default function LibraryCard({ purchase, product }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await db.functions.invoke("productContent", { product_id: purchase.product_id });
      setContent(res.data);
      return res.data;
    } catch (error) {
      toast({ title: "Could not unlock", description: error.message, variant: "destructive" });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const download = async () => {
    const data = content || (await fetchContent());
    const url = owned === "prompt" ? data?.prompt_file_url : data?.file_url || data?.prompt_file_url;
    if (url) window.open(url, "_blank", "noopener");
    else toast({ title: "No file attached", description: "This product unlocks a prompt to copy instead.", variant: "destructive" });
  };

  const copyPrompt = async () => {
    const data = content || (await fetchContent());
    if (!data?.prompt_text) {
      toast({ title: "Nothing to copy", description: "This product has no prompt text.", variant: "destructive" });
      return;
    }
    try {
      await navigator.clipboard.writeText(data.prompt_text);
      setCopied(true);
      toast({ title: "Prompt copied", description: `${data.prompt_text.length.toLocaleString("en-IN")} characters.` });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const image = product?.images?.[0] || "";
  const owned = purchase.option || "full";
  const downloadLabel = owned === "prompt" ? "Download prompt" : "Download code";

  return (
    <div className="rounded-2xl border border-border bg-white p-2.5">
      <div className="flex gap-2.5">
        <Link to={`/product/${purchase.product_slug || product?.slug || ""}`} className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary">
          <Image src={image} alt={purchase.product_title} className="h-full w-full object-cover" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            to={`/product/${purchase.product_slug || product?.slug || ""}`}
            className="line-clamp-2 text-[12.5px] font-semibold text-foreground"
          >
            {purchase.product_title}
          </Link>
          <p className="mt-0.5 text-[10.5px] text-muted-foreground">
            {purchase.option_label ? `${purchase.option_label} · ` : ""}paid {inr(purchase.price_paid)}
          </p>
        </div>
      </div>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={download}
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-[11px] font-bold text-primary-foreground press3d disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" aria-hidden="true" />}
          {downloadLabel}
        </button>
        {product?.has_prompt && (
          <button
            type="button"
            onClick={copyPrompt}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-[11px] font-bold text-primary press3d disabled:opacity-60"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
            Prompt
          </button>
        )}
        <Link
          to={`/product/${purchase.product_slug || product?.slug || ""}`}
          className="grid w-9 place-items-center rounded-xl border border-border bg-white text-slate-500"
          aria-label="Open product page"
        >
          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}