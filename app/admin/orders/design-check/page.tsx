import { prisma } from "@/lib/prisma";
import DesignCheckClient from "./DesignCheckClient";
import AdminPageHeader from "@/components/AdminPageHeader";
import { isOrderPaymentPaid } from "@/lib/order-rules";

export const dynamic = "force-dynamic";

export default async function AdminDesignCheckPage() {
  const candidateOrders = await prisma.order.findMany({
    where: {
      status: { in: ["DESIGN_CHECKING", "PAID"] },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      user: { select: { name: true, phone: true, email: true } },
      product: true,
      material: true,
      statusHistory: { select: { status: true } },
    },
  });
  const checkingOrders = candidateOrders.filter((order) =>
    isOrderPaymentPaid(
      order.status,
      order.statusHistory.map((history) => history.status)
    )
  );

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-6">
      <AdminPageHeader
        eyebrow="Quality Gate & Pra-Cetak"
        title="Validasi Desain"
        description="Periksa resolusi, warna, dan proporsi file cetak sebelum masuk ke antrean mesin produksi."
      />

      <DesignCheckClient initialOrders={checkingOrders} />
    </div>
  );
}
