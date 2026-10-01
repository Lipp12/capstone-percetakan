import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatRupiah, formatDate } from "@/lib/utils";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { ShoppingBag, Search, Clock, ArrowRight, RefreshCw, Upload, CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: {
    status?: string;
    search?: string;
  };
}

export default async function CustomerOrdersPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;
  const statusFilter = searchParams.status || "ALL";
  const searchQuery = searchParams.search || "";

  const where: any = { userId };
  if (statusFilter !== "ALL") {
    where.status = statusFilter;
  }
  if (searchQuery) {
    where.OR = [
      { orderNumber: { contains: searchQuery } },
      { product: { name: { contains: searchQuery } } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      product: true,
      material: true,
    },
  });

  const filterTabs = [
    { label: "Semua", value: "ALL" },
    { label: "Menunggu Bayar", value: "PENDING_PAYMENT" },
    { label: "Cek Desain", value: "DESIGN_CHECKING" },
    { label: "Dalam Produksi", value: "IN_PRODUCTION" },
    { label: "Siap Diambil", value: "READY" },
    { label: "Selesai", value: "COMPLETED" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Riwayat Pesanan Saya
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Pantau semua transaksi pemesanan produk cetak Anda di satu tempat.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Tabs Status */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {filterTabs.map((tab) => (
            <Link
              key={tab.value}
              href={`/orders?status=${tab.value}${searchQuery ? `&search=${searchQuery}` : ""}`}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === tab.value
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Search */}
        <form method="GET" action="/orders" className="relative w-full sm:w-64">
          <input type="hidden" name="status" value={statusFilter} />
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="search"
            defaultValue={searchQuery}
            placeholder="Cari no. pesanan..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </form>
      </div>

      {/* List Orders */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <p className="text-base font-semibold text-slate-700">
            Tidak ada pesanan ditemukan
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Belum ada pesanan yang sesuai dengan filter atau kata kunci saat ini.
          </p>
          <Link
            href="/katalog"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
          >
            Mulai Pesan Sekarang
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-base text-slate-900">
                    {order.orderNumber}
                  </span>
                  <OrderStatusBadge status={order.status} size="sm" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">
                  {order.product.name}
                  {order.material ? ` • ${order.material.name}` : ""}
                </h3>
                <p className="text-xs text-slate-500">
                  {order.width && order.height ? `${order.width}x${order.height}m • ` : ""}
                  Jumlah: {order.quantity} {order.product.unit} • Dibuat pada {formatDate(order.createdAt)}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6 justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Total Harga</span>
                  <span className="text-base font-black text-slate-900">
                    {formatRupiah(order.totalPrice)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Action jika pending payment */}
                  {order.status === "PENDING_PAYMENT" && (
                    <Link
                      href={`/checkout/${order.id}`}
                      className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Bayar</span>
                    </Link>
                  )}

                  {/* Action jika file desain belum diunggah */}
                  {!order.designFileUrl && (
                    <Link
                      href={`/order/${order.id}/upload`}
                      className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Unggah Desain</span>
                    </Link>
                  )}

                  {/* Tombol Tracking */}
                  <Link
                    href={`/orders/${order.id}/tracking`}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Tracking</span>
                  </Link>

                  {/* Tombol Repeat Order */}
                  <Link
                    href={`/order/${order.productId}?repeatOrderId=${order.id}`}
                    title="Pesan Lagi dengan konfigurasi yang sama"
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition"
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
  );
}
