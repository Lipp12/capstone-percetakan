"use client";

import { useState } from "react";
import { formatRupiah, formatDateTime } from "@/lib/utils";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  FileText,
  User,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import AdminStatCard from "@/components/AdminStatCard";

interface Props {
  initialOrders: any[];
}

export default function DesignCheckClient({ initialOrders }: Props) {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    initialOrders[0]?.id || ""
  );
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  async function handleAction(action: "APPROVE" | "REJECT") {
    if (!selectedOrder) return;
    if (action === "REJECT" && !notes.trim()) {
      setMessage({
        type: "error",
        text: "Berikan alasan penolakan pada kolom catatan agar pelanggan memahami revisinya.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    const newStatus = action === "APPROVE" ? "DESIGN_APPROVED" : "DESIGN_REJECTED";
    const defaultNote =
      action === "APPROVE"
        ? "File desain ACC dan memenuhi standar cetak, masuk antrean produksi."
        : `Desain ditolak: ${notes}`;

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          notes: notes.trim() || defaultNote,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Gagal memproses validasi" });
        setLoading(false);
        return;
      }

      setMessage({
        type: "success",
        text: `Pesanan ${selectedOrder.orderNumber} berhasil ${
          action === "APPROVE" ? "disetujui (ACC)" : "ditolak"
        }.`,
      });

      // Hapus dari list antrean cek
      const remaining = orders.filter((o) => o.id !== selectedOrder.id);
      setOrders(remaining);
      setSelectedOrderId(remaining[0]?.id || "");
      setNotes("");
    } catch (err) {
      setMessage({ type: "error", text: "Terjadi kesalahan koneksi" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2 border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-surface-container text-brand-800 border-brand-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}

          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Antrean ACC"
          value={orders.length}
          caption="File menunggu pemeriksaan"
          icon={FileCheck}
          tone="rose"
        />
        <AdminStatCard
          label="Cek desain"
          value={orders.filter((order) => order.status === "DESIGN_CHECKING").length}
          caption="Sedang dalam antrean prepress"
          icon={Clock}
          tone="lavender"
        />
        <AdminStatCard
          label="Sudah dibayar"
          value={orders.filter((order) => order.status === "PAID").length}
          caption="Siap divalidasi sebelum cetak"
          icon={CheckCircle2}
          tone="mint"
        />
        <AdminStatCard
          label="Catatan revisi"
          value={orders.filter((order) => order.designNotes).length}
          caption="Ada instruksi dari pelanggan"
          icon={FileText}
          tone="yellow"
        />
      </div>

      {orders.length === 0 ? (
        <div className="bg-surface-container-lowest p-12 rounded-xl shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-on-surface text-base">
            Semua Desain Sudah Divalidasi!
          </h3>
          <p className="text-xs text-outline mt-1 max-w-sm mx-auto">
            Tidak ada pesanan dengan status 'Cek Desain' saat ini. Semua file siap masuk ke antrean produksi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List Antrean di Kiri */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-outline block px-1">
              Antrean Menunggu ACC ({orders.length})
            </span>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {orders.map((ord) => {
                const isSelected = ord.id === selectedOrderId;
                return (
                  <button
                    type="button"
                    key={ord.id}
                    onClick={() => {
                      setSelectedOrderId(ord.id);
                      setMessage(null);
                      setNotes("");
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition ${
                      isSelected
                        ? "bg-surface-container-low border-primary shadow-sm ring-1 ring-primary/20"
                        : "bg-surface-container-lowest border-outline-variant/60 hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-on-surface">
                        {ord.orderNumber}
                      </span>
                      <OrderStatusBadge status={ord.status} size="sm" />
                    </div>
                    <p className="text-xs font-semibold text-on-surface-variant truncate">
                      {ord.product.name}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-outline mt-2">
                      <span>{ord.user.name}</span>
                      <span>{formatRupiah(ord.totalPrice)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail & Aksi di Kanan */}
          <div className="lg:col-span-8 bg-surface-container-lowest p-6 sm:p-8 rounded-xl shadow-sm space-y-6">
            {selectedOrder ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-surface-container">
                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                      Detail Pemeriksaan
                    </span>
                    <h2 className="text-xl font-bold text-on-surface">
                      {selectedOrder.orderNumber}
                    </h2>
                  </div>
                  <OrderStatusBadge status={selectedOrder.status} />
                </div>

                {/* Info Spesifikasi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-surface-container-low space-y-1">
                    <span className="text-outline font-medium block">Pelanggan:</span>
                    <p className="font-bold text-on-surface">{selectedOrder.user.name}</p>
                    <p className="text-outline">{selectedOrder.user.phone || selectedOrder.user.email}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-surface-container-low space-y-1">
                    <span className="text-outline font-medium block">Spesifikasi Cetak:</span>
                    <p className="font-bold text-on-surface">{selectedOrder.product.name}</p>
                    <p className="text-outline">
                      {selectedOrder.material ? `Bahan: ${selectedOrder.material.name} \u2022 ` : ""}
                      {selectedOrder.width && selectedOrder.height
                        ? `${selectedOrder.width}x${selectedOrder.height}m \u2022 `
                        : ""}
                      Qty: {selectedOrder.quantity}
                    </p>
                  </div>
                </div>

                {/* File Desain & Catatan Pelanggan */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">
                    File Desain yang Diunggah
                  </span>
                  {selectedOrder.designFileUrl ? (
                    <div className="p-4 rounded-2xl border border-brand-200 bg-surface-container/50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary-container text-white rounded-xl">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-on-surface truncate max-w-xs">
                            {selectedOrder.designFileUrl.split("/").pop()}
                          </p>
                          <span className="text-[11px] text-outline">
                            Klik untuk membuka atau mendownload file asli
                          </span>
                        </div>
                      </div>
                      <a
                        href={selectedOrder.designFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 bg-white text-primary border border-brand-200 hover:bg-surface-container text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                      >
                        <span>Buka File</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                      File desain belum diunggah oleh pelanggan.
                    </div>
                  )}

                  {selectedOrder.designNotes && (
                    <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant text-xs">
                      <span className="font-semibold text-on-surface-variant block mb-0.5">
                        Catatan dari Pelanggan:
                      </span>
                      <p className="text-on-surface-variant italic">"{selectedOrder.designNotes}"</p>
                    </div>
                  )}
                </div>

                {/* Input Catatan Admin */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">
                    Catatan Pemeriksa / Instruksi Revisi
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Resolusi oke, siap cetak Roland. (Atau: Resolusi pecah, mohon kirim file vector / PDF 300 DPI)."
                    className="w-full p-3 text-xs border border-ink-300 rounded-xl focus:ring-2 focus:ring-brand-600 outline-none"
                  />
                </div>

                {/* Tombol Aksi: Approve / Reject */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleAction("APPROVE")}
                    className="w-full sm:flex-1 py-3 px-4 bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>ACC Desain (Lolos Cetak)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleAction("REJECT")}
                    className="w-full sm:w-auto py-3 px-5 bg-error-container/50 text-on-error-container hover:bg-error-container border border-error-container font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Tolak Desain (Minta Revisi)</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-outline text-xs">
                Pilih pesanan dari antrean di sebelah kiri untuk memeriksa file.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
