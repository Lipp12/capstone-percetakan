import { prisma } from "@/lib/prisma";
import RevenueClient from "./RevenueClient";

export const dynamic = "force-dynamic";

export default async function AdminRevenuePage() {
  // Ambil data pesanan yang sudah selesai untuk perhitungan revenue
  const completedOrders = await prisma.order.findMany({
    where: {
      status: "COMPLETED",
    },
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true, unit: true, basePrice: true } },
      user: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Analisis Revenue
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Laporan Pendapatan Percetakan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau performa penjualan, tren revenue, dan produk paling menguntungkan.
          </p>
        </div>
      </div>

      <RevenueClient initialOrders={completedOrders as any} />
    </div>
  );
}