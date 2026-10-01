import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { formatRupiah, formatDate } from "@/lib/utils";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { ShoppingBag, Clock, CheckCircle2, ArrowRight, Printer, Sparkles, RefreshCw } from "lucide-react";

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

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            Portal Pelanggan
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-3">
            Halo, {session.user.name}! 👋
          </h1>
          <p className="text-sm text-blue-100 mt-1 max-w-xl">
            Pantau status proses produksi pesanan cetak Anda atau buat pesanan custom baru dengan estimasi harga real-time.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/katalog"
            className="px-5 py-3 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm shadow-md transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Pesan Cetak Baru</span>
          </Link>
          <Link
            href="/chat"
            className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-sm border border-white/20 transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Assistant</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Pesanan</span>
            <p className="text-2xl font-bold text-slate-900">{totalOrders}</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Pesanan Berjalan</span>
            <p className="text-2xl font-bold text-amber-600">{activeOrders}</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Pesanan Selesai</span>
            <p className="text-2xl font-bold text-emerald-600">{completedOrders}</p>
          </div>
        </div>
      </div>

      {/* Riwayat Pesanan Terbaru */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
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
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-medium"
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
