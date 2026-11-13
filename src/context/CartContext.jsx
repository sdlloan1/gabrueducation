import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getProductOptions } from "@/lib/productOptions";

const STORAGE_KEY = "gabru_cart_v1";
const CartContext = createContext(null);

function itemKey(item) {
  return item.id || `${item.product_id}::${item.option_key || "full"}`;
}

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({ ...item, id: itemKey(item) }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => (typeof window === "undefined" ? [] : readStored()));

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable */
    }
  }, [items]);

  const addItem = useCallback((product, option) => {
    if (!product?.id) return;
    const chosen = option || getProductOptions(product)[0];
    if (!chosen) return;
    const id = `${product.id}::${chosen.key}`;
    setItems((prev) => {
      if (prev.some((i) => itemKey(i) === id)) return prev;
      return [
        ...prev,
        {
          id,
          product_id: product.id,
          option_key: chosen.key,
          option_label: chosen.label,
          balance_due: Number(chosen.balance) || 0,
          slug: product.slug,
          title: product.title,
          image: product.images?.[0] || "",
          type: product.type,
          original_price: chosen.balance > 0 ? Number(chosen.payNow) || 0 : Number(chosen.price) || 0,
          price: Number(chosen.payNow) || 0,
          qty: 1,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((itemId) => {
    setItems((prev) => prev.filter((i) => itemKey(i) !== itemId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const has = useCallback(
    (productId, optionKey) =>
      items.some((i) => i.product_id === productId && (!optionKey || i.option_key === optionKey)),
    [items]
  );

  const value = useMemo(() => {
    const total = items.reduce((sum, i) => sum + Number(i.price || 0) * Number(i.qty || 1), 0);
    const mrp = items.reduce((sum, i) => sum + Number(i.original_price || i.price || 0), 0);
    return { items, count: items.length, total, mrp, addItem, removeItem, clearCart, has };
  }, [items, addItem, removeItem, clearCart, has]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}