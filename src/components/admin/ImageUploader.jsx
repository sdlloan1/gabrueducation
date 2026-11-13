const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";

import { Image } from "@/components/ui/image";
import { toast } from "@/components/ui/use-toast";

export default function ImageUploader({ value = [], onChange, max = 6, label = "Photos" }) {
  const [busy, setBusy] = useState(false);

  const upload = async (event) => {
    const files = Array.from(event.target.files || []).slice(0, max - value.length);
    if (!files.length) return;
    setBusy(true);
    try {
      const urls = [];
      for (const file of files) {
        // Product and marketing photos are public: they render on the storefront.
        const { file_url } = await db.integrations.Core.UploadPublicFile({ file });
        if (file_url) urls.push(file_url);
      }
      onChange([...value, ...urls].slice(0, max));
    } catch (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-2">
        {value.map((src, index) => (
          <div key={`${src}-${index}`} className="relative h-20 w-24 overflow-hidden rounded-xl border border-border bg-white">
            <Image src={src} alt="" className="h-full w-full" fittingType="fit" />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
              aria-label="Remove image"
              className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-slate-900/80 text-white"
            >
              <X className="h-3 w-3" />
            </button>
            {index === 0 && (
              <span className="absolute bottom-1 left-1 rounded bg-slate-900/70 px-1 text-[8px] font-bold uppercase text-white">
                Cover
              </span>
            )}
          </div>
        ))}
        {value.length < max && (
          <label className="flex h-20 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-slate-50 text-[10px] font-semibold text-muted-foreground hover:border-primary hover:text-primary">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {busy ? "Uploading" : "Add"}
            <input type="file" accept="image/*" multiple={max > 1} className="hidden" onChange={upload} disabled={busy} />
          </label>
        )}
      </div>
    </div>
  );
}