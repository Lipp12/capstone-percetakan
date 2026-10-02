"use client";

import { useState, useMemo } from "react";
import { formatRupiah, formatDate } from "@/lib/utils";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  Users,
  AlertTriangle,
  ArrowRight,
  Printer,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  initialOrders: any[];
  totalCustomers: number;
  lowStockMaterials: any[];
}

type Period = "today" | "week" | "month" | "all";

export default function DashboardClient({
  initialOrders,
  totalCustomers,
  lowStockMaterials,
}: Props) {
  const [period, setPeriod] = useState<Period>("all");

  // Filter pesanan berdasarkan periode
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return initialOrders.filter((o) => {
      const orderDate = new Date(o.createdAt);
      if (period === "today") {
        return (
          orderDate.getDate() === now.getDate() &&
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      if (period === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDate >= weekAgo;
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

  // Statistik metrik
  const totalRevenue = useMemo(() => {
    return filteredOrders
      .filter((o) => o.status !== "CANCELLED" && o.status !== "PENDING_PAYMENT")
      .reduce((sum, o) => sum + o.totalPrice, 0);
  }, [filteredOrders]);

  const activeOrdersCount = useMemo(() => {
    return initialOrders.filter(
      (o) => !["COMPLETED", "CANCELLED"].includes(o.status)
    ).length;
  }, [initialOrders]);

  // Data grafik penjualan harian
  const chartData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredOrders.forEach((o) => {
      const d = new Date(o.createdAt);
      const label = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
      map[label] = (map[label] || 0) + o.totalPrice;
    });

    return Object.keys(map).map((k) => ({
      date: k,
      revenue: map[k],
    }));
  }, [filteredOrders]);

  return (
    <div className="space-y-6">
      {/* Header Dashboard & Switch Copilot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Ringkasan Bisnis
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Dashboard Penjualan & Operasional
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau arus transaksi, progres produksi, dan kesehatan stok inventaris percetakan.
          </p>
        </div>
      </div>

      {/* Alert Jika Ada Stok Rendah */}
      {lowStockMaterials.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-600 text-white rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-900">
                Peringatan Stok Menipis!
              </p>
              <p className="text-[11px] text-rose-700">
                Ada {lowStockMaterials.length} bahan baku di bawah batas aman:{" "}
                {lowStockMaterials.map((m) => m.name).join(", ")}.
              </p>
            </div>
          </div>
          <Link
            href="/admin/materials/low-stock"
            className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 shrink-0"
          >
            Cek Stok
          </Link>
        </div>
      )}

      {/* Filter Periode */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs w-fit">
        <Calendar className="w-4 h-4 text-slate-400 ml-2" />
        {(
          [
            { id: "all", label: "Semua Waktu" },
            { id: "today", label: "Hari Ini" },
            { id: "week", label: "7 Hari Terakhir" },
            { id: "month", label: "Bulan Ini" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setPeriod(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              period === tab.id
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4 Cards Metrik Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {formatRupiah(totalRevenue)}
          </p>
          <span className="text-[10px] text-slate-400">Pembayaran terkonfirmasi</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Total Pesanan
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {filteredOrders.length}
          </p>
          <span className="text-[10px] text-slate-400">Pesanan masuk di periode ini</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Pesanan Aktif
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600">{activeOrdersCount}</p>
          <span className="text-[10px] text-slate-400">Sedang diproses / diproduksi</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Pelanggan
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalCustomers}</p>
          <span className="text-[10px] text-slate-400">Total customer terdaftar</span>
        </div>
      </div>

      {/* Grafik Penjualan Harian (Lebar Penuh) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>Grafik Penjualan Harian</span>
          </h3>
          <span className="text-xs text-slate-400">Tren Performa</span>
        </div>

        <div className="h-72 w-full pt-4">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Belum ada data penjualan pada periode ini.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickFormatter={(val) => `Rp ${(val / 1000).toLocaleString()}k`}
                />
                <Tooltip
                  formatter={(val: any) => formatRupiah(Number(val))}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Tabel Pesanan Masuk Terkini */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Pesanan Terkini
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              5 transaksi pesanan terakhir yang masuk
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>Kelola Semua Pesanan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">No. Pesanan</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Produk</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initialOrders.slice(0, 5).map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="hover:text-blue-600 transition"
                    >
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {o.user.name}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {o.product.name} ({o.quantity} {o.product.unit})
                  </td>
                  <td className="py-3 px-4">
                    <OrderStatusBadge status={o.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    {formatRupiah(o.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


    </div>
  );
}
