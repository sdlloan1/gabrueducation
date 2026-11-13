const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";

import { toast } from "@/components/ui/use-toast";

export function useProductPurchase({ product, user, isAuthenticated }) {
  const [ownedOptions, setOwnedOptions] = useState([]);
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.id || !product?.id) return undefined;
    let alive = true;
    Promise.all([
      db.entities.Purchase.filter({ user_id: user.id, product_id: product.id }),
      db.entities.SavedItem.filter({ user_id: user.id, product_id: product.id }),
    ])
      .then(([purchases, saves]) => {
        if (!alive) return;
        const rows = Array.isArray(purchases) ? purchases : [];
        setOwnedOptions(rows.map((purchase) => purchase.option || "full"));
        const record = Array.isArray(saves) ? saves[0] : null;
        setSaved(Boolean(record));
        setSavedId(record?.id || null);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [product?.id, user?.id, isAuthenticated]);

  const toggleSave = async () => {
    if (!isAuthenticated) {
      toast({ title: "Sign in to save", description: "Saved products sync to your account." });
      return;
    }
    try {
      if (saved && savedId) {
        await db.entities.SavedItem.delete(savedId);
        setSaved(false);
        setSavedId(null);
        toast({ title: "Removed from saved" });
      } else {
        const created = await db.entities.SavedItem.create({
          user_id: user.id,
          product_id: product.id,
        });
        setSaved(true);
        setSavedId(created?.id || null);
        toast({ title: "Saved for later" });
      }
    } catch (error) {
      toast({ title: "Could not update", description: error.message, variant: "destructive" });
    }
  };

  return { purchased: ownedOptions.length > 0, ownedOptions, saved, toggleSave };
}