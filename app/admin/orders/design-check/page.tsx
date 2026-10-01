import { prisma } from "@/lib/prisma";
import DesignCheckClient from "./DesignCheckClient";

export const dynamic = "force-dynamic";

export default async function AdminDesignCheckPage() {
  const checkingOrders = await prisma.order.findMany({
    where: {
      status: { in: ["DESIGN_CHECKING", "PAID"] },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      user: { select: { name: true, phone: true, email: true } },
      product: true,
      material: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          Quality Gate & Pra-Cetak
        </span>
        <h1 className="text-2xl font-black text-slate-900 mt-1">
          Validasi Desain Pelanggan
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Periksa resolusi, warna, dan proporsi file cetak sebelum masuk ke antrean mesin produksi.
        </p>
      </div>

      <DesignCheckClient initialOrders={checkingOrders} />
    </div>
  );
}
