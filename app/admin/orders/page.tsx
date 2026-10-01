import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatRupiah, formatDate } from "@/lib/utils";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { Search, ShoppingBag, Eye, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: {
    status?: string;
    search?: string;
  };
}

export default async function AdminOrdersListPage({ searchParams }: Props) {
  const statusFilter = searchParams.status || "ALL";
  const searchQuery = searchParams.search || "";

  const where: any = {};
  if (statusFilter !== "ALL") {
    where.status = statusFilter;
  }
  if (searchQuery) {
    where.OR = [
      { orderNumber: { contains: searchQuery } },
      { user: { name: { contains: searchQuery } } },
      { product: { name: { contains: searchQuery } } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, phone: true } },
      product: true,
      material: true,
    },
  });

  const statuses = [
    { label: "Semua", value: "ALL" },
    { label: "Menunggu Bayar", value: "PENDING_PAYMENT" },
    { label: "Sudah Bayar", value: "PAID" },
    { label: "Cek Desain", value: "DESIGN_CHECKING" },
    { label: "ACC Desain", value: "DESIGN_APPROVED" },
    { label: "Printing", value: "IN_PRODUCTION" },
    { label: "Finishing", value: "FINISHING" },
    { label: "Siap Diambil", value: "READY" },
    { label: "Dikirim", value: "SHIPPING" },
    { label: "Selesai", value: "COMPLETED" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Manajemen Penjualan
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Semua Pesanan Masuk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola status pesanan, pembayaran, dan informasi pengiriman.
          </p>
        </div>
      </div>

      {/* Filter Status & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
          {statuses.map((st) => (
            <Link
              key={st.value}
              href={`/admin/orders?status=${st.value}${searchQuery ? `&search=${searchQuery}` : ""}`}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === st.value
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st.label}
            </Link>
          ))}
        </div>

        <form method="GET" action="/admin/orders" className="relative w-full lg:w-72">
          <input type="hidden" name="status" value={statusFilter} />
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="search"
            defaultValue={searchQuery}
            placeholder="Cari no. pesanan / pelanggan..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </form>
      </div>

      {/* Tabel Pesanan */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Tidak ada pesanan yang sesuai kriteria pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">No. Pesanan</th>
                  <th className="py-3.5 px-4">Pelanggan</th>
                  <th className="py-3.5 px-4">Produk & Spesifikasi</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Total Tagihan</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {o.orderNumber}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {formatDate(o.createdAt)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block">
                        {o.user.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {o.user.phone || "-"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 block">
                        {o.product.name}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {o.material ? `${o.material.name} • ` : ""}
                        {o.width && o.height ? `${o.width}x${o.height}m • ` : ""}
                        {o.quantity} {o.product.unit}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <OrderStatusBadge status={o.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                      {formatRupiah(o.totalPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="p-1.5 inline-flex items-center gap-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-lg font-semibold text-[11px] transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
