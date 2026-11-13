const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, BellRing, CheckCheck } from "lucide-react";

import { useAuth } from "@/lib/AuthContext";
import EmptyState from "@/components/EmptyState";
import Seo from "@/components/Seo";
import { cn } from "@/lib/utils";

const ICONS = {
  approved: { className: "bg-emerald-50 text-emerald-600" },
  rejected: { className: "bg-red-50 text-red-600" },
  order: { className: "bg-blue-50 text-primary" },
  general: { className: "bg-slate-100 text-slate-600" },
};

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    db.entities.Notification.filter({ user_id: user.id }, { sort: "-created_date", limit: 40 })
      .then((page) => setItems(page.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const open = async (notification) => {
    if (!notification.is_read) {
      db.entities.Notification.update(notification.id, { is_read: true }).catch(() => {});
      setItems((prev) => prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)));
    }
    if (notification.link) navigate(notification.link);
  };

  const markAll = async () => {
    const unread = items.filter((n) => !n.is_read);
    await Promise.all(
      unread.map((n) => db.entities.Notification.update(n.id, { is_read: true }).catch(() => {}))
    );
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <div className="animate-tilt-in">
      <Seo title="Notifications — Gabru Education" description="Order and payment updates." path="/notifications" />
      <header className="mb-3 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-foreground">Notifications</h1>
        {items.some((n) => !n.is_read) && (
          <button type="button" onClick={markAll} className="flex items-center gap-1 text-[11px] font-semibold text-primary">
            <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" /> Mark all read
          </button>
        )}
      </header>

      {loading && <div className="h-24 animate-pulse rounded-2xl border border-border bg-white" />}

      {!loading && items.length === 0 && (
        <EmptyState icon={Bell} title="You're all caught up" description="Order and payment updates will show up here." />
      )}

      <div className="space-y-2">
        {items.map((notification) => {
          const tone = ICONS[notification.type] || ICONS.general;
          return (
            <button
              key={notification.id}
              type="button"
              onClick={() => open(notification)}
              className={cn(
                "flex w-full items-start gap-2.5 rounded-2xl border p-3 text-left transition",
                notification.is_read ? "border-border bg-white" : "border-primary/30 bg-secondary/60"
              )}
            >
              <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", tone.className)}>
                {notification.is_read ? <Bell className="h-4 w-4" /> : <BellRing className="h-4 w-4" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-[12.5px] font-bold text-foreground">{notification.title}</span>
                  {!notification.is_read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                </span>
                <span className="mt-0.5 block text-[11.5px] leading-relaxed text-slate-600">{notification.body}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}