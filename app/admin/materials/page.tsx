import { prisma } from "@/lib/prisma";
import MaterialsClient from "./MaterialsClient";
import AdminPageHeader from "@/components/AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function AdminMaterialsPage() {
  const materials = await prisma.material.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true, usages: true } },
    },
  });

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-6">
      <AdminPageHeader
        eyebrow="Inventaris & Bahan Baku"
        title="Mengelola Bahan"
        description="Pantau stok fisik, ambang batas minimum, dan kebutuhan restock material cetak."
      />
      <MaterialsClient initialMaterials={materials} />
    </div>
  );
}
