import { useState } from "react";
import { Copy, Facebook, Linkedin, MessageCircle, Send, Share2, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export default function ShareSheet({ url, title, className }) {
  const [open, setOpen] = useState(false);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const text = `${title} — Gabru Education`;

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: text, url: shareUrl });
        return;
      } catch {
        /* user cancelled */
      }
    }
    setOpen(true);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied", description: "Share it anywhere." });
      setOpen(false);
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const targets = [
    { label: "WhatsApp", Icon: MessageCircle, href: `https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`)}` },
    { label: "Telegram", Icon: Send, href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}` },
    { label: "Facebook", Icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { label: "LinkedIn", Icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={nativeShare}
        aria-label="Share this product"
        className={cn(
          "grid shrink-0 place-items-center rounded-xl border border-border bg-white text-slate-600 press3d",
          className || "h-11 w-11"
        )}
      >
        <Share2 className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close share menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-slate-900/30"
          />
          <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-border bg-white p-2 shadow-xl">
            <div className="mb-1 flex items-center justify-between px-1">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Share</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close">
                <X className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </div>
            {targets.map(({ label, Icon, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-muted"
              >
                <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                {label}
              </a>
            ))}
            <button
              type="button"
              onClick={copy}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-muted"
            >
              <Copy className="h-4 w-4 text-primary" aria-hidden="true" />
              Copy link
            </button>
          </div>
        </>
      )}
    </div>
  );
}