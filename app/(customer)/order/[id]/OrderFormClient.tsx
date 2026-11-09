"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { calculatePricing } from "../../../../lib/pricing";
import { validateFile, formatFileSize } from "../../../../lib/validations";
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
  Upload,
  X,
  CheckCircle2,
} from "lucide-react";

interface Props {
  product: any;
  finishings: any[];
  initialData?: any;
}

type SubmitState = "idle" | "loading" | "success" | "error";

export default function OrderFormClient({
  product,
  finishings,
  initialData,
}: Props) {
  const router = useRouter();
  const isM2 = product.unit.toLowerCase() === "m2";

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  // Berkas desain
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");

  // State submit
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState<string>("");
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string>("");
  const [createdOrderId, setCreatedOrderId] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const selectedProdMat = product.materials.find(
    (pm: any) => pm.materialId === materialId
  );
  const materialAdditionalPrice = selectedProdMat?.additionalPrice || 0;
  const materialName = selectedProdMat?.material?.name;

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

  function toggleFinishing(id: string) {
    if (selectedFinishingIds.includes(id)) {
      setSelectedFinishingIds(selectedFinishingIds.filter((item) => item !== id));
    } else {
      setSelectedFinishingIds([...selectedFinishingIds, id]);
    }
  }

  function handleFileSelect(selected: File | null) {
    if (!selected) return;
    const err = validateFile(selected);
    if (err) {
      setFileError(err);
      setFile(null);
      return;
    }
    setFileError("");
    setFile(selected);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    handleFileSelect(dropped || null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitState === "loading") return;

    setSubmitError("");

    if (pickupMethod === "DELIVERY" && !address.trim()) {
      setSubmitError("Alamat pengiriman wajib diisi jika memilih kurir delivery");
      setSubmitState("error");
      return;
    }

    if (quantity < 1) {
      setSubmitError("Jumlah pemesanan minimal 1");
      setSubmitState("error");
      return;
    }

    if (file) {
      const fileErr = validateFile(file);
      if (fileErr) {
        setFileError(fileErr);
        setSubmitError(fileErr);
        setSubmitState("error");
        return;
      }
    }

    setSubmitState("loading");
    setUploadProgress(0);

    try {
      // 1) Buat pesanan (JSON) ΓÇö total dihitung di server
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
        setSubmitError(data.error || "Gagal membuat pesanan");
        setSubmitState("error");
        return;
      }

      const orderId = data.orderId;
      setCreatedOrderNumber(data.orderNumber || "");
      setCreatedOrderId(data.orderId || "");

      // 2) Unggah berkas (opsional) ke route upload-design
      if (file && orderId) {
        const formData = new FormData();
        formData.append("file", file, file.name);
        if (notes.trim()) formData.append("designNotes", notes.trim());

        const upRes = await fetch(`/api/orders/${orderId}/upload-design`, {
          method: "POST",
          body: formData,
        });
        const upData = await upRes.json();
        if (!upRes.ok) {
          setSubmitError(upData.error || "Pesanan dibuat, tetapi unggah desain gagal. Coba unggah lagi.");
          setSubmitState("error");
          return;
        }
      }

      setSubmitState("success");
    } catch (err) {
      setSubmitError("Terjadi kesalahan koneksi. Silakan coba lagi.");
      setSubmitState("error");
    }
  }

  async function handleRetryUpload() {
    if (!file || !createdOrderId) return;
    setSubmitState("loading");
    setSubmitError("");
    try {
      const formData = new FormData();
      formData.append("file", file, file.name);
      if (notes.trim()) formData.append("designNotes", notes.trim());
      const upRes = await fetch(`/api/orders/${createdOrderId}/upload-design`, {
        method: "POST",
        body: formData,
      });
      const upData = await upRes.json();
      if (!upRes.ok) {
        setSubmitError(upData.error || "Gagal mengunggah desain. Coba lagi.");
        setSubmitState("error");
        return;
      }
      setSubmitState("success");
    } catch (err) {
      setSubmitError("Terjadi kesalahan koneksi. Silakan coba lagi.");
      setSubmitState("error");
    }
  }

  if (submitState === "success") {
    return (
      <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-ink-200 shadow-sm text-center space-y-4">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
        <h2 className="text-xl font-black text-ink-900">Pesanan Berhasil Dibuat</h2>
        <p className="text-sm text-ink-500">
          Kode pesanan Anda:{" "}
          <span className="font-bold text-ink-900">{createdOrderNumber}</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          {!file && createdOrderId && (
            <button
              type="button"
              onClick={() => router.push(`/order/${createdOrderId}/upload`)}
              className="px-5 py-2.5 rounded-xl bg-ink-100 text-ink-700 font-semibold text-sm hover:bg-ink-200 transition"
            >
              Unggah desain sekarang
            </button>
          )}
          <button
            type="button"
            onClick={() => router.push("/katalog")}
            className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition"
          >
            Buat Pesanan Baru
          </button>
          <button
            type="button"
            onClick={() => router.push("/orders")}
            className="px-5 py-2.5 rounded-xl bg-ink-100 text-ink-700 font-semibold text-sm hover:bg-ink-200 transition"
          >
            Lihat Pesanan Saya
          </button>
        </div>
      </div>
    );
  }

  const isLoading = submitState === "loading";

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Kolom Kiri: Input Form Spesifikasi */}
      <div className="lg:col-span-2 space-y-6">
        {(submitState === "error" || submitError) && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}
        {submitState === "error" && createdOrderId && file && (
          <button
            type="button"
            onClick={handleRetryUpload}
            className="px-4 py-2 bg-ink-100 text-ink-700 rounded-xl text-xs font-semibold hover:bg-ink-200 transition"
          >
            Coba unggah lagi
          </button>
        )}

        {/* 1. Pilih Material */}
        {product.materials.length > 0 && (
          <div className="bg-white p-6 rounded-3xl border border-ink-200 shadow-sm space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-ink-800 flex items-center gap-1.5">
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
                        ? "border-primary bg-primary-container/20 ring-2 ring-primary/20"
                        : "border-outline-variant/50 hover:border-outline-variant bg-white"
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
                        {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
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
          <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0_4px_16px_rgba(188,148,120,0.06)] border border-outline-variant/50 space-y-3">
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
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-on-surface-variant/60">Preset cepat:</span>
              <button type="button" onClick={() => { setWidth(2); setHeight(1); }} className="text-[11px] px-2 py-0.5 bg-surface-container hover:bg-slate-200 text-on-surface-variant rounded-md">2 x 1 m</button>
              <button type="button" onClick={() => { setWidth(3); setHeight(1); }} className="text-[11px] px-2 py-0.5 bg-surface-container hover:bg-slate-200 text-on-surface-variant rounded-md">3 x 1 m</button>
              <button type="button" onClick={() => { setWidth(4); setHeight(2); }} className="text-[11px] px-2 py-0.5 bg-surface-container hover:bg-slate-200 text-on-surface-variant rounded-md">4 x 2 m</button>
            </div>
          </div>
        )}

        {/* 3. Jumlah Cetak (Quantity) */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0_4px_16px_rgba(188,148,120,0.06)] border border-outline-variant/50 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
            <Package className="w-4 h-4 text-primary" />
            3. Jumlah Cetak ({product.unit})
          </label>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-xl border border-outline-variant text-on-surface-variant font-bold hover:bg-surface-container transition flex items-center justify-center text-lg">-</button>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-24 text-center py-2 text-base font-bold border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none"
            />
            <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-xl border border-outline-variant text-on-surface-variant font-bold hover:bg-surface-container transition flex items-center justify-center text-lg">+</button>
          </div>
        </div>

        {/* 4. Opsi Finishing (Opsional) */}
        {finishings.length > 0 && (
          <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0_4px_16px_rgba(188,148,120,0.06)] border border-outline-variant/50 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
              <Scissors className="w-4 h-4 text-primary" />
              4. Opsi Finishing Tambahan (Opsional)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {finishings.map((fin) => {
                const isChecked = selectedFinishingIds.includes(fin.id);
                return (
                  <label key={fin.id} className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${isChecked ? "border-primary bg-primary-container/20" : "border-outline-variant/50 hover:border-outline-variant"}`}>
                    <div className="flex items-center gap-2.5">
                      <input type="checkbox" checked={isChecked} onChange={() => toggleFinishing(fin.id)} className="w-4 h-4 rounded text-primary focus:ring-primary" />
                      <span className="text-xs font-medium text-on-surface">{fin.name}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-primary">+{formatRupiah(fin.price)}/{fin.unit}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. Metode Pengambilan & Alamat */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0_4px_16px_rgba(188,148,120,0.06)] border border-outline-variant/50 space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-primary" />
            5. Metode Pengambilan & Pengiriman
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setPickupMethod("PICKUP")} className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${pickupMethod === "PICKUP" ? "border-primary bg-primary-container/20 ring-2 ring-primary/20" : "border-outline-variant/50 hover:border-outline-variant"}`}>
              <Store className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs text-on-surface block">Ambil di Toko (Pickup)</span>
                <span className="text-[11px] text-on-surface-variant">Gratis. Ambil langsung saat selesai.</span>
              </div>
            </button>
            <button type="button" onClick={() => setPickupMethod("DELIVERY")} className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${pickupMethod === "DELIVERY" ? "border-primary bg-primary-container/20 ring-2 ring-primary/20" : "border-outline-variant/50 hover:border-outline-variant"}`}>
              <Truck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs text-on-surface block">Kirim ke Alamat (Delivery)</span>
                <span className="text-[11px] text-on-surface-variant">Dikirim via kurir.</span>
              </div>
            </button>
          </div>
          {pickupMethod === "DELIVERY" && (
            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-semibold text-on-surface-variant block">Alamat Lengkap Pengiriman *</span>
              <textarea required rows={3} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Jl. Sukajadi No. 123, RT 01/02, Kel. Pasteur, Kec. Sukajadi, Kota Bandung 40161" className="w-full p-3 text-xs border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none" />
            </div>
          )}
        </div>

        {/* 6. Unggah Berkas Desain */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0_4px_16px_rgba(188,148,120,0.06)] border border-outline-variant/50 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-primary" />
            6. Unggah Berkas Desain (PDF/AI/PSD/PNG/JPG, maks 25 MB)
          </label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
              isDragging
                ? "border-primary bg-primary-container/20"
                : "border-outline-variant hover:border-slate-400 bg-slate-50/40"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.ai,.psd,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            />
            {file ? (
              <div className="flex items-center justify-between gap-3">
                <div className="text-left">
                  <p className="text-sm font-semibold text-on-surface truncate">{file.name}</p>
                  <p className="text-[11px] text-on-surface-variant">{formatFileSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setFileError("");
                  }}
                  className="p-1.5 rounded-lg bg-surface-container hover:bg-rose-100 text-on-surface-variant hover:text-rose-600 transition"
                  aria-label="Hapus berkas"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Upload className="w-6 h-6 text-on-surface-variant/60 mx-auto" />
                <p className="text-xs font-medium text-on-surface-variant">
                  Seret & letakkan berkas di sini, atau klik untuk memilih
                </p>
                <p className="text-[11px] text-on-surface-variant/60">
                  Format: PDF, AI, PSD, PNG, JPG (maks 25 MB)
                </p>
              </div>
            )}
          </div>
          {fileError && (
            <p className="text-xs text-rose-600 font-medium">{fileError}</p>
          )}
        </div>

        {/* 7. Catatan Tambahan */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0_4px_16px_rgba(188,148,120,0.06)] border border-outline-variant/50 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-primary" />
            7. Catatan Khusus untuk Operator (Opsional)
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
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-2xl bg-primary hover:bg-primary text-white font-bold text-sm shadow-xl shadow-primary/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {uploadProgress > 0
                    ? `Mengunggah... ${uploadProgress}%`
                    : "Menyimpan Pesanan..."}
                </span>
              </>
            ) : (
              <>
                <span>Buat Pesanan</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          <p className="text-[11px] text-on-surface-variant/60 text-center leading-tight">
            Setelah submit, pesanan akan disimpan dan diteruskan ke sistem Alif.
          </p>
        </div>
      </div>
    </form>
  );
}
