import { prisma } from "@/lib/prisma";
import MaterialsClient from "../MaterialsClient";
import { AlertTriangle } from "lucide-react";
import AdminPageHeader from "@/components/AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function LowStockAlertPage() {
  const allMaterials = await prisma.material.findMany({
    orderBy: { stock: "asc" },
  });

  const lowStockMaterials = allMaterials.filter((m) => m.stock < m.minStock);

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-6">
      <AdminPageHeader
        eyebrow="Inventaris Kritis"
        title="Stok Rendah"
        description="Daftar material di bawah ambang batas minimum yang memerlukan restock segera."
      />
      <div className="flex items-start gap-4 rounded-xl bg-error-container/40 p-5 text-on-error-container shadow-sm">
        <div className="p-3 bg-error text-on-error rounded-lg shrink-0 mt-0.5">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-brand-100 px-2.5 py-0.5 rounded-full">
            Peringatan Kritis
          </span>
          <p className="mt-1 text-lg font-bold">
            Peringatan Stok Bahan Menipis ({lowStockMaterials.length} Item)
          </p>
          <p className="text-xs text-primary mt-1 leading-relaxed">
            Daftar material berikut berada di bawah ambang batas minimal stok fisik. Segera lakukan pemesanan ke supplier atau klik 'Restock' untuk memperbarui kuantitas.
          </p>
        </div>
      </div>

      <MaterialsClient initialMaterials={lowStockMaterials} />
    </div>
  );
}
