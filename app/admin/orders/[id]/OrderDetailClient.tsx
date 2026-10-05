"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah, formatDateTime, formatDate } from "@/lib/utils";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  ExternalLink,
  CreditCard,
  Truck,
  Store,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Phone,
  Mail,
  Printer,
} from "lucide-react";

interface Props {
  order: any;
}

const ALL_STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "DESIGN_CHECKING",
  "DESIGN_REJECTED",
  "DESIGN_APPROVED",
  "IN_PRODUCTION",
  "FINISHING",
  "READY",
  "SHIPPING",
  "COMPLETED",
  "CANCELLED",
];

export default function OrderDetailClient({ order: initialOrder }: Props) {
  const router = useRouter();
  const [order, setOrder] = useState(initialOrder);
  const [newStatus, setNewStatus] = useState(initialOrder.status);
  const [notes, setNotes] = useState("");
  const [courier, setCourier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleUpdateStatus(statusToApply?: string, customNotes?: string) {
    setLoading(true);
    setFeedback(null);

    const targetStatus = statusToApply || newStatus;

    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: targetStatus,
          notes: customNotes || notes,
          courier: courier || undefined,
          trackingNumber: trackingNumber || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", text: data.error || "Gagal memperbarui status" });
        setLoading(false);
        return;
      }

      setFeedback({ type: "success", text: "Status pesanan berhasil diperbarui!" });
      setOrder(data.order);
      setNewStatus(data.order.status);
      setNotes("");
      router.refresh();
    } catch (err) {
      setFeedback({ type: "error", text: "Terjadi kesalahan koneksi" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Pesanan</span>
        </Link>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} size="lg" />
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2 border ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-blue-50 text-blue-800 border-blue-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Main Info Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
              Order Detail Management
            </span>
            <h1 className="text-2xl font-black text-slate-900">
              {order.orderNumber}
            </h1>
            <span className="text-xs text-slate-400">
              Dibuat pada {formatDateTime(order.createdAt)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">Total Nilai Pesanan</span>
            <span className="text-2xl font-black text-blue-600">
              {formatRupiah(order.totalPrice)}
            </span>
          </div>
        </div>

        {/* 3 Kolom Info: Pelanggan, Produk, Pengiriman */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Info Customer */}
          <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-blue-600" />
              Data Pelanggan
            </span>
            <p className="font-bold text-slate-900 text-sm">{order.user.name}</p>
            <p className="text-slate-600 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {order.user.email}
            </p>
            <p className="text-slate-600 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {order.user.phone || "-"}
            </p>
          </div>

          {/* Info Produk */}
          <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              Spesifikasi Produk
            </span>
            <p className="font-bold text-slate-900 text-sm">{order.product.name}</p>
            <p className="text-slate-600">
              Bahan: {order.material ? order.material.name : "Standar"}
            </p>
            <p className="text-slate-600">
              {order.width && order.height ? `Dimensi: ${order.width} x ${order.height} m • ` : ""}
              Jumlah: {order.quantity} {order.product.unit}
            </p>
            {order.finishings.length > 0 && (
              <p className="text-[11px] text-slate-500">
                Finishing: {order.finishings.map((f: any) => f.finishing.name).join(", ")}
              </p>
            )}
          </div>

          {/* Info Pengiriman */}
          <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1">
              {order.pickupMethod === "DELIVERY" ? (
                <Truck className="w-3.5 h-3.5 text-blue-600" />
              ) : (
                <Store className="w-3.5 h-3.5 text-blue-600" />
              )}
              Metode Penyerahan
            </span>
            <p className="font-bold text-slate-900 text-sm">
              {order.pickupMethod === "DELIVERY" ? "Kirim ke Alamat" : "Ambil di Toko"}
            </p>
            {order.address && (
              <p className="text-slate-600 leading-relaxed">{order.address}</p>
            )}
          </div>
        </div>

        {/* File Desain & Pembayaran Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* File Desain */}
          <div className="p-4 border border-slate-200 rounded-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              File Desain Cetak
            </span>
            {order.designFileUrl ? (
              <div className="flex items-center justify-between p-3 bg-blue-50/60 rounded-xl text-xs">
                <span className="font-semibold text-slate-800 truncate max-w-xs">
                  {order.designFileUrl.split("/").pop()}
                </span>
                <a
                  href={order.designFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold flex items-center gap-1"
                >
                  <span>Buka File</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">File desain belum diunggah</p>
            )}
            {order.designNotes && (
              <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl">
                Catatan Desain: "{order.designNotes}"
              </p>
            )}
          </div>

          {/* Bukti Pembayaran */}
          <div className="p-4 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Bukti Pembayaran ({order.paymentMethod || "Belum Bayar"})
              </span>
              {order.status === "PENDING_PAYMENT" && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus("PAID", "Pembayaran diverifikasi admin")}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px]"
                >
                  Verifikasi Lunas
                </button>
              )}
            </div>

            {order.paymentProofUrl ? (
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs">
                <span className="font-semibold text-slate-800 truncate max-w-xs">
                  {order.paymentProofUrl.split("/").pop()}
                </span>
                <a
                  href={order.paymentProofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-semibold flex items-center gap-1"
                >
                  <span>Lihat Bukti</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Bukti transfer belum diunggah</p>
            )}
          </div>
        </div>

        {/* Panel Update Status & Pengiriman */}
        <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-4">
          <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Perbarui Status & Pengiriman Pesanan</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 mb-1.5 block font-semibold">Ubah Status Ke:</span>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ALL_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {order.pickupMethod === "DELIVERY" && (
              <>
                <div>
                  <span className="text-slate-400 mb-1.5 block font-semibold">Nama Kurir:</span>
                  <input
                    type="text"
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    placeholder="Contoh: JNE / SiCepat / Kurir Internal"
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <span className="text-slate-400 mb-1.5 block font-semibold">Nomor Resi:</span>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Contoh: JNE88291024"
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <span className="text-slate-400 mb-1.5 block text-xs font-semibold">
              Catatan Log Perubahan:
            </span>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Paket sudah diserahkan ke kurir JNE..."
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleUpdateStatus()}
            className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>Simpan Perubahan Status</span>
            )}
          </button>
        </div>

        {/* Tabel Riwayat Status Log */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Riwayat Status Pesanan ({order.statusHistory.length})
          </h3>
          <div className="divide-y divide-slate-100 text-xs">
            {order.statusHistory.map((h: any) => (
              <div key={h.id} className="py-2.5 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <OrderStatusBadge status={h.status} size="sm" />
                    <span className="text-slate-400 font-medium">oleh {h.changedBy}</span>
                  </div>
                  {h.notes && <p className="text-slate-600 mt-1">{h.notes}</p>}
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">
                  {formatDateTime(h.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
