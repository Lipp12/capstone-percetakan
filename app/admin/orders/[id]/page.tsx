import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import OrderDetailClient from "./OrderDetailClient";

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
    <div className="max-w-5xl mx-auto space-y-6">
      <OrderDetailClient order={order} />
    </div>
  );
}
