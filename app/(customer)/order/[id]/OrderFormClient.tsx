"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { calculatePricing } from "../../../../lib/pricing";
import PriceBreakdown from "../../../../components/PriceBreakdown";
import { formatRupiah } from "../../../../lib/utils";
import {
  Layers,
  Maximize2,
  Package,
  Truck,
  Store,
  Scissors,
  FileText,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface Props {
  product: any;
  finishings: any[];
  initialData?: any;
}

export default function OrderFormClient({
  product,
  finishings,
  initialData,
}: Props) {
  const router = useRouter();
  const isM2 = product.unit.toLowerCase() === "m2";

  // State Form
  const [materialId, setMaterialId] = useState<string>(
    initialData?.materialId || product.materials[0]?.materialId || ""
  );
  const [width, setWidth] = useState<number>(initialData?.width || 2);
  const [height, setHeight] = useState<number>(initialData?.height || 1);
  const [quantity, setQuantity] = useState<number>(initialData?.quantity || 1);
  const [selectedFinishingIds, setSelectedFinishingIds] = useState<string[]>(
    initialData?.finishingIds || []
  );
  const [pickupMethod, setPickupMethod] = useState<"PICKUP" | "DELIVERY">(
    initialData?.pickupMethod || "PICKUP"
  );
  const [address, setAddress] = useState<string>(initialData?.address || "");
  const [notes, setNotes] = useState<string>(initialData?.notes || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Temukan material yang dipilih
  const selectedProdMat = product.materials.find(
    (pm: any) => pm.materialId === materialId
  );
  const materialAdditionalPrice = selectedProdMat?.additionalPrice || 0;
  const materialName = selectedProdMat?.material?.name;

  // Siapkan finishing yang dipilih
  const selectedFinishingObjects = useMemo(() => {
    return finishings
      .filter((f) => selectedFinishingIds.includes(f.id))
      .map((f) => ({
        id: f.id,
        name: f.name,
        price: f.price,
        unit: f.unit,
      }));
  }, [finishings, selectedFinishingIds]);

  // Perhitungan Real-Time
  const breakdown = useMemo(() => {
    return calculatePricing({
      basePrice: product.basePrice,
      unit: product.unit,
      materialAdditionalPrice,
      width: isM2 ? width : 1,
      height: isM2 ? height : 1,
      quantity,
      finishings: selectedFinishingObjects,
    });
  }, [
    product.basePrice,
    product.unit,
    materialAdditionalPrice,
    isM2,
    width,
    height,
    quantity,
    selectedFinishingObjects,
  ]);

  // Handle Toggle Finishing
  function toggleFinishing(id: string) {
    if (selectedFinishingIds.includes(id)) {
      setSelectedFinishingIds(selectedFinishingIds.filter((item) => item !== id));
    } else {
      setSelectedFinishingIds([...selectedFinishingIds, id]);
    }
  }

  // Handle Submit Order
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (pickupMethod === "DELIVERY" && !address.trim()) {
      setError("Alamat pengiriman wajib diisi jika memilih kurir delivery");
      return;
    }

    if (quantity < 1) {
      setError("Jumlah pemesanan minimal 1");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          materialId: materialId || undefined,
          width: isM2 ? Number(width) : undefined,
          height: isM2 ? Number(height) : undefined,
          quantity: Number(quantity),
          pickupMethod,
          address: pickupMethod === "DELIVERY" ? address : undefined,
          finishingIds: selectedFinishingIds,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal membuat pesanan");
        setLoading(false);
        return;
      }

      // Berhasil dibuat -> arahkan ke halaman upload desain
      router.push(`/order/${data.orderId}/upload`);
    } catch (err) {
      setError("Terjadi kesalahan koneksi. Silakan coba lagi.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Kolom Kiri: Input Form Spesifikasi */}
      <div className="lg:col-span-2 space-y-6">
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Pilih Material */}
        {product.materials.length > 0 && (
          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant shadow-sm space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-primary" />
              1. Pilih Jenis Bahan / Material
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.materials.map((pm: any) => {
                const isSelected = materialId === pm.materialId;
                return (
                  <button
                    type="button"
                    key={pm.id}
                    onClick={() => setMaterialId(pm.materialId)}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      isSelected
                        ? "border-primary bg-primary-container/20/50 ring-2 ring-primary/20"
                        : "border-outline-variant hover:border-outline-variant bg-surface-container-lowest"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-on-surface">
                        {pm.material.name}
                      </span>
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-outline-variant"
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 bg-surface-container-lowest rounded-full" />}
                      </span>
                    </div>
                    <span className="text-[11px] text-on-surface-variant block">
                      {pm.additionalPrice > 0
                        ? `+${formatRupiah(pm.additionalPrice)} / ${product.unit}`
                        : "Standar"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Ukuran Cetak (Jika unit m2) */}
        {isM2 && (
          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant shadow-sm space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-primary" />
              2. Dimensi Ukuran Cetak (Meter)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-on-surface-variant mb-1 block">Lebar (Meter)</span>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  value={width}
                  onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 text-sm border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <span className="text-xs text-on-surface-variant mb-1 block">Tinggi / Panjang (Meter)</span>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  value={height}
                  onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 text-sm border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            {/* Shortcut Ukuran Populer */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-outline">Preset cepat:</span>
              <button
                type="button"
                onClick={() => { setWidth(2); setHeight(1); }}
                className="text-[11px] px-2 py-0.5 bg-surface-container hover:bg-surface-container text-on-surface-variant rounded-md"
              >
                2 x 1 m
              </button>
              <button
                type="button"
                onClick={() => { setWidth(3); setHeight(1); }}
                className="text-[11px] px-2 py-0.5 bg-surface-container hover:bg-surface-container text-on-surface-variant rounded-md"
              >
                3 x 1 m
              </button>
              <button
                type="button"
                onClick={() => { setWidth(4); setHeight(2); }}
                className="text-[11px] px-2 py-0.5 bg-surface-container hover:bg-surface-container text-on-surface-variant rounded-md"
              >
                4 x 2 m
              </button>
            </div>
          </div>
        )}

        {/* 3. Jumlah Cetak (Quantity) */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant shadow-sm space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
            <Package className="w-4 h-4 text-primary" />
            3. Jumlah Cetak ({product.unit})
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-xl border border-outline-variant text-on-surface-variant font-bold hover:bg-surface-container transition flex items-center justify-center text-lg"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-24 text-center py-2 text-base font-bold border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none"
            />
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 rounded-xl border border-outline-variant text-on-surface-variant font-bold hover:bg-surface-container transition flex items-center justify-center text-lg"
            >
              +
            </button>
          </div>
        </div>

        {/* 4. Opsi Finishing (Opsional) */}
        {finishings.length > 0 && (
          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant shadow-sm space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
              <Scissors className="w-4 h-4 text-primary" />
              4. Opsi Finishing Tambahan (Opsional)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {finishings.map((fin) => {
                const isChecked = selectedFinishingIds.includes(fin.id);
                return (
                  <label
                    key={fin.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                      isChecked
                        ? "border-primary bg-primary-container/20/40"
                        : "border-outline-variant hover:border-outline-variant"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleFinishing(fin.id)}
                        className="w-4 h-4 rounded text-primary focus:ring-primary"
                      />
                      <span className="text-xs font-medium text-on-surface">
                        {fin.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-primary">
                      +{formatRupiah(fin.price)}/{fin.unit}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. Metode Pengambilan & Alamat */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant shadow-sm space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-primary" />
            5. Metode Pengambilan & Pengiriman
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPickupMethod("PICKUP")}
              className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                pickupMethod === "PICKUP"
                  ? "border-primary bg-primary-container/20/50 ring-2 ring-primary/20"
                  : "border-outline-variant hover:border-outline-variant"
              }`}
            >
              <Store className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs text-on-surface block">
                  Ambil di Toko (Pickup)
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  Gratis. Ambil langsung saat selesai.
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPickupMethod("DELIVERY")}
              className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                pickupMethod === "DELIVERY"
                  ? "border-primary bg-primary-container/20/50 ring-2 ring-primary/20"
                  : "border-outline-variant hover:border-outline-variant"
              }`}
            >
              <Truck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs text-on-surface block">
                  Kirim ke Alamat (Delivery)
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  Dikirim via kurir.
                </span>
              </div>
            </button>
          </div>

          {pickupMethod === "DELIVERY" && (
            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-semibold text-on-surface-variant block">
                Alamat Lengkap Pengiriman *
              </span>
              <textarea
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jl. Sukajadi No. 123, RT 01/02, Kel. Pasteur, Kec. Sukajadi, Kota Bandung 40161"
                className="w-full p-3 text-xs border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          )}
        </div>

        {/* 6. Catatan Tambahan */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant shadow-sm space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-primary" />
            6. Catatan Khusus untuk Operator (Opsional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Tolong lubang mata ayam di perbanyak di bagian atas..."
            className="w-full p-3 text-xs border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
      </div>

      {/* Kolom Kanan: Live Price Breakdown & Submit CTA */}
      <div className="space-y-4">
        <div className="sticky top-24 space-y-4">
          <PriceBreakdown
            breakdown={breakdown}
            productName={product.name}
            materialName={materialName}
            quantity={quantity}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-xl shadow-primary/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan Pesanan...</span>
              </>
            ) : (
              <>
                <span>Lanjut ke Upload Desain</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          <p className="text-[11px] text-outline text-center leading-tight">
            Setelah ini Anda akan diminta mengunggah file desain (PDF/JPG/PNG) untuk divalidasi tim pra-cetak.
          </p>
        </div>
      </div>
    </form>
  );
}
