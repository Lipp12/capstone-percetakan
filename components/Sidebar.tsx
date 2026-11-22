"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Receipt,
  FileCheck,
  Layers,
  BookOpen,
  Package,
  BarChart3,
  CreditCard,
  Bot,
  MessageSquare,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminNav, type NavChild, type NavItem } from "@/components/nav-config";
import { useSidebar } from "@/components/SidebarContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isMobileOpen, isOpen, closeMobile } = useSidebar();

  const [lowStockCount, setLowStockCount] = useState(0);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});

  const badgeValue = useCallback(
    (key?: NavChild["badgeKey"]) => (key === "lowStock" ? lowStockCount : 0),
    [lowStockCount],
  );

  const isActivePath = useCallback((href: string) => pathname === href, [pathname]);

  const isItemActive = useCallback(
    (item: NavItem) => {
      if (item.href) return isActivePath(item.href);
      return (item.children ?? []).some((child) => isActivePath(child.href));
    },
    [isActivePath],
  );

  useEffect(() => {
    setNavigatingTo(null);
    closeMobile();
  }, [pathname, closeMobile]);

  useEffect(() => {
    const activeParents = adminNav
      .flatMap((group) => group.items)
      .filter((item) => item.children?.some((child) => isActivePath(child.href)))
      .map((item) => item.label);
    setOpenMenus((prev) => {
      const merged = Array.from(new Set([...prev, ...activeParents]));
      return merged.length === prev.length ? prev : merged;
    });
  }, [pathname, isActivePath]);

  useEffect(() => {
    const heights: Record<string, number> = {};
    openMenus.forEach((key) => {
      const el = subMenuRefs.current[key];
      if (el) heights[key] = el.scrollHeight || 0;
    });
    setSubMenuHeight((prev) => ({ ...prev, ...heights }));
  }, [openMenus]);

  useEffect(() => {
    let isMounted = true;
    async function checkLowStock() {
      try {
        const res = await fetch("/api/materials?lowStock=true");
        if (res.ok && isMounted) {
          const data = await res.json();
          setLowStockCount(data.materials?.length || 0);
        }
      } catch {}
    }
    checkLowStock();
    const timer = setInterval(checkLowStock, 60000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  const handleNavigate = (href: string) => {
    closeMobile();
    if (pathname !== href) setNavigatingTo(href);
  };

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((key) => key !== label) : [...prev, label],
    );
  };

  const userName = session?.user?.name || "Admin Studio MK";
  const userRole = (session?.user as { role?: string })?.role || "Super Admin Print";
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const renderItem = (item: NavItem) => {
    const hasChildren = Boolean(item.children?.length);

    if (!hasChildren && item.href) {
      const isActive = isActivePath(item.href);
      const isPending = navigatingTo === item.href;
      return (
        <li key={item.href}>
          <Link
            href={item.href}
            onClick={() => handleNavigate(item.href as string)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center justify-between px-space-md py-2.5 rounded-lg transition-all",
              isActive
                ? "bg-primary text-on-primary font-semibold shadow-[0_2px_6px_rgba(99,58,37,0.08)]"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
            )}
          >
            <div className="flex items-center gap-space-sm">
              <item.icon className="text-[20px] shrink-0" aria-hidden />
              <span className="font-label-lg text-label-lg">{item.label}</span>
            </div>
            {isPending ? (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            ) : null}
          </Link>
        </li>
      );
    }

    const isOpenMenu = openMenus.includes(item.label);
    const isParentActive = isItemActive(item);
    const height = subMenuHeight[item.label] ?? 0;

    return (
      <li key={item.label}>
        <button
          type="button"
          onClick={() => toggleMenu(item.label)}
          aria-expanded={isOpenMenu}
          className={cn(
            "w-full flex items-center justify-between px-space-md py-2.5 rounded-lg transition-all",
            isParentActive
              ? "bg-primary text-on-primary font-semibold shadow-[0_2px_6px_rgba(99,58,37,0.08)]"
              : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
          )}
        >
          <div className="flex items-center gap-space-sm">
            <item.icon className="text-[20px] shrink-0" aria-hidden />
            <span className="font-label-lg text-label-lg">{item.label}</span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 transition-transform duration-200",
              isOpenMenu ? "rotate-180 text-on-primary" : "text-outline",
            )}
            aria-hidden
          />
        </button>
        <div
          ref={(el) => {
            subMenuRefs.current[item.label] = el;
          }}
          className="overflow-hidden transition-[height] duration-300 ease-in-out"
          style={{ height: isOpenMenu ? `${height}px` : "0px" }}
        >
          <ul className="mt-1 space-y-1 ps-3">
            {(item.children ?? []).map((child) => {
              const isActive = isActivePath(child.href);
              const isPending = navigatingTo === child.href;
              const count = badgeValue(child.badgeKey);
              return (
                <li key={child.href}>
                  <Link
                    href={child.href}
                    onClick={() => handleNavigate(child.href)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center justify-between px-space-md py-2 rounded-lg transition-all",
                      isActive
                        ? "bg-surface-container text-primary font-semibold"
                        : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                    )}
                  >
                    <div className="flex items-center gap-space-sm">
                      <child.icon className="text-[18px] shrink-0" aria-hidden />
                      <span className="font-label-md text-label-md">{child.label}</span>
                    </div>
                    {isPending ? (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    ) : count > 0 ? (
                      <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-error text-on-error">
                        {count}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </li>
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full w-72 bg-surface-container-low z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-transform duration-300 ease-in-out",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
        "xl:translate-x-0",
        !isOpen && "xl:-translate-x-full xl:pointer-events-none",
      )}
      aria-label="Navigasi admin"
      {...(!isOpen ? ({ inert: "" } as Record<string, string>) : {})}
    >
      <div className="flex flex-col">
        {/* Brand */}
        <div className="px-space-lg pt-space-lg pb-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary font-display-lg text-headline-sm font-bold shadow-[0_2px_6px_rgba(99,58,37,0.06)]">
              F
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold leading-none">
                Faeyza Printing
              </span>
              <span className="font-label-sm text-label-sm tracking-wider text-outline uppercase mt-1">
                Studio Percetakan Digital
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="custom-scrollbar max-h-[calc(100vh-12rem)] overflow-y-auto px-space-md py-space-xs">
          <nav className="flex flex-col gap-1" data-active-classes="bg-primary-container text-on-primary font-semibold shadow-[0_2px_6px_rgba(99,58,37,0.08)]">
            {adminNav.map((group) => (
              <div key={group.title}>
                <div className="px-space-md py-2">
                  <span className="font-label-sm text-label-sm tracking-wider text-outline uppercase">
                    {group.title}
                  </span>
                </div>
                <ul className="flex flex-col gap-1">
                  {group.items.map(renderItem)}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="p-space-md">
        <div className="p-space-sm rounded-xl bg-surface-container flex items-center justify-between shadow-[0_1px_2px_rgba(99,58,37,0.06)]">
          <div className="flex items-center gap-space-sm">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                {userName}
              </span>
              <span className="font-body-sm text-body-sm text-outline">
                {userRole}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Keluar"
            className="shrink-0 rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            <span className="sr-only">Keluar</span>
          </button>
        </div>
      </div>
    </aside>
  );
}