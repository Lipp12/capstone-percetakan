"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, Check, Clock } from "lucide-react";
import OrderStatusBadge from "@/components/OrderStatusBadge";

interface NotificationItem {
  id: string;
  orderNumber: string;
  status: string;
  notes?: string;
  updatedAt: string;
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);

          // Hitung unread dari localStorage
          const lastReadTime = localStorage.getItem("lastNotificationRead") || "0";
          const unread = (data.notifications || []).filter(
            (n: NotificationItem) => new Date(n.updatedAt).getTime() > Number(lastReadTime)
          ).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        // Abaikan jika user belum login
      }
    }

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Polling tiap 30 detik
    return () => clearInterval(interval);
  }, []);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleOpen() {
    setIsOpen(!isOpen);
    if (!isOpen) {
      localStorage.setItem("lastNotificationRead", Date.now().toString());
      setUnreadCount(0);
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition"
        title="Notifikasi Status Pesanan"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-rose-600 rounded-full animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50">
          <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
            <h4 className="font-semibold text-sm text-slate-800">
              Notifikasi Pesanan
            </h4>
            <span className="text-xs text-slate-400">Pembaruan terkini</span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Belum ada pembaruan status pesanan.
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={`/orders/${n.id}/tracking`}
                  onClick={() => setIsOpen(false)}
                  className="block p-3.5 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-800">
                      {n.orderNumber}
                    </span>
                    <OrderStatusBadge status={n.status} size="sm" />
                  </div>
                  {n.notes && (
                    <p className="text-xs text-slate-500 line-clamp-1 mb-1">
                      {n.notes}
                    </p>
                  )}
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(n.updatedAt).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
