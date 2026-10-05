import { prisma } from "@/lib/prisma";
import KanbanBoard from "@/components/KanbanBoard";
import { evaluateProductionGate } from "@/lib/order-rules";

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
      statusHistory: { select: { status: true } },
    },
  });

  // Syarat masuk area antrean produksi (Kanban board):
  // 1. Desain sudah disetujui (ACC)
  // 2. Pembayaran sudah lunas
  // Catatan: status "PAID" tertimpa oleh "DESIGN_APPROVED" pada kolom status,
  // sehingga kelunasan diverifikasi lewat statusHistory.
  // Definisi & evaluasi aturan bisnis di satu sumber: lib/order-rules.ts
  const ordersForBoard = productionOrders.map((order) => {
    const gate = evaluateProductionGate(
      order.status,
      order.statusHistory.map((h) => h.status)
    );
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      quantity: order.quantity,
      width: order.width,
      height: order.height,
      totalPrice: order.totalPrice,
      product: order.product,
      material: order.material,
      user: order.user,
      isPaymentPaid: gate.isPaymentPaid,
      isDesignApproved: gate.isDesignApproved,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Antrean produksi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantau alur cetak, finishing, dan pesanan yang siap diambil.
          </p>
        </div>
      </div>

      <KanbanBoard initialOrders={ordersForBoard as any} />
    </div>
  );
}
