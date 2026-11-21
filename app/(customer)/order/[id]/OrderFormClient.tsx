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
} from "lucide-react";

interface Props {
  product: any;
  finishings: any[];
  initialData?: any;
}

type SubmitState = "idle" | "loading" | "error";

function getDimensionError(value: string): string {
  const numericValue = Number(value);
  return value.trim() === "" || !Number.isFinite(numericValue) || numericValue < 1
    ? "Wajib di isi minimal 1"
    : "";
}

export default function OrderFormClient({
  product,
  finishings,
  initialData,
}: Props) {
  const router = useRouter();
  const isM2 = product.unit.toLowerCase() === "m2";
  const materialStep = 1;
  const dimensionStep = materialStep + Number(product.materials.length > 0);
  const quantityStep = dimensionStep + Number(isM2);
  const finishingStep = quantityStep + 1;
  const pickupStep = finishingStep + Number(finishings.length > 0);
  const uploadStep = pickupStep + 1;
  const notesStep = uploadStep + 1;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // State Form
  const [materialId, setMaterialId] = useState<string>(
    initialData?.materialId || product.materials[0]?.materialId || ""
  );
  const [width, setWidth] = useState<string>(
    initialData?.width != null ? String(initialData.width) : ""
  );
  const [height, setHeight] = useState<string>(
    initialData?.height != null ? String(initialData.height) : ""
  );
  const [dimensionSubmitted, setDimensionSubmitted] = useState(false);
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
      width: isM2 ? Number(width) || 0 : 1,
      height: isM2 ? Number(height) || 0 : 1,
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
    setSubmitError("");
    if (submitState === "error") setSubmitState("idle");
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

    if (!file) {
      const message = "Berkas desain wajib diunggah sebelum membuat pesanan";
      setFileError(message);
      setSubmitError(message);
      setSubmitState("error");
      return;
    }

    if (isM2 && (getDimensionError(width) || getDimensionError(height))) {
      setDimensionSubmitted(true);
      setSubmitError("Ukuran cetak wajib diisi minimal 1 meter");
      setSubmitState("error");
      return;
    }

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

    const fileErr = validateFile(file);
    if (fileErr) {
      setFileError(fileErr);
      setSubmitError(fileErr);
      setSubmitState("error");
      return;
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
      if (!orderId) {
        setSubmitError("Pesanan berhasil diproses, tetapi nomor pesanan tidak ditemukan. Silakan cek halaman Pesanan Saya.");
        setSubmitState("error");
        return;
      }
      setCreatedOrderId(orderId);

      // 2) Unggah berkas desain ke route upload-design
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

      router.push(`/checkout/${orderId}`);
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
      router.push(`/checkout/${createdOrderId}`);
    } catch (err) {
      setSubmitError("Terjadi kesalahan koneksi. Silakan coba lagi.");
      setSubmitState("error");
    }
  }

  const isLoading = submitState === "loading";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3"
    >
      {/* Kolom Kiri: Input Form Spesifikasi */}
      <div className="space-y-6 lg:col-span-2">
        {(submitState === "error" || submitError) && (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}
        {submitState === "error" && createdOrderId && file && (
          <button
            type="button"
            onClick={handleRetryUpload}
            className="rounded-xl bg-[#f5efe5] px-4 py-2 text-xs font-semibold text-on-surface hover:bg-[#eee5d9] transition"
          >
            Coba unggah lagi
          </button>
        )}

        {/* Bahan / Material */}
        {product.materials.length > 0 && (
          <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0_4px_16px_rgba(188,148,120,0.06)] border border-outline-variant/50 space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-ink-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              {materialStep}. Pilih Jenis Bahan / Material
              <span className="text-error text-[10px]">*</span>
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {product.materials.map((pm: any) => {
                const isSelected = materialId === pm.materialId;
                return (
                  <button
                    type="button"
                    key={pm.id}
                    onClick={() => setMaterialId(pm.materialId)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? "border-primary bg-primary-container/20 ring-2 ring-primary/20"
                        : "border-outline-variant/50 hover:border-primary bg-surface-container-low"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-on-surface">
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
                    <span className="text-xs text-on-surface-variant block">
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
          <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0_4px_16px_rgba(188,148,120,0.06)] border border-outline-variant/50 space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-ink-800 flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-primary" />
              {dimensionStep}. Dimensi Ukuran Cetak (Meter)
              <span className="text-error text-[10px]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-on-surface-variant mb-1 block">Lebar (Meter)</span>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={width}
                  onChange={(e) => {
                    setWidth(e.target.value);
                    setSubmitError("");
                    if (submitState === "error") setSubmitState("idle");
                  }}
                  className={`w-full rounded-xl border bg-surface-container-low px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none ${
                    dimensionSubmitted && getDimensionError(width)
                      ? "border-rose-500"
                      : "border-outline-variant"
                  }`}
                  aria-invalid={Boolean(dimensionSubmitted && getDimensionError(width))}
                />
                {dimensionSubmitted && getDimensionError(width) && (
                  <span className="mt-1 block text-xs text-rose-700">Wajib di isi minimal 1</span>
                )}
              </div>
              <div>
                <span className="text-xs text-on-surface-variant mb-1 block">Tinggi / Panjang (Meter)</span>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={height}
                  onChange={(e) => {
                    setHeight(e.target.value);
                    setSubmitError("");
                    if (submitState === "error") setSubmitState("idle");
                  }}
                  className={`w-full rounded-xl border bg-surface-container-low px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none ${
                    dimensionSubmitted && getDimensionError(height)
                      ? "border-rose-500"
                      : "border-outline-variant"
                  }`}
                  aria-invalid={Boolean(dimensionSubmitted && getDimensionError(height))}
                />
                {dimensionSubmitted && getDimensionError(height) && (
                  <span className="mt-1 block text-xs text-rose-700">Wajib di isi minimal 1</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-on-surface-variant">Preset cepat:</span>
              <button type="button" onClick={() => { setWidth("2"); setHeight("1"); setSubmitError(""); if (submitState === "error") setSubmitState("idle"); }} className="rounded-lg bg-primary-container/40 px-3 py-1.5 text-xs text-on-primary-container hover:bg-primary-container">
                2 x 1 m
              </button>
              <button type="button" onClick={() => { setWidth("3"); setHeight("1"); setSubmitError(""); if (submitState === "error") setSubmitState("idle"); }} className="rounded-lg bg-primary-container/40 px-3 py-1.5 text-xs text-on-primary-container hover:bg-primary-container">
                3 x 1 m
              </button>
              <button type="button" onClick={() => { setWidth("4"); setHeight("2"); setSubmitError(""); if (submitState === "error") setSubmitState("idle"); }} className="rounded-lg bg-primary-container/40 px-3 py-1.5 text-xs text-on-primary-container hover:bg-primary-container">
                4 x 2 m
              </button>
            </div>
          </div>
        )}

        {/* 3. Jumlah Cetak (Quantity) */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0_4px_16px_rgba(188,148,120,0.06)] border border-outline-variant/50 space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-ink-800 flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            {quantityStep}. Jumlah Cetak ({product.unit})
            <span className="text-error text-[10px]">*</span>
          </label>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-xl bg-surface-container-high text-on-surface font-bold text-lg hover:bg-surface-container-highest transition">-</button>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-24 rounded-xl border border-outline-variant bg-surface-container-low px-4 py-2 text-center text-base font-bold text-on-surface focus:ring-2 focus:ring-primary outline-none"
            />
            <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-xl bg-surface-container-high text-on-surface font-bold text-lg hover:bg-surface-container-highest transition">+</button>
          </div>
        </div>

        {/* 4. Opsi Finishing (Opsional) */}
        {finishings.length > 0 && (
          <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0_4px_16px_rgba(188,148,120,0.06)] border border-outline-variant/50 space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-ink-800 flex items-center gap-2">
              <Scissors className="w-4 h-4 text-primary" />
              {finishingStep}. Opsi Finishing Tambahan <span className="text-on-surface-variant text-[10px] normal-case">(Opsional)</span>
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {finishings.map((fin) => {
                const isChecked = selectedFinishingIds.includes(fin.id);
                return (
                  <label key={fin.id} className={`flex cursor-pointer items-center justify-between gap-2 rounded-2xl border p-4 transition ${isChecked ? "border-primary bg-primary-container/20" : "border-outline-variant/50 hover:border-primary bg-surface-container-low"}`}>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleFinishing(fin.id)}
                        className="w-4 h-4 rounded text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium text-on-surface">
                        {fin.name}
                      </span>
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
          <label className="text-xs font-bold uppercase tracking-wider text-ink-800 flex items-center gap-2">
            <Truck className="w-4 h-4 text-primary" />
            {pickupStep}. Metode Pengambilan & Pengiriman <span className="text-error text-[10px]">*</span>
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => setPickupMethod("PICKUP")} className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${pickupMethod === "PICKUP" ? "border-primary bg-primary-container/20 ring-2 ring-primary/20" : "border-outline-variant/50 hover:border-primary bg-surface-container-low"}`}>
              <Store className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs text-on-surface block">Ambil di Toko (Pickup)</span>
                <span className="text-[11px] text-on-surface-variant">Gratis. Ambil langsung saat selesai.</span>
              </div>
            </button>
            <button type="button" onClick={() => setPickupMethod("DELIVERY")} className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${pickupMethod === "DELIVERY" ? "border-primary bg-primary-container/20 ring-2 ring-primary/20" : "border-outline-variant/50 hover:border-primary bg-surface-container-low"}`}>
              <Truck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs text-on-surface block">Kirim ke Alamat (Delivery)</span>
                <span className="text-[11px] text-on-surface-variant">Dikirim via kurir.</span>
              </div>
            </button>
          </div>
          {pickupMethod === "DELIVERY" && (
            <div className="space-y-1.5 pt-2">
                <span className="text-xs font-semibold text-on-surface-variant block">
                  Alamat Lengkap Pengiriman <span className="text-error">*</span>
              </span>
              <textarea
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jl. Sukajadi No. 123, RT 01/02, Kel. Pasteur, Kec. Sukajadi, Kota Bandung 40161"
                className="w-full rounded-xl border border-outline-variant bg-surface-container-low p-4 text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          )}
        </div>

        {/* 6. Unggah Berkas Desain */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0_4px_16px_rgba(188,148,120,0.06)] border border-outline-variant/50 space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-ink-800 flex items-center gap-2">
            <Upload className="w-4 h-4 text-primary" />
            {uploadStep}. Berkas Desain <span className="text-error text-[10px]">*</span>
          </label>
          <p className="text-xs text-on-surface-variant">PDF, AI, PSD, PNG, JPG (maks. 25 MB)</p>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
              isDragging
                ? "border-primary bg-primary-container/20"
                : fileError
                ? "border-rose-500 bg-rose-50/40"
                : "border-outline-variant bg-surface-container-low hover:border-primary"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.ai,.psd,.png,.jpg,.jpeg"
              className="hidden"
              required
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
                    setFileError("Berkas desain wajib diunggah sebelum membuat pesanan");
                  }}
                  className="rounded-lg bg-[#f5efe5] p-1.5 text-on-surface-variant transition hover:bg-rose-100 hover:text-rose-600"
                  aria-label="Hapus berkas"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#f5df7a]/40">
                  <Upload className="h-5 w-5 text-[#785c0b]" />
                </span>
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
            <p className="text-xs text-rose-700 font-medium" role="alert">{fileError}</p>
          )}
        </div>

        {/* 7. Catatan Tambahan */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0_4px_16px_rgba(188,148,120,0.06)] border border-outline-variant/50 space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-ink-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            {notesStep}. Catatan Khusus untuk Operator <span className="text-on-surface-variant text-[10px] normal-case">(Opsional)</span>
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Tolong lubang mata ayam di perbanyak di bagian atas..."
            className="w-full rounded-xl border border-outline-variant bg-surface-container-low p-4 text-sm focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
      </div>

      {/* Kolom Kanan: Live Price Breakdown & Submit CTA */}
      <div className="space-y-4">
        <div className="sticky top-24 space-y-4">
          {isM2 && (!width || !height || getDimensionError(width) || getDimensionError(height)) ? (
            <div className="rounded-2xl border border-[#eee5d9] bg-white p-5 text-sm text-on-surface-variant shadow-sm">
              Isi lebar dan tinggi minimal 1 meter untuk melihat estimasi harga.
            </div>
          ) : (
            <PriceBreakdown
              breakdown={breakdown}
              productName={product.name}
              materialName={materialName}
              quantity={quantity}
            />
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#bd3f16] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#a93612] disabled:opacity-50"
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
                <span>Lanjut ke Pembayaran</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          <p className="text-[11px] text-on-surface-variant/60 text-center leading-tight">
            Setelah pesanan disimpan dan desain diunggah, kamu akan diarahkan ke pembayaran.
          </p>
        </div>
      </div>
    </form>
  );
}
