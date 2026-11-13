import { useState } from "react";
import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";

// Shows a photo at its own aspect ratio — any shape the admin uploads stays uncropped.
export default function RatioImage({ src, alt = "", className, ...props }) {
  const [ratio, setRatio] = useState(null);

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      fittingType="fit"
      originWidth={ratio?.width}
      originHeight={ratio?.height}
      onLoad={(event) => {
        const el = event?.currentTarget;
        if (el?.naturalWidth && el?.naturalHeight && !ratio) {
          setRatio({ width: el.naturalWidth, height: el.naturalHeight });
        }
      }}
      className={cn("w-full bg-slate-50", !ratio && "h-56", className)}
    />
  );
}