import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  Star,
  Upload,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: {
    period?: string;
    status?: string;
    q?: string;
  };
}

const statusLabels: Record<string, string> = {
  PENDING_PAYMENT: "Belum Bayar",
  PAID: "Dibayar",
  DESIGN_CHECKING: "Cek Desain",
  DESIGN_REJECTED: "Perlu Revisi",
  DESIGN_APPROVED: "Desain Disetujui",
  IN_PRODUCTION: "Proses Cetak",
  FINISHING: "Finishing",
  READY: "Siap Diambil",
  SHIPPING: "Dikirim",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

const statusStyles: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  PAID: "bg-blue-100 text-blue-800",
  DESIGN_CHECKING: "bg-sky-100 text-sky-800",
  DESIGN_REJECTED: "bg-rose-100 text-rose-800",
  DESIGN_APPROVED: "bg-emerald-100 text-emerald-800",
  IN_PRODUCTION: "bg-indigo-100 text-indigo-800",
  FINISHING: "bg-purple-100 text-purple-800",
  READY: "bg-teal-100 text-teal-800",
  SHIPPING: "bg-cyan-100 text-cyan-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-stone-100 text-stone-600",
};

function getPeriodStart(period: string | undefined): Date | null {
  const start = new Date();
  if (period === "30d") {
    start.setDate(start.getDate() - 30);
    return start;
  }
  if (period === "6m") {
    start.setMonth(start.getMonth() - 6);
    return start;
  }
  if (period === "year") {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  return null;
}

export default async function OrderHistoryPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = session.user as { id?: string; role?: string };
  const isAdmin = user.role === "ADMIN" || user.role === "OPERATOR";
  const orders = await prisma.order.findMany({
    where: isAdmin ? {} : { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { product: true, material: true },
  });

  const completedOrders = orders.filter((order) => order.status === "COMPLETED");
  const totalSpent = completedOrders.reduce((total, order) => total + order.totalPrice, 0);
  const productCounts = new Map<string, number>();
  for (const order of orders) {
    productCounts.set(order.product.name, (productCounts.get(order.product.name) || 0) + 1);
  }
  const mostOrderedProduct = [...productCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  const period = searchParams.period || "all";
  const status = searchParams.status || "all";
  const query = searchParams.q?.trim().toLocaleLowerCase("id-ID") || "";
  const periodStart = getPeriodStart(period);
  const filteredOrders = orders.filter((order) => {
    if (periodStart && order.createdAt < periodStart) return false;
    if (status !== "all" && order.status !== status) return false;
    if (
      query &&
      !order.orderNumber.toLocaleLowerCase("id-ID").includes(query) &&
      !order.product.name.toLocaleLowerCase("id-ID").includes(query)
    ) {
      return false;
    }
    return true;
  });

  const groupedOrders = new Map<string, typeof filteredOrders>();
  for (const order of filteredOrders) {
    const monthKey = `${order.createdAt.getFullYear()}-${order.createdAt.getMonth()}`;
    groupedOrders.set(monthKey, [...(groupedOrders.get(monthKey) || []), order]);
  }

  const periodOptions = [
    { value: "all", label: "Semua Waktu" },
    { value: "30d", label: "30 Hari Terakhir" },
    { value: "6m", label: "6 Bulan Terakhir" },
    { value: "year", label: "Tahun Ini" },
  ];

  return (
    <div className="space-y-6 text-[#3d3028]">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <p className="text-[#81766b]">
          <Link href="/" className="hover:text-[#7b4a2d]">Beranda</Link>
          <span className="mx-2">/</span>
          <Link href="/orders" className="hover:text-[#7b4a2d]">Pesanan Saya</Link>
          <span className="mx-2">/</span>
          <span className="font-semibold text-[#6b3c23]">Riwayat Pesanan</span>
        </p>
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 rounded-full border border-[#e5d9c8] bg-white px-4 py-2 font-semibold hover:bg-[#fbf2df]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke Pesanan Saya
        </Link>
      </div>

      <section className="border-b border-[#e9dfd2] pb-5">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-[#d9f0df] px-3 py-1 text-[10px] font-bold text-[#396b49]">
            Arsip Terverifikasi
          </span>
          <span className="rounded-full bg-[#fff0c2] px-3 py-1 text-[10px] font-bold text-[#83641c]">
            Cetak Ulang Cepat
          </span>
          <span className="rounded-full bg-[#f9dce4] px-3 py-1 text-[10px] font-bold text-[#8a5362]">
            Katalog Proyek Selesai
          </span>
        </div>
        <h1 className="mt-1 font-epilogue text-3xl font-extrabold tracking-tight text-[#6b351d] sm:text-4xl">
          Riwayat Pesanan Pelanggan
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#81766b]">
          Pesanan cetak yang telah selesai diproduksi atau dibatalkan. Konfigurasi tersimpan untuk memudahkan pemesanan ulang.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3" aria-label="Ringkasan riwayat pesanan">
        <div className="rounded-2xl border border-[#f0d26c] bg-gradient-to-br from-[#fff8d9] to-[#fff3c1] p-5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-[#766239]">
            Pesanan Selesai
            <CheckCircle2 className="h-5 w-5 rounded-full bg-white p-1 text-amber-700" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-[#51371f]">{completedOrders.length}</p>
          <p className="mt-1 text-[10px] text-[#81766b]">pesanan tuntas</p>
        </div>
        <div className="rounded-2xl border border-[#b8dfc5] bg-gradient-to-br from-[#e7f7eb] to-[#dff2e4] p-5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-[#496c52]">
            Total Belanja Selesai
            <ShoppingBag className="h-5 w-5 rounded-full bg-white p-1 text-emerald-700" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#31563b] sm:text-3xl">{formatRupiah(totalSpent)}</p>
          <p className="mt-1 text-[10px] text-[#66806b]">dari pesanan yang telah selesai</p>
        </div>
        <div className="rounded-2xl border border-[#efc5d0] bg-gradient-to-br from-[#fff0f3] to-[#fce4e9] p-5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-[#79525d]">
            Paling Sering Dipesan
            <Star className="h-5 w-5 rounded-full bg-white p-1 text-rose-600" />
          </div>
          <p className="mt-2 truncate text-xl font-extrabold text-[#603846]">
            {mostOrderedProduct?.[0] || "Belum ada"}
          </p>
          <p className="mt-1 text-[10px] text-[#8a6972]">
            {mostOrderedProduct ? `${mostOrderedProduct[1]} pesanan` : "Akan tampil setelah ada pesanan"}
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-dashed border-[#d9c7a8] bg-gradient-to-r from-[#fff8e4] to-[#eaf6eb] p-4 sm:flex-row sm:items-center">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#704328] text-[#ffe59a]">
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-[#563923]">File Master &amp; Profil Warna Disimpan</h2>
          <p className="mt-0.5 text-xs leading-relaxed text-[#81766b]">
            {orders.length > 0
              ? "Pesanan tersimpan sebagai referensi untuk memudahkan cetak ulang."
              : "Riwayat dan spesifikasi pesanan akan tersimpan di sini setelah Anda membuat pesanan."}
          </p>
        </div>
        <span className="whitespace-nowrap rounded-full border border-[#d7e5d8] bg-white px-3 py-1.5 text-[10px] font-semibold text-[#52715a]">
          {orders.length > 0 ? `${orders.length} arsip pesanan` : "Menunggu pesanan pertama"}
        </span>
      </section>

      <form
        action="/riwayat-pesanan"
        className="flex flex-col gap-3 rounded-2xl border border-[#e9dfd2] bg-white p-3 shadow-sm lg:flex-row lg:items-center"
      >
        <div className="flex flex-1 flex-wrap gap-2">
          {periodOptions.map((option) => (
            <Link
              key={option.value}
              href={`/riwayat-pesanan?period=${option.value}&status=${status}`}
              className={`rounded-full border px-3 py-2 text-[11px] font-semibold transition ${
                period === option.value
                  ? "border-[#6b3c23] bg-[#6b3c23] text-white"
                  : "border-[#e8dfd3] bg-[#fbf9f5] text-[#716659] hover:bg-[#f7eddc]"
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>
        <select
          name="status"
          defaultValue={status}
          className="rounded-xl border border-[#e8dfd3] bg-[#fbf9f5] px-3 py-2.5 text-xs text-[#5b5045]"
        >
          <option value="all">Semua Status</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <div className="flex min-w-0 items-center gap-2 rounded-xl border border-[#e8dfd3] bg-[#fbf9f5] px-3">
          <Search className="h-4 w-4 shrink-0 text-[#81766b]" />
          <input
            name="q"
            defaultValue={searchParams.q}
            placeholder="Cari produk atau nomor pesanan..."
            className="min-w-0 flex-1 bg-transparent py-2.5 text-xs outline-none placeholder:text-[#a39a90]"
          />
          <input type="hidden" name="period" value={period} />
          <button type="submit" className="sr-only">Cari riwayat</button>
        </div>
      </form>

      {filteredOrders.length === 0 ? (
        <div className="rounded-3xl border border-[#e9dfd2] bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff4d2] text-[#8a6b27]">
            {orders.length === 0 ? <Clock3 className="h-7 w-7" /> : <Package className="h-7 w-7" />}
          </div>
          <h2 className="mt-4 text-lg font-bold text-[#563923]">
            {orders.length === 0 ? "Belum ada riwayat pesanan" : "Pesanan tidak ditemukan"}
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-[#81766b]">
            {orders.length === 0
              ? "Riwayat akan muncul di sini setelah Anda membuat pesanan. Mulai dengan memilih produk yang ingin dicetak."
              : "Coba ubah periode, status, atau kata kunci pencarian."}
          </p>
          {orders.length === 0 && (
            <Link
              href="/katalog"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#fbe38d] px-5 py-2.5 text-sm font-bold text-[#5f5019] shadow-[2px_2px_0px_#3d3028] transition hover:-translate-y-0.5"
            >
              <ShoppingBag className="h-4 w-4" />
              Lihat Katalog
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {[...groupedOrders.entries()].map(([monthKey, monthOrders]) => {
            const firstOrder = monthOrders[0];
            const monthLabel = firstOrder.createdAt.toLocaleDateString("id-ID", {
              month: "long",
              year: "numeric",
            });
            return (
              <section key={monthKey}>
                <div className="mb-3 flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-[#b84b22]" />
                  <h2 className="text-xs font-extrabold uppercase tracking-wide text-[#603b27]">{monthLabel}</h2>
                  <span className="rounded-full bg-[#f0e9dd] px-2 py-0.5 text-[10px] text-[#746655]">
                    {monthOrders.length} pesanan
                  </span>
                  <span className="h-px flex-1 bg-[#e9dfd2]" />
                </div>
                <div className="space-y-3">
                  {monthOrders.map((order) => (
                    <article
                      key={order.id}
                      className="flex flex-col gap-4 rounded-2xl border border-[#e9dfd2] bg-white p-4 shadow-[0_3px_12px_rgba(80,60,40,0.06)] sm:flex-row sm:items-center"
                    >
                      <div className="flex min-w-0 flex-1 items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-[#c8dfef] bg-[#e8f4fc] text-[#27628a]">
                          <FileText className="h-6 w-6" />
                          <span className="mt-0.5 text-[8px] font-bold uppercase">{order.product.unit}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-[10px]">
                            <span className="rounded bg-[#fbf1e7] px-2 py-0.5 font-bold text-[#9b5631]">
                              #{order.orderNumber}
                            </span>
                            <span className="text-[#968b7e]">
                              {order.createdAt.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 font-bold ${statusStyles[order.status] || "bg-stone-100 text-stone-700"}`}>
                              {statusLabels[order.status] || order.status}
                            </span>
                          </div>
                          <h3 className="mt-1 truncate text-sm font-extrabold text-[#573821]">{order.product.name}</h3>
                          <p className="mt-1 text-xs text-[#81766b]">
                            {order.quantity} {order.product.unit}
                            {order.material ? ` · ${order.material.name}` : ""}
                            {order.width && order.height ? ` · ${order.width} × ${order.height} m` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f0e9dd] pt-3 sm:border-0 sm:pt-0">
                        <p className="text-right text-base font-extrabold text-[#5a351f]">{formatRupiah(order.totalPrice)}</p>
                        <div className="flex items-center gap-2">
                          <Link
                            href={order.status === "DESIGN_REJECTED"
                              ? `/order/${order.id}/upload`
                              : `/order/${order.productId}?repeatOrderId=${order.id}`}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#b6421d] px-3 py-2 text-[11px] font-bold text-white hover:bg-[#963516]"
                          >
                            {order.status === "DESIGN_REJECTED"
                              ? <Upload className="h-3.5 w-3.5" />
                              : <RefreshCw className="h-3.5 w-3.5" />}
                            {order.status === "DESIGN_REJECTED" ? "Upload Revisi" : "Pesan Ulang"}
                          </Link>
                          <Link
                            href={`/orders/${order.id}/invoice`}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#e1d6c9] px-3 py-2 text-[11px] font-semibold text-[#6c5a49] hover:bg-[#fbf7f1]"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Invoice
                          </Link>
                          <Link
                            href={`/orders/${order.id}/tracking`}
                            className="inline-flex items-center gap-1 rounded-full border border-[#e1d6c9] px-3 py-2 text-[11px] font-semibold text-[#6c5a49] hover:bg-[#fbf7f1]"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                            Lacak
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
