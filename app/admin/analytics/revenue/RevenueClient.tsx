"use client";

import { useState, useMemo } from "react";
import { formatRupiah } from "@/lib/utils";
import {
  TrendingUp,
  ShoppingBag,
  Calendar,
  BarChart2,
  DollarSign,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

interface Props {
  initialOrders: any[];
}

type Period = "today" | "week" | "month" | "year" | "all";

export default function RevenueClient({ initialOrders }: Props) {
  const [period, setPeriod] = useState<Period>("month");

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
      if (period === "year") {
        return orderDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [initialOrders, period]);

  const totalRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  }, [filteredOrders]);

  const totalOrders = filteredOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const chartData = useMemo(() => {
    const map: Record<string, number> = {};
    const now = new Date();

    if (period === "today") {
      for (let h = 0; h < 24; h++) {
        const label = `${h.toString().padStart(2, "0")}:00`;
        map[label] = 0;
      }
      filteredOrders.forEach((o) => {
        const d = new Date(o.createdAt);
        const label = `${d.getHours().toString().padStart(2, "0")}:00`;
        map[label] = (map[label] || 0) + (o.totalPrice || 0);
      });
    } else if (period === "week") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const label = d.toLocaleDateString("id-ID", { weekday: "short" });
        map[label] = 0;
      }
      filteredOrders.forEach((o) => {
        const d = new Date(o.createdAt);
        const label = d.toLocaleDateString("id-ID", { weekday: "short" });
        map[label] = (map[label] || 0) + (o.totalPrice || 0);
      });
    } else if (period === "month") {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const label = `${d}`;
        map[label] = 0;
      }
      filteredOrders.forEach((o) => {
        const d = new Date(o.createdAt);
        const label = `${d.getDate()}`;
        map[label] = (map[label] || 0) + (o.totalPrice || 0);
      });
    } else if (period === "year") {
      const months = [
        "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
        "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
      ];
      months.forEach((m) => (map[m] = 0));
      filteredOrders.forEach((o) => {
        const d = new Date(o.createdAt);
        const label = months[d.getMonth()];
        map[label] = (map[label] || 0) + (o.totalPrice || 0);
      });
    } else {
      filteredOrders.forEach((o) => {
        const d = new Date(o.createdAt);
        const label = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
        map[label] = (map[label] || 0) + (o.totalPrice || 0);
      });
    }

    return Object.keys(map).map((k) => ({ period: k, revenue: map[k] }));
  }, [filteredOrders, period]);

  const productRevenue = useMemo(() => {
    const map: Record<string, number> = {};
    filteredOrders.forEach((o) => {
      const name = o.product?.name || "Unknown";
      map[name] = (map[name] || 0) + (o.totalPrice || 0);
    });
    return Object.entries(map)
      .map(([product, revenue]) => ({ product, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [filteredOrders]);

  return (
    <div className="space-y-6">
      {/* Filter Periode */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs w-fit">
        <Calendar className="w-4 h-4 text-slate-400 ml-2" />
        {(
          [
            { id: "today", label: "Hari Ini" },
            { id: "week", label: "7 Hari" },
            { id: "month", label: "Bulan Ini" },
            { id: "year", label: "Tahun Ini" },
            { id: "all", label: "Semua" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setPeriod(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              period === tab.id
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3 Cards Metrik Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{formatRupiah(totalRevenue)}</p>
          <span className="text-[10px] text-slate-400">Pesanan selesai di periode ini</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Total Pesanan
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalOrders}</p>
          <span className="text-[10px] text-slate-400">Transaksi completed</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Rata-rata / Pesanan
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{formatRupiah(Math.round(avgOrderValue))}</p>
          <span className="text-[10px] text-slate-400">AOV (Average Order Value)</span>
        </div>
      </div>

      {/* Grafik Revenue */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-600" />
            <span>Tren Revenue {period === "today" ? "(Per Jam)" : period === "week" ? "(Per Hari)" : period === "month" ? "(Per Tanggal)" : period === "year" ? "(Per Bulan)" : ""}</span>
          </h3>
        </div>

        <div className="h-80 w-full pt-4">
          {chartData.length === 0 || chartData.every((d) => d.revenue === 0) ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Belum ada data revenue pada periode ini.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickFormatter={(val) => val >= 1000000 ? `Rp ${(val / 1000000).toFixed(1)}M` : val >= 1000 ? `Rp ${(val / 1000).toFixed(0)}k` : `Rp ${val}`}
                />
                <Tooltip
                  formatter={(val: any) => formatRupiah(Number(val))}
                  labelFormatter={(label: any) => label}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#059669"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Produk by Revenue */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Top 10 Produk Paling Menguntungkan</span>
          </h3>
        </div>

        <div className="p-5">
          {productRevenue.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Belum ada data produk pada periode ini.
            </div>
          ) : (
            <div className="space-y-3">
              {productRevenue.map((item, idx) => (
                <div
                  key={item.product}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="w-6 text-center font-bold text-slate-500 text-xs">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate text-sm">
                        {item.product}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {formatRupiah(item.revenue)}
                      </p>
                    </div>
                  </div>
                  <div className="w-40">
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(
                            (item.revenue / (productRevenue[0]?.revenue || 1)) * 100,
                            5
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}