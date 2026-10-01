import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { formatRupiah, formatDateTime, formatDate } from "@/lib/utils";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import Link from "next/link";
import {
  CreditCard,
  FileCheck,
  Printer,
  Scissors,
  PackageCheck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  FileText,
  MapPin,
  Store,
  RefreshCw,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: {
    id: string;
  };
}

export default async function OrderTrackingPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/login?callbackUrl=/orders/${params.id}/tracking`);
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      product: true,
      material: true,
      finishings: { include: { finishing: true } },
      statusHistory: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) {
    notFound();
  }

  // Definisi tahapan timeline produksi
  const timelineStages = [
    {
      key: "PAYMENT",
      label: "Pembayaran",
      icon: CreditCard,
      isPassed: [
        "PAID",
        "DESIGN_CHECKING",
        "DESIGN_REJECTED",
        "DESIGN_APPROVED",
        "IN_PRODUCTION",
        "FINISHING",
        "READY",
        "SHIPPING",
        "COMPLETED",
      ].includes(order.status),
      isCurrent: order.status === "PENDING_PAYMENT",
    },
    {
      key: "DESIGN",
      label: "Pengecekan Desain",
      icon: FileCheck,
      isPassed: [
        "DESIGN_APPROVED",
        "IN_PRODUCTION",
        "FINISHING",
        "READY",
        "SHIPPING",
        "COMPLETED",
      ].includes(order.status),
      isCurrent:
        order.status === "DESIGN_CHECKING" || order.status === "DESIGN_REJECTED",
    },
    {
      key: "PRINTING",
      label: "Proses Cetak",
      icon: Printer,
      isPassed: [
        "IN_PRODUCTION",
        "FINISHING",
        "READY",
        "SHIPPING",
        "COMPLETED",
      ].includes(order.status),
      isCurrent:
        order.status === "DESIGN_APPROVED" || order.status === "IN_PRODUCTION",
    },
    {
      key: "FINISHING",
      label: "Finishing & Cutting",
      icon: Scissors,
      isPassed: ["READY", "SHIPPING", "COMPLETED"].includes(order.status),
      isCurrent: order.status === "FINISHING",
    },
    {
      key: "READY",
      label: order.pickupMethod === "DELIVERY" ? "Pengiriman" : "Siap Diambil",
      icon: PackageCheck,
      isPassed: ["COMPLETED"].includes(order.status),
      isCurrent: order.status === "READY" || order.status === "SHIPPING",
    },
    {
      key: "COMPLETED",
      label: "Selesai",
      icon: CheckCircle2,
      isPassed: order.status === "COMPLETED",
      isCurrent: order.status === "COMPLETED",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Tombol Kembali & Info Order */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Riwayat Pesanan</span>
        </Link>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} size="lg" />
          <Link
            href={`/order/${order.productId}?repeatOrderId=${order.id}`}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Pesan Lagi</span>
          </Link>
        </div>
      </div>

      {/* Visual Timeline Tracking */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Live Order Tracking
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Status Pesanan #{order.orderNumber}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau perkembangan pengerjaan secara real-time dari meja operator cetak.
          </p>
        </div>

        {/* Stepper Progress Bar */}
        <div className="relative pt-4 pb-2">
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
            {timelineStages.map((stage, idx) => {
              const Icon = stage.icon;
              const active = stage.isPassed || stage.isCurrent;
              const isCurrentHighlight = stage.isCurrent;
              return (
                <div
                  key={stage.key}
                  className={`flex flex-col items-center text-center p-3 rounded-2xl transition ${
                    isCurrentHighlight
                      ? "bg-blue-50/80 border border-blue-200 shadow-sm ring-2 ring-blue-500/20"
                      : "bg-slate-50/50"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition ${
                      active
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                        : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-xs font-bold leading-tight ${
                      active ? "text-slate-900" : "text-slate-400"
                    }`}
                  >
                    {stage.label}
                  </span>
                  {isCurrentHighlight && (
                    <span className="mt-1 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      ● Sedang Berjalan
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Riwayat Status Log */}
        <div className="pt-6 border-t border-slate-100 space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-500" />
            Log Aktivitas & Riwayat Perubahan Status
          </h3>
          <div className="divide-y divide-slate-100">
            {order.statusHistory.map((history) => (
              <div key={history.id} className="py-3 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <OrderStatusBadge status={history.status} size="sm" />
                    <span className="text-xs text-slate-500">
                      oleh <span className="font-semibold text-slate-700">{history.changedBy}</span>
                    </span>
                  </div>
                  {history.notes && (
                    <p className="text-xs text-slate-600 mt-1">{history.notes}</p>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">
                  {formatDateTime(history.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rincian Spesifikasi & File Desain */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Spesifikasi Produk */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Rincian Produk
          </h3>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Nama Produk:</span>
              <span className="font-semibold text-slate-900">{order.product.name}</span>
            </div>
            {order.material && (
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Material / Bahan:</span>
                <span className="font-medium text-slate-800">{order.material.name}</span>
              </div>
            )}
            {order.width && order.height && (
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Dimensi Ukuran:</span>
                <span className="font-medium text-slate-800">
                  {order.width} x {order.height} meter ({order.width * order.height} m²)
                </span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Jumlah:</span>
              <span className="font-semibold text-slate-800">
                {order.quantity} {order.product.unit}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Total Harga:</span>
              <span className="font-bold text-blue-600 text-sm">
                {formatRupiah(order.totalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Pengiriman & File Desain */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              {order.pickupMethod === "DELIVERY" ? (
                <MapPin className="w-4 h-4 text-blue-600" />
              ) : (
                <Store className="w-4 h-4 text-blue-600" />
              )}
              Metode Pengambilan
            </h3>
            <p className="text-xs text-slate-700">
              {order.pickupMethod === "DELIVERY" ? (
                <span>Kurir Pengiriman: {order.address || "-"}</span>
              ) : (
                <span>Ambil di Tempat (Meja Kasir Workshop)</span>
              )}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              File Desain
            </h3>
            {order.designFileUrl ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="truncate max-w-[200px] text-slate-700 font-medium">
                  {order.designFileUrl.split("/").pop()}
                </span>
                <a
                  href={order.designFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Buka File
                </a>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <span>File belum diunggah</span>
                <Link
                  href={`/order/${order.id}/upload`}
                  className="px-2.5 py-1 bg-amber-600 text-white rounded-lg font-semibold text-[11px]"
                >
                  Unggah Sekarang
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
