import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { formatRupiah, formatDate } from "@/lib/utils";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { ShoppingBag, Clock, CheckCircle2, ArrowRight, Printer, Sparkles, RefreshCw, AlertTriangle, Upload } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  // Ambil pesanan milik user
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      product: true,
      material: true,
    },
  });

  const totalOrders = orders.length;
  const activeOrders = orders.filter(
    (o) => !["COMPLETED", "CANCELLED"].includes(o.status)
  ).length;
  const completedOrders = orders.filter((o) => o.status === "COMPLETED").length;
  const rejectedDesignOrders = orders.filter(
    (o) => o.status === "DESIGN_REJECTED"
  );

  // Alasan penolakan terbaru per pesanan (dari statusHistory)
  const rejectionReasons = await prisma.orderStatusHistory.findMany({
    where: {
      orderId: { in: rejectedDesignOrders.map((o) => o.id) },
      status: "DESIGN_REJECTED",
    },
    orderBy: { createdAt: "desc" },
    select: { orderId: true, notes: true, createdAt: true },
  });

  const reasonByOrder = new Map<string, string>();
  for (const r of rejectionReasons) {
    if (!reasonByOrder.has(r.orderId)) {
      reasonByOrder.set(r.orderId, r.notes || "");
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-5 rounded-md border border-stone-200 border-l-4 border-l-rose-700 bg-[#f2ecdf] p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-7">
        <div className="min-w-0">
          <h1 className="font-serif text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
            Halo, {session.user.name}!
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
            Pantau status proses produksi pesanan cetak Anda atau buat pesanan custom baru dengan estimasi harga real-time.
          </p>
          {rejectedDesignOrders.length > 0 && (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800">
              <AlertTriangle className="w-3.5 h-3.5" />
              {rejectedDesignOrders.length} desain ditolak, perlu diunggah ulang
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:w-48 sm:shrink-0">
          <Link
            href="/katalog"
            className="flex items-center justify-center gap-2 rounded-md bg-rose-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-800"
          >
            <Printer className="w-4 h-4" />
            <span>Pesan Cetak Baru</span>
          </Link>
          <Link
            href="/chat"
            className="flex items-center justify-center gap-2 rounded-md border border-stone-400 bg-transparent px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-white/70"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Assistant</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="flex flex-col gap-2 rounded-md border border-stone-200 bg-white p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
          <div className="w-fit rounded-md bg-rose-50 p-2 text-rose-700 sm:p-3">
            <ShoppingBag className="h-4 w-4 sm:h-6 sm:w-6" />
          </div>
          <div>
            <span className="text-[10px] font-medium text-slate-500 sm:text-xs">Total Pesanan</span>
            <p className="text-xl font-bold text-slate-900 sm:text-2xl">{totalOrders}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-md border border-stone-200 bg-white p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
          <div className="w-fit rounded-md bg-amber-50 p-2 text-amber-700 sm:p-3">
            <Clock className="h-4 w-4 sm:h-6 sm:w-6" />
          </div>
          <div>
            <span className="text-[10px] font-medium text-slate-500 sm:text-xs">Pesanan Berjalan</span>
            <p className="text-xl font-bold text-amber-700 sm:text-2xl">{activeOrders}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-md border border-stone-200 bg-white p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
          <div className="w-fit rounded-md bg-emerald-50 p-2 text-emerald-700 sm:p-3">
            <CheckCircle2 className="h-4 w-4 sm:h-6 sm:w-6" />
          </div>
          <div>
            <span className="text-[10px] font-medium text-slate-500 sm:text-xs">Pesanan Selesai</span>
            <p className="text-xl font-bold text-emerald-700 sm:text-2xl">{completedOrders}</p>
          </div>
        </div>
      </div>

      {/* Notifikasi Desain Ditolak: CTA Unggah Ulang */}
      {rejectedDesignOrders.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-md p-4 sm:p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-rose-100 text-rose-700 rounded-md shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-rose-900">
                Desain perlu diperbaiki
              </h2>
              <p className="text-xs text-rose-700 mt-0.5">
                {rejectedDesignOrders.length} pesanan ditolak dan menunggu revisi
                desain Anda. Silakan unggah file desain terbaru.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {rejectedDesignOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 bg-white rounded-md border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {order.orderNumber}
                    </span>
                    <OrderStatusBadge status={order.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-600 font-medium truncate">
                    {order.product.name}
                    {order.material ? ` • ${order.material.name}` : ""}
                  </p>
                  {reasonByOrder.get(order.id) && (
                    <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-2 py-1">
                      Catatan admin:{" "}
                      {reasonByOrder.get(order.id)?.replace(/^Desain ditolak:\s*/i, "")}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/order/${order.id}/upload`}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Unggah Desain Baru</span>
                  </Link>
                  <Link
                    href={`/orders/${order.id}/tracking`}
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    Detail
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Riwayat Pesanan Terbaru */}
      <div className="bg-white rounded-md border border-stone-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Pesanan Terkini
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Daftar transaksi dan progress pengerjaan pesanan Anda
            </p>
          </div>
          <Link
            href="/orders"
            className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1"
          >
            <span>Semua Pesanan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Belum ada pesanan</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Silakan kunjungi katalog untuk memilih produk dan bahan yang Anda butuhkan.
            </p>
            <Link
              href="/katalog"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-rose-700 text-white rounded-md text-xs font-medium"
            >
              Buka Katalog
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {order.orderNumber}
                    </span>
                    <OrderStatusBadge status={order.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {order.product.name}{" "}
                    {order.material ? `• Bahan: ${order.material.name}` : ""}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Jumlah: {order.quantity} {order.product.unit} • Dibuat pada {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-4 justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">Total Harga</span>
                    <span className="text-sm font-bold text-slate-900">
                      {formatRupiah(order.totalPrice)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Link ke tracking */}
                    <Link
                      href={`/orders/${order.id}/tracking`}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                    >
                      Tracking
                    </Link>

                    {/* Tombol Repeat Order */}
                    <Link
                      href={`/order/${order.productId}?repeatOrderId=${order.id}`}
                      title="Pesan Lagi dengan spek yang sama"
                      className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
