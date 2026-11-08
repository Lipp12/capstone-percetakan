import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatRupiah, formatDate } from "@/lib/utils";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { Search, ShoppingBag, Eye, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

interface Props {
  searchParams: {
    status?: string;
    search?: string;
    page?: string;
  };
}

export default async function AdminOrdersListPage({ searchParams }: Props) {
  const statusFilter = searchParams.status || "ALL";
  const searchQuery = searchParams.search || "";
  const page = Math.max(1, Number(searchParams.page) || 1);

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

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: { select: { name: true, phone: true, email: true } },
        product: true,
        material: true,
      },
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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
    { label: "Ditolak/Batal", value: "CANCELLED" },
  ];

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (searchQuery) params.set("search", searchQuery);
    params.set("page", String(p));
    return `/admin/orders?${params.toString()}`;
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 lg:px-10 pt-8 pb-8 bg-background min-h-screen">
      {/* Badge row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps tracking-widest uppercase shadow-[2px_2px_0px_#1c1c19]">
          Katalog Standar Studio
        </span>
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-caps text-label-caps tracking-widest uppercase">
          Terkalibrasi CMYK
        </span>
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-caps text-label-caps tracking-widest uppercase">
          Presisi Lipat &amp; Potong
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Manajemen Penjualan
          </span>
          <h1 className="text-2xl font-black text-ink-900 mt-1">
            Semua Pesanan Masuk
          </h1>
          <p className="text-xs text-ink-500 mt-0.5">
            Kelola status pesanan, pembayaran, dan informasi pengiriman.
          </p>
        </div>
      </div>

      {/* Filter Status & Search Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-3xl border border-outline-variant/50 shadow-[0_4px_16px_rgba(188,148,120,0.06)] flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
          {statuses.map((st) => (
            <Link
              key={st.value}
              href={`/admin/orders?status=${st.value}${searchQuery ? `&search=${searchQuery}` : ""}`}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === st.value
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-ink-100 text-ink-600 hover:bg-ink-200"
              }`}
            >
              {st.label}
            </Link>
          ))}
        </div>

        <form method="GET" action="/admin/orders" className="relative w-full lg:w-72">
          <input type="hidden" name="status" value={statusFilter} />
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            name="search"
            defaultValue={searchQuery}
            placeholder="Cari no. pesanan / pelanggan..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-ink-200 rounded-xl focus:ring-2 focus:ring-brand-600 outline-none"
          />
        </form>
      </div>

      {/* Tabel Pesanan */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/50 shadow-[0_4px_16px_rgba(188,148,120,0.06)] overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center text-ink-400 text-xs">
            Tidak ada pesanan yang sesuai kriteria pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-ink-700">
              <thead className="bg-surface-container border-b border-outline-variant/50 text-on-surface-variant font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">No. Pesanan</th>
                  <th className="py-3.5 px-4">Pelanggan</th>
                  <th className="py-3.5 px-4">Produk & Spesifikasi</th>
                  <th className="py-3.5 px-4">File</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Total Tagihan</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-surface-container-low transition">
                    <td className="py-3.5 px-4 font-bold text-on-surface">
                      {o.orderNumber}
                      <span className="block text-[10px] text-on-surface-variant/60 font-normal">
                        {formatDate(o.createdAt)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-on-surface block">
                        {o.user.name}
                      </span>
                      <span className="text-[10px] text-on-surface-variant/60">
                        {o.user.phone || o.user.email || "-"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-on-surface block">
                        {o.product.name}
                      </span>
                      <span className="text-[11px] text-on-surface-variant">
                        {o.material ? `${o.material.name} • ` : ""}
                        {o.width && o.height ? `${o.width}x${o.height}m • ` : ""}
                        {o.quantity} {o.product.unit}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {o.designFileUrl ? (
                        <a
                          href={o.designFileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-brand-600 hover:underline font-semibold"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Lihat</span>
                        </a>
                      ) : (
                        <span className="text-ink-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <OrderStatusBadge status={o.status} size="sm" />
                      {o.alifSyncStatus === "FAILED" && (
                        <span className="block text-[10px] text-rose-600 mt-1">
                          Sync Alif gagal
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-primary">
                      {formatRupiah(o.totalPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="p-1.5 inline-flex items-center gap-1 bg-ink-100 hover:bg-brand-50 text-ink-700 hover:text-brand-600 rounded-lg font-semibold text-[11px] transition"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-ink-100 text-xs">
            <span className="text-ink-400">
              Halaman {page} dari {totalPages} ({total} pesanan)
            </span>
            <div className="flex items-center gap-2">
              {page > 1 ? (
                <Link href={pageHref(page - 1)} className="p-1.5 rounded-lg bg-ink-100 hover:bg-ink-200">
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              ) : (
                <span className="p-1.5 rounded-lg bg-ink-50 text-ink-300">
                  <ChevronLeft className="w-4 h-4" />
                </span>
              )}
              {page < totalPages ? (
                <Link href={pageHref(page + 1)} className="p-1.5 rounded-lg bg-ink-100 hover:bg-ink-200">
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <span className="p-1.5 rounded-lg bg-ink-50 text-ink-300">
                  <ChevronRight className="w-4 h-4" />
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}