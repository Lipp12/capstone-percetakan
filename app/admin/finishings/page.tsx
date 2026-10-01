import { prisma } from "@/lib/prisma";
import FinishingsClient from "./FinishingsClient";

export const dynamic = "force-dynamic";

export default async function AdminFinishingsPage() {
  const finishings = await prisma.finishing.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true } },
    },
  });

  return (
    <div className="space-y-6">
      <FinishingsClient initialFinishings={finishings} />
    </div>
  );
}
