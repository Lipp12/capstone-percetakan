import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import OrderDetailClient from "./OrderDetailClient";
import AdminPageHeader from "@/components/AdminPageHeader";

export const dynamic = "force-dynamic";

interface Props {
  params: {
    id: string;
  };
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      product: true,
      material: true,
      finishings: { include: { finishing: true } },
      statusHistory: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-6">
      <AdminPageHeader
        eyebrow="Detail Pesanan"
        title={order.orderNumber}
        description={`Dibuat pada ${new Date(order.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}`}
      />
      <OrderDetailClient order={order} />
    </div>
  );
}
