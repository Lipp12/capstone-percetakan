import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { formatRupiah } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Search, Package, Clock, CheckCircle2, AlertCircle, XCircle, RefreshCw, FileCheck, Printer, Scissors, PackageCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return (
      <div className="text-center py-12">
        <p className="text-on-surface-variant">Silakan login untuk melihat pesanan.</p>
        <Link href="/login" className="text-primary font-semibold hover:underline mt-2 inline-block">
          Login
        </Link>
      </div>
    );
  }

  const userId = (session.user as any)?.id;
  const role = (session.user as any)?.role;
  const isAdmin = role === "ADMIN" || role === "OPERATOR";

  const orders = await prisma.order.findMany({
    where: isAdmin ? {} : { userId },
    orderBy: { createdAt: "desc" },
    include: {
      product: true,
      material: true,
      finishings: { include: { finishing: true } },
    },
  });

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    PENDING_PAYMENT: { label: "Menunggu Pembayaran", color: "bg-amber-100 text-amber-800 border-amber-300", icon: Clock },
    PAID: { label: "Dibayar", color: "bg-blue-100 text-blue-800 border-blue-300", icon: CheckCircle2 },
    DESIGN_CHECKING: { label: "Cek Desain", color: "bg-sky-100 text-sky-800 border-sky-300", icon: FileCheck },
    DESIGN_REJECTED: { label: "Perlu Revisi", color: "bg-rose-100 text-rose-800 border-rose-300", icon: AlertCircle },
    DESIGN_APPROVED: { label: "Desain Disetujui", color: "bg-emerald-100 text-emerald-800 border-emerald-300", icon: CheckCircle2 },
    IN_PRODUCTION: { label: "Proses Cetak", color: "bg-indigo-100 text-indigo-800 border-indigo-300", icon: Printer },
    FINISHING: { label: "Finishing", color: "bg-purple-100 text-purple-800 border-purple-300", icon: Scissors },
    READY: { label: "Siap Diambil", color: "bg-teal-100 text-teal-800 border-teal-300", icon: PackageCheck },
    SHIPPING: { label: "Dikirim", color: "bg-cyan-100 text-cyan-800 border-cyan-300", icon: Package },
    COMPLETED: { label: "Selesai", color: "bg-emerald-100 text-emerald-800 border-emerald-300", icon: CheckCircle2 },
    CANCELLED: { label: "Dibatalkan", color: "bg-stone-100 text-stone-600 border-stone-300", icon: XCircle },
  };

  const filterTabs = [
    { id: "all", label: "Semua", count: orders.length },
    { id: "pending", label: "Menunggu Pembayaran", count: orders.filter((o) => o.status === "PENDING_PAYMENT").length },
    { id: "processing", label: "Diproses", count: orders.filter((o) => ["PAID", "DESIGN_CHECKING", "DESIGN_APPROVED", "IN_PRODUCTION", "FINISHING"].includes(o.status)).length },
    { id: "revision", label: "Perlu Revisi", count: orders.filter((o) => o.status === "DESIGN_REJECTED").length },
    { id: "ready", label: "Siap Diambil", count: orders.filter((o) => o.status === "READY" || o.status === "SHIPPING").length },
    { id: "completed", label: "Selesai", count: orders.filter((o) => o.status === "COMPLETED").length },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
            Pesanan Saya
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Pantau seluruh progres kurasi &amp; produksi pesanan cetakmu di sini secara transparan.
          </p>
        </div>
        <Link
          href="/katalog"
          className="inline-flex items-center gap-2 bg-primary text-on-primary font-label-md text-label-md px-5 py-2.5 rounded-full shadow-[2px_2px_0px_#2D2926] hover:bg-primary/90 transition"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Pesan Baru</span>
        </Link>
      </div>

      {/* Alert banner for action-needed orders */}
      {orders.some((o) => o.status === "DESIGN_REJECTED" || o.status === "PENDING_PAYMENT") && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-lg">warning</span>
              </div>
              <div>
                <h2 className="font-heading text-base font-bold text-on-surface">
                  Pesanan perlu tindakanmu
                </h2>
                <p className="text-xs text-amber-800 mt-0.5">
                  Selesaikan tindakan berikut agar proses cetak &amp; kurasi warna tidak tertunda.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {orders
                .filter((o) => o.status === "DESIGN_REJECTED")
                .slice(0, 1)
                .map((o) => (
                  <Link
                    key={o.id}
                    href={`/order/${o.productId}?repeatOrderId=${o.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100 transition shadow-xs group"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span>Desain perlu revisi: #{o.orderNumber}</span>
                    <ArrowLeft className="w-3 h-3 rotate-180 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ))}
              {orders
                .filter((o) => o.status === "PENDING_PAYMENT")
                .slice(0, 1)
                .map((o) => (
                  <Link
                    key={o.id}
                    href={`/checkout/${o.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition shadow-xs group"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Menunggu pembayaran: #{o.orderNumber}</span>
                    <ArrowLeft className="w-3 h-3 rotate-180 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-surface-container-low px-5 py-3 rounded-2xl">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {filterTabs.map((tab, idx) => (
            <button
              key={tab.id}
              type="button"
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                idx === 0
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container border border-outline-variant"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
        <div className="relative min-w-[280px]">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-outline">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Cari nomor pesanan atau produk..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-2xl text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Order list */}
      <div className="space-y-4">
        {orders.length === 0 && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-12 text-center">
            <Package className="w-12 h-12 text-outline mx-auto mb-3" />
            <p className="text-on-surface-variant text-sm">Belum ada pesanan.</p>
            <Link href="/katalog" className="text-primary font-semibold hover:underline mt-2 inline-block text-sm">
              Mulai belanja
            </Link>
          </div>
        )}

        {orders.map((order) => {
          const cfg = statusConfig[order.status] || {
            label: order.status,
            color: "bg-surface-container text-on-surface-variant border-outline-variant",
            icon: Package,
          };
          const Icon = cfg.icon;
          const isCancelled = order.status === "CANCELLED";
          const isCompleted = order.status === "COMPLETED";
          const isPending = order.status === "PENDING_PAYMENT";
          const isRevision = order.status === "DESIGN_REJECTED";

          return (
            <article
              key={order.id}
              className={`bg-surface-container-lowest border-2 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden ${
                isRevision
                  ? "border-rose-300"
                  : isPending
                  ? "border-amber-300"
                  : isCompleted
                  ? "border-emerald-300"
                  : "border-outline-variant"
              }`}
            >
              <div className="absolute top-0 left-0 bottom-0 w-2 bg-primary" />

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pl-2">
                {/* Product info */}
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#e0f2fe] to-[#bae6fd] flex-shrink-0 flex flex-col items-center justify-center p-3 border border-[#93c5fd] shadow-inner">
                    <span className="material-symbols-outlined text-4xl text-[#0369a1]">inventory_2</span>
                    <span className="text-[9px] font-black uppercase tracking-tight text-[#0369a1] mt-0.5 bg-white/80 px-1.5 rounded">
                      {order.product.unit}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="text-xs font-bold text-primary font-mono bg-primary-container/40 px-2 py-0.5 rounded-md">
                        #{order.orderNumber}
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        â€¢ {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${cfg.color} border`}>
                        {cfg.label}
                      </span>
                    </div>
                    <h3 className="font-heading text-xl font-bold text-on-surface leading-snug">
                      {order.product.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-on-surface-variant">
                      {order.quantity} {order.product.unit}
                      {order.material ? ` Â· ${order.material.name}` : ""}
                      {order.width && order.height ? ` Â· ${order.width}Ã—${order.height}m` : ""}
                    </p>
                    {isRevision && (
                      <div className="mt-2 max-w-lg bg-rose-50 border border-rose-200 rounded-2xl p-3 flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-rose-600 text-sm mt-0.5 shrink-0">error</span>
                        <p className="text-xs text-rose-800 leading-relaxed">
                          <strong className="font-bold text-rose-900">Catatan revisi:</strong>{" "}
                          {order.designNotes || "Desain perlu revisi. Silakan unggah ulang file desain."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status, Price & Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-row items-start sm:items-center justify-between lg:justify-end gap-5 pt-4 lg:pt-0 border-t lg:border-t-0 border-surface-container-low">
                  <div className="flex flex-col lg:items-end">
                    <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold border ${cfg.color}`}>
                      <span className="w-2 h-2 rounded-full bg-current mr-2" />
                      {cfg.label}
                    </span>
                    <span className="font-heading text-2xl font-extrabold text-on-surface mt-2">
                      {formatRupiah(order.totalPrice)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link
                      href={`/orders/${order.id}/tracking`}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-on-primary text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full shadow-sm transition"
                    >
                      <span className="material-symbols-outlined text-xs">route</span>
                      <span>Lacak Pesanan</span>
                    </Link>
                    <Link
                      href={`/orders/${order.id}/invoice`}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full transition"
                    >
                      <span className="material-symbols-outlined text-xs">receipt</span>
                      <span>Invoice</span>
                    </Link>
                    {isRevision && (
                      <Link
                        href={`/order/${order.productId}?repeatOrderId=${order.id}`}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-amber-100 border border-amber-300 text-amber-900 hover:bg-amber-200 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full transition"
                      >
                        <span className="material-symbols-outlined text-xs">upload_file</span>
                        <span>Upload Revisi</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
