import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatRupiah, formatDate } from "@/lib/utils";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { ShoppingBag, Search, Clock, RefreshCw, Upload, CreditCard } from "lucide-react";

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
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-slate-900 sm:text-4xl">
            Pesanan saya
        </h1>
          <p className="text-sm text-slate-500 mt-1">
            Lihat status, detail, dan tindakan untuk setiap pesanan.
          </p>
        </div>
        <span className="text-xs text-slate-500">{orders.length} pesanan ditampilkan</span>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-3">
        {/* Tabs Status */}
        <div className="flex w-full gap-5 overflow-x-auto border-b border-stone-200">
          {filterTabs.map((tab) => (
            <Link
              key={tab.value}
              href={`/orders?status=${tab.value}${searchQuery ? `&search=${searchQuery}` : ""}`}
              aria-current={statusFilter === tab.value ? "page" : undefined}
              className={`shrink-0 border-b-2 px-0.5 pb-3 text-xs font-semibold transition ${
                statusFilter === tab.value
                  ? "border-rose-700 text-rose-800"
                  : "border-transparent text-slate-500 hover:border-stone-400 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Search */}
        <form method="GET" action="/orders" className="relative w-full sm:max-w-sm">
          <input type="hidden" name="status" value={statusFilter} />
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="search"
            defaultValue={searchQuery}
            placeholder="Cari no. pesanan..."
            className="w-full rounded-md border border-stone-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-600/20"
          />
        </form>
      </div>

      {/* List Orders */}
      {orders.length === 0 ? (
        <div className="border-y border-stone-200 py-10 text-center sm:py-14">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-stone-100 text-slate-500">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <p className="text-base font-semibold text-slate-700">
            Tidak ada pesanan ditemukan
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Belum ada pesanan yang sesuai dengan filter atau kata kunci saat ini.
          </p>
          <Link
            href="/katalog"
            className="mt-4 inline-block rounded-md bg-rose-700 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-800"
          >
            Mulai Pesan Sekarang
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-stone-200 border-y border-stone-200">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
            >
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-sm text-slate-900 sm:text-base">
                    {order.orderNumber}
                  </span>
                  <OrderStatusBadge status={order.status} size="sm" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 sm:text-base">
                  {order.product.name}
                  {order.material ? ` • ${order.material.name}` : ""}
                </h3>
                <p className="text-xs leading-relaxed text-slate-500">
                  {order.width && order.height ? `${order.width}x${order.height}m • ` : ""}
                  Jumlah: {order.quantity} {order.product.unit} • Dibuat pada {formatDate(order.createdAt)}
                </p>
              </div>

              <div className="flex flex-col gap-3 border-t border-stone-200 pt-3 sm:flex-row sm:items-center sm:justify-end sm:gap-6 sm:border-0 sm:pt-0">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Total Harga</span>
                  <span className="text-base font-bold text-slate-900">
                    {formatRupiah(order.totalPrice)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Action jika pending payment */}
                  {order.status === "PENDING_PAYMENT" && (
                    <Link
                      href={`/checkout/${order.id}`}
                      className="px-3.5 py-2 rounded-md bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Bayar</span>
                    </Link>
                  )}

                  {/* Action jika file desain belum diunggah */}
                  {!order.designFileUrl && (
                    <Link
                      href={`/order/${order.id}/upload`}
                      className="px-3 py-2 rounded-md bg-rose-50 text-rose-800 hover:bg-rose-100 text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Unggah Desain</span>
                    </Link>
                  )}

                  {/* Tombol Tracking */}
                  <Link
                    href={`/orders/${order.id}/tracking`}
                    className="px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Tracking</span>
                  </Link>

                  {/* Tombol Repeat Order */}
                  <Link
                    href={`/order/${order.productId}?repeatOrderId=${order.id}`}
                    title="Pesan Lagi dengan konfigurasi yang sama"
                    className="p-2 rounded-md border border-stone-300 text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition"
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
