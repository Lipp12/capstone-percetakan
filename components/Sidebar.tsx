"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  FileCheck,
  Kanban,
  Package,
  Layers,
  AlertTriangle,
  Scissors,
  TrendingUp,
  BarChart3,
  Bot,
  LogOut,
  ArrowLeft,
  Printer,
  Loader2,
  Menu,
  X,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [lowStockCount, setLowStockCount] = useState(0);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Reset status navigasi ketika halaman tujuan selesai dimuat
  useEffect(() => {
    setNavigatingTo(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    let isMounted = true;
    async function checkLowStock() {
      try {
        const res = await fetch("/api/materials?lowStock=true");
        if (res.ok && isMounted) {
          const data = await res.json();
          setLowStockCount(data.materials?.length || 0);
        }
      } catch (e) {
        // Abaikan
      }
    }
    checkLowStock();
    // Cek berkala setiap 60 detik (bukan setiap kali klik menu)
    const timer = setInterval(checkLowStock, 60000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  const navGroups = [
    {
      title: "Utama",
      items: [
        { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/production", label: "Antrean Produksi", icon: Kanban },
        { href: "/admin/analytics/products", label: "Produk Terlaris", icon: BarChart3 },
        { href: "/admin/analytics/revenue", label: "Analisis Revenue", icon: TrendingUp },
        { href: "/admin/chat", label: "AI Copilot", icon: Bot },
      ],
    },
    {
      title: "Pesanan & Desain",
      items: [
        { href: "/admin/orders", label: "Semua Pesanan", icon: ShoppingBag },
        { href: "/admin/orders/design-check", label: "Validasi Desain", icon: FileCheck },
      ],
    },
    {
      title: "Inventaris & Master",
      items: [
        { href: "/admin/products", label: "Kelola Produk", icon: Package },
        { href: "/admin/materials", label: "Kelola Material", icon: Layers },
        {
          href: "/admin/materials/low-stock",
          label: "Stok Rendah",
          icon: AlertTriangle,
          badge: lowStockCount > 0 ? lowStockCount : undefined,
        },
        { href: "/admin/finishings", label: "Opsi Finishing", icon: Scissors },
      ],
    },
  ];

  return (
    <aside className="relative z-30 flex w-full shrink-0 flex-col border-b border-stone-200 bg-slate-900 text-slate-300 md:min-h-screen md:w-64 md:border-b-0 md:border-r md:border-slate-800">
      {/* Top Navigation Progress Bar */}
      {navigatingTo && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-800 overflow-hidden pointer-events-none">
          <div className="h-full w-full animate-pulse bg-rose-600" />
        </div>
      )}

      {/* Brand Header */}
      <div className="p-3 sm:p-4 border-b border-slate-800 flex items-center justify-between">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md border border-rose-200 bg-rose-50 text-rose-700 flex items-center justify-center">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base text-white tracking-tight leading-none block">
              Faeyza Printing
            </span>
            <span className="text-[10px] text-rose-300 font-medium tracking-wider uppercase">
              Sistem Manajemen
            </span>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? "Tutup navigasi" : "Buka navigasi"}
          aria-expanded={mobileMenuOpen}
          className="p-2 text-slate-300 hover:text-white md:hidden"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className={`${mobileMenuOpen ? "flex" : "hidden"} flex-1 flex-col gap-6 overflow-y-auto p-3 md:flex`}>
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isCurrentActive = pathname === item.href;
                const isPending = navigatingTo === item.href;
                const isActive = isCurrentActive || isPending;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (pathname !== item.href) {
                        setNavigatingTo(item.href);
                      }
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition duration-150 ${
                      isActive
                        ? "bg-rose-700 text-white shadow-sm font-semibold"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isPending ? (
                        <Loader2 className="w-4 h-4 shrink-0 animate-spin text-white" />
                      ) : (
                        <Icon className="w-4 h-4 shrink-0" />
                      )}
                      <span>{item.label}</span>
                    </div>
                    {isPending ? (
                      <span className="text-[10px] text-rose-200 animate-pulse font-normal">
                        Memuat...
                      </span>
                    ) : item.badge !== undefined ? (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info & Logout */}
      <div className={`${mobileMenuOpen ? "block" : "hidden"} space-y-2 border-t border-slate-800 p-3 md:block`}>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ke Portal Pelanggan</span>
        </Link>

        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center justify-between">
          <div className="text-left text-xs leading-tight">
            <span className="font-semibold text-white block">
              {session?.user?.name || "Admin"}
            </span>
            <span className="text-[10px] text-slate-400">
              {(session?.user as any)?.role || "ADMIN"}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Keluar"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
