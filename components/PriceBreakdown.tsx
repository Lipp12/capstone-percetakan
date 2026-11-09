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
    <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0_4px_16px_rgba(188,148,120,0.06)] border border-outline-variant/50 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/50">
          <div className="p-1.5 bg-primary-container text-on-primary-container rounded-lg">
            <Calculator className="w-4 h-4" />
          </div>
          <span className="font-epilogue font-bold text-sm tracking-tight text-on-surface">
            Estimasi Harga Real-Time
          </span>
        </div>

      {/* Rincian Komponen Biaya */}
      <div className="space-y-2 text-xs text-on-surface-variant">
        <div className="flex justify-between py-1 border-b border-outline-variant/30">
          <span className="text-on-surface-variant/70">Harga Dasar Produk:</span>
          <span className="text-on-surface">{formatRupiah(breakdown.baseProductPrice)} / {breakdown.unit}</span>
        </div>

        {materialName && (
          <div className="flex justify-between py-1 border-b border-outline-variant/30">
            <span className="text-on-surface-variant/70">Material ({materialName}):</span>
            <span className="text-on-surface">
              {breakdown.materialAdditionalPrice > 0
                ? `+${formatRupiah(breakdown.materialAdditionalPrice)}`
                : "Standar"}
            </span>
          </div>
        )}

        {isM2 && (
          <div className="flex justify-between py-1 border-b border-outline-variant/30">
            <span className="text-on-surface-variant/70">Total Luas:</span>
            <span className="font-semibold text-on-surface">{breakdown.area} m²</span>
          </div>
        )}

        <div className="flex justify-between py-1 border-b border-outline-variant/30">
          <span className="text-on-surface-variant/70">Jumlah Cetak:</span>
          <span className="font-semibold text-on-surface">{quantity} {breakdown.unit}</span>
        </div>

        <div className="flex justify-between py-1 border-b border-outline-variant/30">
          <span className="text-on-surface-variant/70">Subtotal Cetak:</span>
          <span className="font-semibold text-on-surface">{formatRupiah(breakdown.subtotal)}</span>
        </div>

        {/* Finishing breakdown */}
        {breakdown.finishingsBreakdown.length > 0 && (
          <div className="pt-1">
            <span className="text-[11px] font-bold text-on-surface-variant/70 uppercase tracking-wider block mb-1">
              Biaya Finishing:
            </span>
            {breakdown.finishingsBreakdown.map((fin, i) => (
              <div key={i} className="flex justify-between text-on-surface-variant pl-2 py-0.5">
                <span>• {fin.name}</span>
                <span>{formatRupiah(fin.total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total Akhir */}
      <div className="pt-4 border-t border-outline-variant/50">
        <span className="text-xs text-on-surface-variant/70 block font-medium">
          Total Estimasi
        </span>
        <span className="font-epilogue text-2xl font-bold text-primary">
          {formatRupiah(breakdown.total)}
        </span>
      </div>
    </div>
  );
}
