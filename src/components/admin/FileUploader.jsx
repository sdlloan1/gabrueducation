const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { FileUp, Loader2, X } from "lucide-react";

import { toast } from "@/components/ui/use-toast";

/**
 * Private delivery file — buyers get a short-lived signed link after purchase.
 */
export default function FileUploader({ value, fileName, onChange, label = "Delivery file (zip / pdf)" }) {
  const [busy, setBusy] = useState(false);

  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const { file_uri } = await db.integrations.Core.UploadPrivateFile({ file });
      onChange({ file_uri, file_name: file.name });
    } catch (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {value ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2">
          <FileUp className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate text-[11.5px] font-semibold text-emerald-800">
            {fileName || "File attached"}
          </span>
          <button
            type="button"
            onClick={() => onChange({ file_uri: "", file_name: "" })}
            aria-label="Remove file"
            className="grid h-6 w-6 place-items-center rounded-lg bg-white text-slate-500"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-slate-50 p-2.5 text-[11px] font-semibold text-muted-foreground hover:border-primary hover:text-primary">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
          {busy ? "Uploading…" : "Upload file (stored privately)"}
          <input type="file" className="hidden" onChange={upload} disabled={busy} />
        </label>
      )}
    </div>
  );
}