"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Clock3,
  CreditCard,
  ShoppingBag,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminStatCard from "@/components/AdminStatCard";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { formatRupiah } from "@/lib/utils";

interface Props {
  initialOrders: any[];
  initialTransactions: { date: Date; total: number }[];
  totalCustomers: number;
  lowStockMaterials: any[];
}

type Period = "today" | "week" | "month" | "all";

export default function DashboardClient({
  initialOrders,
  initialTransactions,
  totalCustomers,
  lowStockMaterials,
}: Props) {
  const [period, setPeriod] = useState<Period>("all");

  const filteredOrders = useMemo(() => {
    const now = new Date();
    return initialOrders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      if (period === "today") {
        return (
          orderDate.getDate() === now.getDate() &&
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      if (period === "week") {
        return orderDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
      if (period === "month") {
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });
  }, [initialOrders, period]);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return initialTransactions.filter((transaction) => {
      const invoiceDate = new Date(transaction.date);
      if (period === "today") {
        return (
          invoiceDate.getDate() === now.getDate() &&
          invoiceDate.getMonth() === now.getMonth() &&
          invoiceDate.getFullYear() === now.getFullYear()
        );
      }
      if (period === "week") {
        return invoiceDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
      if (period === "month") {
        return (
          invoiceDate.getMonth() === now.getMonth() &&
          invoiceDate.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });
  }, [initialTransactions, period]);

  const totalRevenue = useMemo(
    () =>
      filteredTransactions.reduce(
        (sum, transaction) => sum + transaction.total,
        0,
      ),
    [filteredTransactions],
  );

  const activeOrdersCount = useMemo(
    () =>
      initialOrders.filter(
        (order) => !["COMPLETED", "CANCELLED"].includes(order.status),
      ).length,
    [initialOrders],
  );

  const chartData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTransactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const label = date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
      map[label] = (map[label] || 0) + transaction.total;
    });
    return Object.entries(map).map(([date, revenue]) => ({ date, revenue }));
  }, [filteredTransactions]);

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-6">
      <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-6 shadow-sm lg:p-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-gradient-to-br from-primary/5 via-cmyk-cyan/10 to-transparent" />
        <div className="pointer-events-none absolute bottom-2 right-8 select-none text-5xl font-bold tracking-tighter text-outline-variant/20">
          CMYK 300DPI
        </div>

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded bg-primary-fixed px-2 py-0.5 font-label-sm text-label-sm font-bold uppercase text-primary">
                Studio Central
              </span>
              <span className="font-body-sm text-body-sm text-outline">
                Gedung Workshop Lantai 1
              </span>
              <span className="flex items-center gap-1 font-label-sm text-label-sm font-semibold text-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-cmyk-cyan" />
                Live Production
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg-mobile tracking-tight text-primary md:text-headline-lg">
              Selamat Datang di Studio Faeyza Digital
            </h1>
            <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
              Ringkasan alur prepress, ketersediaan media cetak, dan antrean produksi periode berjalan.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 rounded-lg bg-surface-container-lowest p-3 shadow-sm">
            <div className="flex items-center gap-2 rounded-md bg-surface-container-low px-3 py-1.5">
              <span className="relative h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cmyk-cyan opacity-75" />
                <span className="relative block h-2.5 w-2.5 rounded-full bg-cmyk-cyan" />
              </span>
              <div>
                <p className="font-label-sm text-label-sm font-bold text-on-surface">
                  Roland Versa UV
                </p>
                <p className="font-body-sm text-body-sm text-secondary">Running</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-surface-container-low px-3 py-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-secondary" />
              <div>
                <p className="font-label-sm text-label-sm font-bold text-on-surface">
                  Mimaki JV300
                </p>
                <p className="font-body-sm text-body-sm text-outline">Standby</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {lowStockMaterials.length > 0 ? (
        <div className="flex flex-col gap-4 rounded-xl bg-error-container/40 p-4 shadow-sm md:flex-row md:items-center md:justify-between lg:px-6">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-error text-on-error shadow-sm">
              <AlertTriangle className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <span className="rounded bg-error px-2 py-0.5 font-label-sm text-label-sm font-bold uppercase text-on-error">
                Perhatian Kritis
              </span>
              <p className="mt-1 font-label-lg text-label-lg font-bold text-on-error-container">
                {lowStockMaterials.length} bahan berada di bawah batas aman
              </p>
              <p className="font-body-sm text-body-sm text-on-error-container/90">
                {lowStockMaterials
                  .map((material) => material.name)
                  .join(", ")}
              </p>
            </div>
          </div>
          <div className="flex gap-2 self-end md:self-center">
            <Link
              href="/admin/materials"
              className="rounded-lg bg-surface-container-lowest px-3.5 py-2 font-label-md text-label-md text-on-surface shadow-sm"
            >
              Lihat Semua Stok
            </Link>
            <Link
              href="/admin/materials/low-stock"
              className="rounded-lg bg-error px-4 py-2 font-label-md text-label-md font-bold text-on-error shadow-sm"
            >
              Restock Sekarang
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Pendapatan dari Invoice"
          value={formatRupiah(totalRevenue)}
          caption={`${filteredTransactions.length} invoice terbayar`}
          icon={CreditCard}
          tone="yellow"
        />
        <AdminStatCard
          label="Total pesanan"
          value={filteredOrders.length}
          caption="Pesanan masuk pada periode aktif"
          icon={ShoppingBag}
          tone="mint"
        />
        <AdminStatCard
          label="Pesanan aktif"
          value={activeOrdersCount}
          caption="Sedang diproses atau menunggu"
          icon={Clock3}
          tone="rose"
        />
        <AdminStatCard
          label="Pelanggan"
          value={totalCustomers}
          caption="Customer terdaftar"
          icon={Users}
          tone="lavender"
        />
      </div>

      <section className="flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-headline-sm text-headline-sm font-bold text-primary">
              Tren Performa Finansial Harian
            </h2>
            <p className="font-body-sm text-body-sm text-outline">
              Nilai invoice terbayar pada periode yang dipilih
            </p>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto rounded-lg bg-surface-container-low p-1.5">
            <Calendar className="ml-1 h-4 w-4 shrink-0 text-outline" />
            {(
              [
                { id: "all", label: "Semua" },
                { id: "today", label: "Hari Ini" },
                { id: "week", label: "7 Hari" },
                { id: "month", label: "Bulan Ini" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPeriod(tab.id)}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 font-label-md text-label-md transition ${
                  period === tab.id
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-lg bg-surface-container-low text-body-sm text-outline">
              Belum ada data penjualan pada periode ini.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="dashboardRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00b4d8" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#00b4d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e2dd"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#51443e" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#51443e" }}
                  tickFormatter={(value) =>
                    `Rp ${Number(value).toLocaleString("id-ID")}`
                  }
                />
                <Tooltip
                  formatter={(value: any) => formatRupiah(Number(value))}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e5e2dd",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#00677d"
                  strokeWidth={3}
                  fill="url(#dashboardRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
        <div className="flex items-center justify-between border-b border-surface-container px-5 py-4">
          <div>
            <h2 className="font-headline-sm text-headline-sm font-bold text-primary">
              Pesanan Terkini
            </h2>
            <p className="font-body-sm text-body-sm text-outline">
              Lima transaksi pesanan terakhir
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 font-label-md text-label-md font-bold text-primary"
          >
            Semua Pesanan
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-sm text-body-sm text-on-surface-variant">
            <thead className="border-b border-surface-container bg-surface-container-low font-label-sm text-label-sm uppercase text-outline">
              <tr>
                <th className="px-5 py-3">No. Pesanan</th>
                <th className="px-5 py-3">Pelanggan</th>
                <th className="px-5 py-3">Produk</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {initialOrders.slice(0, 5).map((order) => (
                <tr
                  key={order.id}
                  className="transition-colors hover:bg-surface-container-low/70"
                >
                  <td className="px-5 py-3 font-semibold text-on-surface">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="hover:text-primary"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-on-surface">{order.user.name}</td>
                  <td className="px-5 py-3">
                    {order.product.name} ({order.quantity} {order.product.unit})
                  </td>
                  <td className="px-5 py-3">
                    <OrderStatusBadge status={order.status} size="sm" />
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-on-surface">
                    {formatRupiah(order.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
