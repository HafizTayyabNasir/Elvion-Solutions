"use client";
import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";
import { Bell, Check, CheckCheck, Info, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";

interface Notification { id: number; title: string; message: string; type: string; isRead: boolean; link: string | null; createdAt: string; }

export default function CustomerNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    fetchAPI("/notifications").then(data => setNotifications(data.notifications || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    try {
      await fetchAPI("/notifications", { method: "PUT" });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) { console.error(err); }
  };

  const markRead = async (id: number) => {
    try {
      await fetchAPI(`/notifications/${id}`, { method: "PUT", body: JSON.stringify({ isRead: true }) });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) { console.error(err); }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      info: <Info size={18} className="text-blue-500" />,
      success: <CheckCircle size={18} className="text-green-500" />,
      warning: <AlertTriangle size={18} className="text-yellow-500" />,
      error: <AlertCircle size={18} className="text-red-500" />,
    };
    return icons[type] || icons.info;
  };

  const filtered = filter === "unread" ? notifications.filter(n => !n.isRead) : notifications;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-500 mt-1">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2 text-sm text-elvion-primary hover:bg-elvion-primary/5 rounded-lg transition-colors">
            <CheckCheck size={16} /> Mark all as read
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {(["all", "unread"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? "bg-elvion-primary text-black" : "bg-white dark:bg-elvion-card text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10"}`}>
            {f === "all" ? "All" : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10">
          <Bell size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(n => (
            <div key={n.id} onClick={() => !n.isRead && markRead(n.id)}
              className={`bg-white dark:bg-elvion-card rounded-xl border p-4 flex items-start gap-4 cursor-pointer transition-colors hover:shadow-md ${n.isRead ? "border-gray-200 dark:border-white/10 opacity-70" : "border-elvion-primary/30 dark:border-elvion-primary/20"}`}>
              <div className="mt-0.5">{getTypeIcon(n.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">{n.title}</h3>
                  {!n.isRead && <span className="w-2 h-2 bg-elvion-primary rounded-full"></span>}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.isRead && <button onClick={(e) => { e.stopPropagation(); markRead(n.id); }} className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded"><Check size={16} className="text-gray-400" /></button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
