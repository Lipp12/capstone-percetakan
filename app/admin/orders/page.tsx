import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatRupiah, formatDate } from "@/lib/utils";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { Search, ShoppingBag, Eye, ExternalLink, ChevronLeft, ChevronRight, ReceiptText, Clock3, CheckCircle2 } from "lucide-react";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminStatCard from "@/components/AdminStatCard";

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
    <div className="w-full max-w-[1280px] mx-auto space-y-6">
      <AdminPageHeader
        eyebrow="Manajemen Penjualan"
        title="Kelola Pesanan"
        description="Kelola status pesanan, pembayaran, desain, dan informasi pengiriman."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Total pesanan"
          value={total}
          caption="Seluruh pesanan tersimpan"
          icon={ReceiptText}
          tone="yellow"
        />
        <AdminStatCard
          label="Hasil halaman"
          value={orders.length}
          caption={`Halaman ${page} dari ${totalPages}`}
          icon={ShoppingBag}
          tone="mint"
        />
        <AdminStatCard
          label="Menunggu aksi"
          value={orders.filter((order) => ["PENDING_PAYMENT", "DESIGN_CHECKING", "PAID"].includes(order.status)).length}
          caption="Pada halaman saat ini"
          icon={Clock3}
          tone="rose"
        />
        <AdminStatCard
          label="Siap / selesai"
          value={orders.filter((order) => ["READY", "COMPLETED"].includes(order.status)).length}
          caption="Pada halaman saat ini"
          icon={CheckCircle2}
          tone="lavender"
        />
      </div>

      {/* Filter Status & Search Bar */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-xl bg-surface-container-lowest p-4 shadow-sm lg:flex-row">
        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
          {statuses.map((st) => (
            <Link
              key={st.value}
              href={`/admin/orders?status=${st.value}${searchQuery ? `&search=${searchQuery}` : ""}`}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === st.value
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container text-on-surface-variant hover:bg-[#ece3d4]"
              }`}
            >
              {st.label}
            </Link>
          ))}
        </div>

        <form method="GET" action="/admin/orders" className="relative w-full lg:w-72">
          <input type="hidden" name="status" value={statusFilter} />
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            type="text"
            name="search"
            defaultValue={searchQuery}
            placeholder="Cari no. pesanan / pelanggan..."
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest py-2 pl-9 pr-3 text-xs outline-none focus:ring-1 focus:ring-primary"
          />
        </form>
      </div>

      {/* Tabel Pesanan */}
      <div className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
        {orders.length === 0 ? (
          <div className="p-12 text-center text-outline text-xs">
            Tidak ada pesanan yang sesuai kriteria pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-on-surface-variant">
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
                          className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Lihat</span>
                        </a>
                      ) : (
                        <span className="text-outline">-</span>
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
                        className="p-1.5 inline-flex items-center gap-1 bg-surface-container hover:bg-surface-container text-on-surface-variant hover:text-primary rounded-lg font-semibold text-[11px] transition"
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-container text-xs">
            <span className="text-outline">
              Halaman {page} dari {totalPages} ({total} pesanan)
            </span>
            <div className="flex items-center gap-2">
              {page > 1 ? (
                <Link href={pageHref(page - 1)} className="p-1.5 rounded-lg bg-surface-container hover:bg-[#ece3d4]">
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              ) : (
                <span className="p-1.5 rounded-lg bg-surface-container-low text-outline">
                  <ChevronLeft className="w-4 h-4" />
                </span>
              )}
              {page < totalPages ? (
                <Link href={pageHref(page + 1)} className="p-1.5 rounded-lg bg-surface-container hover:bg-[#ece3d4]">
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <span className="p-1.5 rounded-lg bg-surface-container-low text-outline">
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