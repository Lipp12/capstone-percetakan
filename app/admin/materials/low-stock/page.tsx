import { prisma } from "@/lib/prisma";
import MaterialsClient from "../MaterialsClient";
import { AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LowStockAlertPage() {
  const allMaterials = await prisma.material.findMany({
    orderBy: { stock: "asc" },
  });

  const lowStockMaterials = allMaterials.filter((m) => m.stock < m.minStock);

  return (
    <div className="space-y-6">
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl text-rose-900 flex items-start gap-4">
        <div className="p-3 bg-rose-600 text-white rounded-2xl shrink-0 mt-0.5">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
            Peringatan Kritis
          </span>
          <h1 className="text-xl font-black mt-1">
            Peringatan Stok Bahan Menipis ({lowStockMaterials.length} Item)
          </h1>
          <p className="text-xs text-rose-700 mt-1 leading-relaxed">
            Daftar material berikut berada di bawah ambang batas minimal stok fisik. Segera lakukan pemesanan ke supplier atau klik 'Restock' untuk memperbarui kuantitas.
          </p>
        </div>
      </div>

      <MaterialsClient initialMaterials={lowStockMaterials} />
    </div>
  );
}
