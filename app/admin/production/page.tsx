import { prisma } from "@/lib/prisma";
import KanbanBoard from "@/components/KanbanBoard";

export const dynamic = "force-dynamic";

export default async function AdminProductionPage() {
  const productionOrders = await prisma.order.findMany({
    where: {
      status: {
        in: ["DESIGN_APPROVED", "IN_PRODUCTION", "FINISHING", "READY", "COMPLETED"],
      },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      product: { select: { name: true, unit: true } },
      material: { select: { name: true } },
      user: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Lantai Produksi & Workshop
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Kanban Antrean Mesin Cetak
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Geser kartu atau klik tombol panah untuk memindahkan status pengerjaan pesanan. Stok material otomatis terpotong saat pesanan masuk tahap 'Printing'.
          </p>
        </div>
      </div>

      <KanbanBoard initialOrders={productionOrders as any} />
    </div>
  );
}
