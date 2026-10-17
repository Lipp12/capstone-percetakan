import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bot,
  FileCheck,
  Kanban,
  Layers,
  LayoutDashboard,
  Package,
  Scissors,
  ShoppingBag,
  TriangleAlert,
  TrendingUp,
} from "lucide-react";

export type NavChild = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Tampilkan badge berisi jumlah (mis. material stok rendah). */
  badgeKey?: "lowStock";
};

export type NavItem = {
  /** Direct link = `href`. Punya submenu = `children`. */
  href?: string;
  label: string;
  icon: LucideIcon;
  children?: NavChild[];
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

/**
 * Struktur navigasi admin. Dua grup,WU dengan submenu agar tidak terlihat
 * datar — mengikuti pola TailAdmin.
 */
export const adminNav: NavGroup[] = [
  {
    title: "Utama",
    items: [
      {
        href: "/admin/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Pesanan & Produksi",
        icon: ShoppingBag,
        children: [
          {
            href: "/admin/orders",
            label: "Semua Pesanan",
            icon: ShoppingBag,
          },
          {
            href: "/admin/orders/design-check",
            label: "Validasi Desain",
            icon: FileCheck,
          },
          {
            href: "/admin/production",
            label: "Antrean Produksi",
            icon: Kanban,
          },
        ],
      },
      {
        label: "Analitik",
        icon: TrendingUp,
        children: [
          {
            href: "/admin/analytics/products",
            label: "Produk Terlaris",
            icon: BarChart3,
          },
          {
            href: "/admin/analytics/revenue",
            label: "Analisis Revenue",
            icon: TrendingUp,
          },
        ],
      },
      {
        href: "/admin/chat",
        label: "AI Copilot",
        icon: Bot,
      },
    ],
  },
  {
    title: "Inventaris & Master",
    items: [
      {
        label: "Kelola Master Data",
        icon: Layers,
        children: [
          {
            href: "/admin/products",
            label: "Kelola Produk",
            icon: Package,
          },
          {
            href: "/admin/materials",
            label: "Kelola Material",
            icon: Layers,
          },
          {
            href: "/admin/finishings",
            label: "Opsi Finishing",
            icon: Scissors,
          },
          {
            href: "/admin/materials/low-stock",
            label: "Stok Rendah",
            icon: TriangleAlert,
            badgeKey: "lowStock",
          },
        ],
      },
    ],
  },
];