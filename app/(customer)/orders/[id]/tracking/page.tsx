import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { formatRupiah, formatDateTime } from "@/lib/utils";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import OrderReviewCard from "@/components/OrderReviewCard";
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
      {/* Back & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Riwayat Pesanan</span>
        </Link>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} size="lg" />
          <Link
            href={`/order/${order.productId}?repeatOrderId=${order.id}`}
            className="px-3 py-1.5 rounded-xl border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Pesan Lagi</span>
          </Link>
        </div>
      </div>

      {/* Timeline Tracking */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-outline-variant shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Live Order Tracking
          </span>
          <h1 className="text-2xl font-black text-on-surface mt-1">
            Status Pesanan #{order.orderNumber}
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Pantau perkembangan pengerjaan secara real-time dari meja operator cetak.
          </p>
        </div>

        {/* Stepper */}
        <div className="relative pt-4 pb-2">
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
            {timelineStages.map((stage) => {
              const Icon = stage.icon;
              const active = stage.isPassed || stage.isCurrent;
              const isCurrentHighlight = stage.isCurrent;
              return (
                <div
                  key={stage.key}
                  className={`flex flex-col items-center text-center p-3 rounded-2xl transition ${
                    isCurrentHighlight
                      ? "bg-primary-container/40 border border-primary/30 shadow-sm ring-2 ring-primary/20"
                      : "bg-surface-container-low/50"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition ${
                      active
                        ? "bg-primary text-on-primary shadow-md shadow-primary/30"
                        : "bg-surface-container text-outline"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-xs font-bold leading-tight ${
                      active ? "text-on-surface" : "text-outline"
                    }`}
                  >
                    {stage.label}
                  </span>
                  {isCurrentHighlight && (
                    <span className="mt-1 text-[10px] font-bold text-primary uppercase tracking-wider">
                      â— Sedang Berjalan
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Log */}
        <div className="pt-6 border-t border-surface-container-high space-y-3">
          <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-on-surface-variant" />
            Log Aktivitas &amp; Riwayat Perubahan Status
          </h3>
          <div className="divide-y divide-surface-container-low">
            {order.statusHistory.map((history) => (
              <div key={history.id} className="py-3 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <OrderStatusBadge status={history.status} size="sm" />
                    <span className="text-xs text-on-surface-variant">
                      oleh <span className="font-semibold text-on-surface">{history.changedBy}</span>
                    </span>
                  </div>
                  {history.notes && (
                    <p className="text-xs text-on-surface-variant mt-1">{history.notes}</p>
                  )}
                </div>
                <span className="text-[11px] text-outline shrink-0">
                  {formatDateTime(history.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Card (completed orders) */}
      {order.status === "COMPLETED" && (
        <OrderReviewCard
          orderId={order.id}
          orderNumber={order.orderNumber}
          productName={order.product.name}
          orderStatus={order.status}
        />
      )}

      {/* Product Detail & Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
            Rincian Produk
          </h3>
          <div className="space-y-2 text-xs text-on-surface-variant">
            <div className="flex justify-between py-1 border-b border-surface-container-low">
              <span className="text-outline">Nama Produk:</span>
              <span className="font-semibold text-on-surface">{order.product.name}</span>
            </div>
            {order.material && (
              <div className="flex justify-between py-1 border-b border-surface-container-low">
                <span className="text-outline">Material / Bahan:</span>
                <span className="font-medium text-on-surface">{order.material.name}</span>
              </div>
            )}
            {order.width && order.height && (
              <div className="flex justify-between py-1 border-b border-surface-container-low">
                <span className="text-outline">Dimensi Ukuran:</span>
                <span className="font-medium text-on-surface">
                  {order.width} x {order.height} meter ({order.width * order.height} mÂ²)
                </span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-surface-container-low">
              <span className="text-outline">Jumlah:</span>
              <span className="font-semibold text-on-surface">
                {order.quantity} {order.product.unit}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-container-low">
              <span className="text-outline">Total Harga:</span>
              <span className="font-bold text-primary text-sm">
                {formatRupiah(order.totalPrice)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2 flex items-center gap-1.5">
              {order.pickupMethod === "DELIVERY" ? (
                <MapPin className="w-4 h-4 text-primary" />
              ) : (
                <Store className="w-4 h-4 text-primary" />
              )}
              Metode Pengambilan
            </h3>
            <p className="text-xs text-on-surface-variant">
              {order.pickupMethod === "DELIVERY" ? (
                <span>Kurir Pengiriman: {order.address || "-"}</span>
              ) : (
                <span>Ambil di Tempat (Meja Kasir Workshop)</span>
              )}
            </p>
          </div>

          <div className="pt-3 border-t border-surface-container-low">
            <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-primary" />
              File Desain
            </h3>
            {order.designFileUrl ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-outline-variant text-xs">
                <span className="truncate max-w-[200px] text-on-surface-variant font-medium">
                  {order.designFileUrl.split("/").pop()}
                </span>
                <a
                  href={order.designFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary font-semibold hover:underline"
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
