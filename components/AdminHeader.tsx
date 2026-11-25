"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/SidebarContext";

type NotificationItem = {
  id: string;
  orderNumber: string;
  status: string;
  updatedAt: string;
};

/** Topbar admin: toggle sidebar, notifikasi pesanan, dan menu user. */
export default function AdminHeader() {
  const { data: session } = useSession();
  const { isMobileOpen, toggleMobile } = useSidebar();

  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadNotifications() {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok || !isMounted) return;
        const data = await res.json();
        const items: NotificationItem[] = data.notifications || [];
        setNotifications(items);
        const lastRead = Number(
          localStorage.getItem("lastNotificationRead") || "0",
        );
        setUnreadCount(
          items.filter((n) => new Date(n.updatedAt).getTime() > lastRead).length,
        );
      } catch {
        // Abaikan — notifikasi tidak boleh mengganggu header.
      }
    }
    loadNotifications();
    const timer = setInterval(loadNotifications, 30000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  // Tutup dropdown saat klik di luar.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) {
        setIsNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(target)) {
        setIsUserOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleNotifications() {
    const next = !isNotifOpen;
    setIsNotifOpen(next);
    if (next) {
      localStorage.setItem("lastNotificationRead", Date.now().toString());
      setUnreadCount(0);
    }
  }

  const userName = session?.user?.name || "Admin";
  const userRole = (session?.user as { role?: string })?.role || "Admin";
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="z-30 shrink-0 border-b border-outline-variant/60 bg-surface/90 backdrop-blur-xl">
      <div className="flex h-1 w-full">
        <div className="h-full w-1/3 bg-cmyk-cyan" />
        <div className="h-full w-1/3 bg-cmyk-magenta" />
        <div className="h-full w-1/3 bg-cmyk-yellow" />
      </div>
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={toggleMobile}
          aria-label={isMobileOpen ? "Tutup navigasi" : "Buka navigasi"}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface xl:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>

        <div className="relative hidden max-w-md flex-1 sm:block">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Cari pesanan, proofing file, bahan..."
            className="h-10 w-full rounded-lg border-0 bg-surface-container-lowest pl-10 pr-4 font-body-sm text-body-sm text-on-surface shadow-[0_1px_2px_rgba(99,58,37,0.04)] outline-none focus:ring-1 focus:ring-primary-container"
          />
        </div>

        <div className="hidden flex-1 items-center justify-end xl:flex">
          <span className="mr-2 inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1 font-label-sm text-label-sm text-on-surface">
            <span className="h-2 w-2 rounded-full bg-cmyk-cyan" />
            FOGRA39 Calibrated
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1 font-label-sm text-label-sm text-on-surface">
            <span className="material-symbols-outlined text-[14px] text-cmyk-cyan">
              sync
            </span>
            Sync Otomatis
          </span>
        </div>

        {/* Notifikasi pesanan */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={toggleNotifications}
            aria-expanded={isNotifOpen}
            aria-label="Notifikasi status pesanan"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-outline transition-colors hover:bg-surface-container hover:text-on-surface dark:text-outline dark:hover:bg-white/10 dark:hover:text-white"
          >
            <Bell className="h-5 w-5" aria-hidden />
            {unreadCount > 0 ? (
              <span className="absolute end-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-container px-1 text-[10px] font-bold tabular-nums text-white">
                {unreadCount}
              </span>
            ) : null}
          </button>

          {isNotifOpen ? (
            <div className="absolute end-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-outline-variant bg-white shadow-theme-lg dark:border-ink-700 dark:bg-ink-900 sm:w-96">
              <div className="flex items-center justify-between border-b border-surface-container px-4 py-3 dark:border-ink-800">
                <p className="text-theme-sm font-semibold text-on-surface dark:text-white">
                  Notifikasi Pesanan
                </p>
                <span className="text-[11px] text-outline">30 detik lalu</span>
              </div>
              <div className="custom-scrollbar max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-theme-xs text-outline">
                    Belum ada pembaruan status pesanan.
                  </p>
                ) : (
                  notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={`/admin/orders/${n.id}`}
                      onClick={() => setIsNotifOpen(false)}
                      className="flex items-center justify-between gap-3 border-b border-surface-container px-4 py-3 transition-colors last:border-b-0 hover:bg-surface-container-low dark:border-ink-800 dark:hover:bg-white/5"
                    >
                      <span className="truncate text-theme-sm font-medium text-on-surface dark:text-ink-100">
                        {n.orderNumber}
                      </span>
                      <span className="shrink-0 text-[11px] capitalize text-outline">
                        {n.status.replace(/_/g, " ").toLowerCase()}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Menu user */}
        <div className="relative" ref={userRef}>
          <button
            type="button"
            onClick={() => setIsUserOpen((prev) => !prev)}
            aria-expanded={isUserOpen}
            className="flex items-center gap-2 rounded-xl py-1 pe-2 ps-1 transition-colors hover:bg-surface-container dark:hover:bg-white/10"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container text-theme-xs font-bold text-primary dark:bg-primary-container/15 dark:text-brand-400">
              {initials || <UserRound className="h-4 w-4" aria-hidden />}
            </span>
            <span className="hidden min-w-0 text-start sm:block">
              <span className="block truncate text-theme-xs font-semibold text-on-surface dark:text-white">
                {userName}
              </span>
              <span className="block truncate text-[10px] uppercase tracking-wider text-outline">
                {userRole}
              </span>
            </span>
            <ChevronDown
              className={cn(
                "hidden h-4 w-4 text-outline transition-transform duration-200 sm:block",
                isUserOpen && "rotate-180",
              )}
              aria-hidden
            />
          </button>

          {isUserOpen ? (
            <div className="absolute end-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-outline-variant bg-white py-1 shadow-theme-lg dark:border-ink-700 dark:bg-ink-900">
              <div className="border-b border-surface-container px-4 py-3 dark:border-ink-800">
                <p className="truncate text-theme-sm font-semibold text-on-surface dark:text-white">
                  {userName}
                </p>
                <p className="truncate text-[11px] text-outline">{userRole}</p>
              </div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-start text-theme-sm text-primary transition-colors hover:bg-surface-container dark:text-brand-400 dark:hover:bg-primary-container/10"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Keluar
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}