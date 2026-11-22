import { prisma } from "@/lib/prisma";
import RevenueClient from "./RevenueClient";
import AdminPageHeader from "@/components/AdminPageHeader";

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
    <div className="mx-auto w-full max-w-[1280px] space-y-6">
      <AdminPageHeader
        eyebrow="Analisis Revenue"
        title="Laporan Pendapatan"
        description="Pantau performa penjualan, tren revenue, dan produk paling menguntungkan."
      />

      <RevenueClient initialOrders={completedOrders as any} />
    </div>
  );
}