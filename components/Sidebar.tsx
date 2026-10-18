"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  LogOut,
  Printer,
  type LucideIcon,
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
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {},
  );

  const badgeValue = useCallback(
    (key?: NavChild["badgeKey"]) => (key === "lowStock" ? lowStockCount : 0),
    [lowStockCount],
  );

  const isActivePath = useCallback(
    (href: string) => pathname === href,
    [pathname],
  );

  const isItemActive = useCallback(
    (item: NavItem) => {
      if (item.href) return isActivePath(item.href);
      return (item.children ?? []).some((child) => isActivePath(child.href));
    },
    [isActivePath],
  );

  // Tutup drawer mobile & reset indikator pending setiap kali route berubah.
  useEffect(() => {
    setNavigatingTo(null);
    closeMobile();
  }, [pathname, closeMobile]);

  // Buka submenu yang memuat route aktif.
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

  // Hitung tinggi submenu untuk animasi buka/tutup.
  useEffect(() => {
    const heights: Record<string, number> = {};
    openMenus.forEach((key) => {
      const el = subMenuRefs.current[key];
      if (el) heights[key] = el.scrollHeight || 0;
    });
    setSubMenuHeight((prev) => ({ ...prev, ...heights }));
  }, [openMenus]);

  // Jumlah material stok rendah ( polled, sama seperti sebelumnya).
  useEffect(() => {
    let isMounted = true;
    async function checkLowStock() {
      try {
        const res = await fetch("/api/materials?lowStock=true");
        if (res.ok && isMounted) {
          const data = await res.json();
          setLowStockCount(data.materials?.length || 0);
        }
      } catch {
        // Abaikan — kegagalan fetch tidak boleh menggagalkan render sidebar.
      }
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
      prev.includes(label)
        ? prev.filter((key) => key !== label)
        : [...prev, label],
    );
  };

  const renderIcon = (
    Icon: LucideIcon,
    isActive: boolean,
    className?: string,
  ) => (
    <span
      className={cn(
        "flex h-5 w-5 shrink-0 items-center justify-center",
        isActive ? "menu-item-icon-active" : "menu-item-icon-inactive",
        className,
      )}
    >
      <Icon className="h-[18px] w-[18px]" aria-hidden />
    </span>
  );

  const renderChild = (child: NavChild) => {
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
            "group menu-dropdown-item",
            isActive
              ? "menu-dropdown-item-active"
              : "menu-dropdown-item-inactive",
          )}
        >
          <span className="flex h-4 w-4 shrink-0 items-center justify-center">
            <child.icon
              className={cn(
                "h-4 w-4",
                isActive ? "text-brand-600" : "text-ink-400",
              )}
              aria-hidden
            />
          </span>
          <span className="truncate">{child.label}</span>
          {isPending ? (
            <span className="ms-auto text-[10px] font-medium text-brand-500">
              Memuat…
            </span>
          ) : count > 0 ? (
            <span
              className={cn(
                "menu-dropdown-badge",
                isActive
                  ? "menu-dropdown-badge-active"
                  : "menu-dropdown-badge-inactive",
              )}
            >
              {count}
            </span>
          ) : null}
        </Link>
      </li>
    );
  };

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
              "group menu-item",
              isActive ? "menu-item-active" : "menu-item-inactive",
            )}
          >
            {renderIcon(item.icon, isActive)}
            <span className="truncate">{item.label}</span>
            {isPending ? (
              <span className="ms-auto h-2 w-2 animate-pulse rounded-full bg-brand-500" />
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
          aria-controls={`submenu-${item.label}`}
          className={cn(
            "group menu-item",
            isParentActive ? "menu-item-active" : "menu-item-inactive",
          )}
        >
          {renderIcon(item.icon, isParentActive)}
          <span className="truncate">{item.label}</span>
          <ChevronDown
            className={cn(
              "menu-item-chevron ms-auto hidden xl:block",
              isOpenMenu ? "menu-item-chevron-active" : "menu-item-chevron-inactive",
            )}
            aria-hidden
          />
        </button>

        <div
          id={`submenu-${item.label}`}
          ref={(el) => {
            subMenuRefs.current[item.label] = el;
          }}
          className="no-scrollbar overflow-hidden transition-[height] duration-300 ease-in-out"
          style={{ height: isOpenMenu ? `${height}px` : "0px" }}
        >
          <ul className="mt-1 space-y-1 ps-3 xl:ps-9">
            {(item.children ?? []).map(renderChild)}
          </ul>
        </div>
      </li>
    );
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 start-0 z-50 flex h-screen flex-col overflow-hidden border-e border-ink-200 bg-white transition-[width,transform] duration-300 ease-in-out dark:border-ink-800 dark:bg-ink-900",
        // Saat dipinjamkan di desktop, sidebar benar-benar hilang (bukan rail ikon).
        isOpen ? "w-sidebar" : "w-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
        "xl:translate-x-0",
        !isOpen && "xl:pointer-events-none border-e-0",
      )}
      aria-label="Navigasi admin"
      // `inert` membuat link di dalam sidebar yang tersembunyi tidak bisa di-tab.
      {...(!isOpen ? ({ inert: "" } as Record<string, string>) : {})}
    >
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center border-b border-ink-200 px-5 dark:border-ink-800">
        <Link
          href="/admin/dashboard"
          onClick={() => closeMobile()}
          className="flex items-center gap-3"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
            <Printer className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-theme-sm font-semibold tracking-tight text-ink-900 dark:text-white">
              Faeyza Printing
            </span>
            <span className="block truncate text-[10px] font-medium uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Sistem Manajemen
            </span>
          </span>
        </Link>
      </div>

      {/* Menu */}
      <nav className="no-scrollbar flex-1 overflow-y-auto overflow-x-hidden px-5 py-6">
        <div className="flex flex-col gap-8">
          {adminNav.map((group) => (
            <div key={group.title}>
              <h2 className="menu-group-label">{group.title}</h2>
              <ul className="flex flex-col gap-1">
                {group.items.map(renderItem)}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer: user aktif + keluar */}
      <div className="shrink-0 border-t border-ink-200 p-4 dark:border-ink-800">
        <div className="flex items-center justify-between rounded-xl border border-ink-200 bg-ink-50 p-3 dark:border-ink-800 dark:bg-white/5">
          <div className="min-w-0 text-start leading-tight">
            <span className="block truncate text-theme-xs font-semibold text-ink-900 dark:text-white">
              {session?.user?.name || "Admin"}
            </span>
            <span className="block truncate text-[10px] font-medium uppercase tracking-wider text-ink-400">
              {(session?.user as { role?: string })?.role || "Admin"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Keluar"
            className="ms-2 shrink-0 rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            <span className="sr-only">Keluar</span>
          </button>
        </div>
      </div>
    </aside>
  );
}