import { prisma } from "@/lib/prisma";
import FinishingsClient from "./FinishingsClient";
import AdminPageHeader from "@/components/AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function AdminFinishingsPage() {
  const finishings = await prisma.finishing.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true } },
    },
  });

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-6">
      <AdminPageHeader
        eyebrow="Layanan Tambahan"
        title="Opsi Finishing"
        description="Kelola layanan pasca-cetak seperti laminasi, potong, lipat, mata ayam, dan penjilidan."
      />
      <FinishingsClient initialFinishings={finishings} />
    </div>
  );
}
