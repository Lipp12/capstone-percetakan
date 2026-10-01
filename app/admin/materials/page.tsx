import { prisma } from "@/lib/prisma";
import MaterialsClient from "./MaterialsClient";

export const dynamic = "force-dynamic";

export default async function AdminMaterialsPage() {
  const materials = await prisma.material.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true, usages: true } },
    },
  });

  return (
    <div className="space-y-6">
      <MaterialsClient initialMaterials={materials} />
    </div>
  );
}
