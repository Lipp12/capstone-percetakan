"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah } from "../../../../lib/utils";
import {
  CreditCard,
  QrCode,
  Banknote,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface Props {
  order: any;
}

export default function CheckoutClient({ order }: Props) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("TRANSFER_BCA");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isAlreadyPaid = order.status !== "PENDING_PAYMENT";

  const paymentOptions = [
    {
      id: "TRANSFER_BCA",
      name: "Transfer Bank BCA",
      account: "1234-5678-90",
      holder: "PT Cetak Kilat Indonesia",
      icon: CreditCard,
    },
    {
      id: "TRANSFER_MANDIRI",
      name: "Transfer Bank Mandiri",
      account: "9876-5432-1000",
      holder: "PT Cetak Kilat Indonesia",
      icon: CreditCard,
    },
    {
      id: "QRIS",
      name: "QRIS (GoPay, OVO, Dana, ShopeePay)",
      account: "NMID: ID1020260901234",
      holder: "CetakKilat Express",
      icon: QrCode,
    },
    {
      id: "CASH",
      name: "Bayar Tunai di Kasir (Cash on Pickup)",
      account: "Hanya untuk metode Ambil di Toko",
      holder: "Meja Kasir Workshop",
      icon: Banknote,
    },
  ];

  async function handleConfirmPayment(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (paymentMethod !== "CASH" && !proofFile && !order.paymentProofUrl) {
      setError("Silakan unggah bukti transfer pembayaran");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("paymentMethod", paymentMethod);
      if (proofFile) {
        formData.append("proof", proofFile);
      }

      const res = await fetch(`/api/orders/${order.id}/pay`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal mengonfirmasi pembayaran");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/orders/${order.id}/tracking`);
      }, 1500);
    } catch (err) {
      setError("Terjadi kesalahan jaringan");
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Kolom Kiri: Pilihan Metode Bayar & Upload Bukti */}
      <div className="lg:col-span-2 space-y-6">
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Pembayaran berhasil! Mengalihkan ke Live Order Tracking...</span>
          </div>
        )}

        {isAlreadyPaid && (
          <div className="p-4 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-2xl flex items-center justify-between">
            <span>Pesanan ini sudah dalam status {order.status}.</span>
            <button
              onClick={() => router.push(`/orders/${order.id}/tracking`)}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg font-semibold"
            >
              Lihat Tracking
            </button>
          </div>
        )}

        {/* Pilihan Metode Bayar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
            Pilih Saluran Pembayaran
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {paymentOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = paymentMethod === opt.id;
              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setPaymentMethod(opt.id)}
                  className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="p-2 bg-blue-100/60 text-blue-600 rounded-xl shrink-0 mt-0.5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-xs text-slate-900 block truncate">
                      {opt.name}
                    </span>
                    <span className="text-[11px] font-mono text-blue-700 font-semibold block mt-0.5">
                      {opt.account}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {opt.holder}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upload Bukti Pembayaran */}
        {paymentMethod !== "CASH" && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
              Unggah Bukti Transfer / Resi Struk
            </label>
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50 relative cursor-pointer">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setProofFile(e.target.files[0]);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <Upload className="w-8 h-8 text-slate-400" />
                <p className="text-xs font-semibold text-slate-700">
                  {proofFile ? proofFile.name : "Pilih foto screenshot struk atau bukti transfer"}
                </p>
                <p className="text-[10px] text-slate-400">JPG, PNG, atau PDF (Maksimal 5MB)</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Kolom Kanan: Ringkasan Lengkap & CTA Bayar */}
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
            <span>Ringkasan Pesanan</span>
            <span className="text-xs text-blue-600 font-semibold">#{order.orderNumber}</span>
          </h3>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400">Produk:</span>
              <span className="font-semibold text-slate-800">{order.product.name}</span>
            </div>

            {order.material && (
              <div className="flex justify-between">
                <span className="text-slate-400">Bahan:</span>
                <span className="font-medium text-slate-800">{order.material.name}</span>
              </div>
            )}

            {order.width && order.height && (
              <div className="flex justify-between">
                <span className="text-slate-400">Ukuran:</span>
                <span className="font-medium text-slate-800">
                  {order.width} x {order.height} meter ({order.width * order.height} m²)
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-slate-400">Jumlah:</span>
              <span className="font-medium text-slate-800">
                {order.quantity} {order.product.unit}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Pengiriman:</span>
              <span className="font-medium text-slate-800">
                {order.pickupMethod === "DELIVERY" ? "Kurir Delivery" : "Ambil di Toko"}
              </span>
            </div>

            {order.finishings.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Finishing:
                </span>
                {order.finishings.map((f: any) => (
                  <div key={f.id} className="flex justify-between text-[11px] text-slate-500">
                    <span>• {f.finishing.name}</span>
                    <span>{formatRupiah(f.price)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-baseline justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Tagihan</span>
            <span className="text-2xl font-black text-blue-600">
              {formatRupiah(order.totalPrice)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleConfirmPayment}
            disabled={loading || success || isAlreadyPaid}
            className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <span>Konfirmasi Pembayaran</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Verifikasi aman dan data terenkripsi</span>
          </div>
        </div>
      </div>
    </div>
  );
}
