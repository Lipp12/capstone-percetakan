import { prisma } from "@/lib/prisma";
import DesignCheckClient from "./DesignCheckClient";
import AdminPageHeader from "@/components/AdminPageHeader";

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
