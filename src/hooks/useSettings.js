const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";

export const DEFAULT_SETTINGS = {
  key: "main",
  brand_name: "Gabru Education",
  tagline: "Templates, prompts, courses & tools",
  upi_id: "",
  upi_name: "Gabru Education",
  support_whatsapp: "",
  support_email: "",
  refund_enabled: false,
  refund_days: 0,
  pending_hours: 24,
  refund_policy:
    "All products on Gabru Education are digital goods that are delivered instantly after your payment is approved. By default every product is non-refundable. If a refund window is enabled for a product, it is shown before you place the order.",
};

export function useSettings() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let alive = true;
    db.entities.SiteSettings.filter({ key: "main" })
      .then((rows) => {
        if (!alive) return;
        const record = Array.isArray(rows) ? rows[0] : null;
        setSettings({ ...DEFAULT_SETTINGS, ...(record || {}) });
      })
      .catch(() => {
        if (alive) setSettings(DEFAULT_SETTINGS);
      });
    return () => {
      alive = false;
    };
  }, []);

  return settings || DEFAULT_SETTINGS;
}

export function whatsappLink(number, text) {
  const digits = String(number || "").replace(/\D/g, "");
  if (!digits) return "";
  const withCountry = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${withCountry}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}