import { PricingBreakdown } from "@/lib/pricing";
import { formatRupiah } from "@/lib/utils";
import { Calculator } from "lucide-react";

interface Props {
  breakdown: PricingBreakdown;
  productName: string;
  materialName?: string;
  quantity: number;
}

export default function PriceBreakdown({
  breakdown,
  productName,
  materialName,
  quantity,
}: Props) {
  const isM2 = breakdown.unit.toLowerCase() === "m2";

  return (
    <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <div className="p-1.5 bg-blue-600/30 text-blue-400 rounded-lg">
            <Calculator className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight">
            Estimasi Harga Real-Time
          </span>
        </div>

      {/* Rincian Komponen Biaya */}
      <div className="space-y-2 text-xs text-slate-300">
        <div className="flex justify-between py-1 border-b border-slate-800/60">
          <span className="text-slate-400">Harga Dasar Produk:</span>
          <span>{formatRupiah(breakdown.baseProductPrice)} / {breakdown.unit}</span>
        </div>

        {materialName && (
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Material ({materialName}):</span>
            <span>
              {breakdown.materialAdditionalPrice > 0
                ? `+${formatRupiah(breakdown.materialAdditionalPrice)}`
                : "Standar"}
            </span>
          </div>
        )}

        {isM2 && (
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Total Luas:</span>
            <span className="font-semibold text-white">{breakdown.area} m²</span>
          </div>
        )}

        <div className="flex justify-between py-1 border-b border-slate-800/60">
          <span className="text-slate-400">Jumlah Cetak:</span>
          <span className="font-semibold text-white">{quantity} {breakdown.unit}</span>
        </div>

        <div className="flex justify-between py-1 border-b border-slate-800/60">
          <span className="text-slate-400">Subtotal Cetak:</span>
          <span className="font-semibold text-white">{formatRupiah(breakdown.subtotal)}</span>
        </div>

        {/* Finishing breakdown */}
        {breakdown.finishingsBreakdown.length > 0 && (
          <div className="pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Biaya Finishing:
            </span>
            {breakdown.finishingsBreakdown.map((fin, i) => (
              <div key={i} className="flex justify-between text-slate-300 pl-2 py-0.5">
                <span>• {fin.name}</span>
                <span>{formatRupiah(fin.total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total Akhir */}
      <div className="pt-4 border-t border-slate-800">
        <span className="text-xs text-slate-400 block font-medium">
          Total Estimasi
        </span>
        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
          {formatRupiah(breakdown.total)}
        </span>
      </div>
    </div>
  );
}
