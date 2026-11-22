import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { formatRupiah, formatDate } from "@/lib/utils";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import ProductCard from "@/components/ProductCard";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  ArrowRight,
  Printer,
  RefreshCw,
  AlertTriangle,
  Upload,
  Search,
  BadgeCheck,
  CalendarDays,
  Image as ImageIcon,
  Contact,
  Flag,
  Tag,
  BookOpen,
  Package,
  Gift,
  CloudUpload,
  Sparkles,
  ChevronRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface DashboardProps {
  searchParams: {
    category?: string;
    kategori?: string;
    search?: string;
    sort?: string;
  };
}

export default async function CustomerDashboardPage({ searchParams }: DashboardProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;
  const selectedCategory = searchParams.category || searchParams.kategori || "all";
  const searchQuery = searchParams.search || "";
  const sort = searchParams.sort || "newest";

  const productWhere: any = {};
  if (selectedCategory !== "all") productWhere.category = selectedCategory;
  if (searchQuery) {
    productWhere.OR = [
      { name: { contains: searchQuery } },
      { description: { contains: searchQuery } },
    ];
  }

  let productOrderBy: any = { createdAt: "desc" };
  if (sort === "price-asc") productOrderBy = { basePrice: "asc" };
  else if (sort === "price-desc") productOrderBy = { basePrice: "desc" };
  else if (sort === "name-asc") productOrderBy = { name: "asc" };
  else if (sort === "name-desc") productOrderBy = { name: "desc" };

  const products = await prisma.product.findMany({
    where: productWhere,
    orderBy: productOrderBy,
    include: { materials: { include: { material: true } } },
  });

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { product: true, material: true },
  });

  const totalOrders = orders.length;
  const activeOrders = orders.filter((order) =>
    !["COMPLETED", "CANCELLED"].includes(order.status)
  ).length;
  const completedOrders = orders.filter((order) => order.status === "COMPLETED").length;
  const rejectedDesignOrders = orders.filter((order) => order.status === "DESIGN_REJECTED");

  const rejectionReasons = await prisma.orderStatusHistory.findMany({
    where: {
      orderId: { in: rejectedDesignOrders.map((order) => order.id) },
      status: "DESIGN_REJECTED",
    },
    orderBy: { createdAt: "desc" },
    select: { orderId: true, notes: true },
  });

  const reasonByOrder = new Map<string, string>();
  for (const reason of rejectionReasons) {
    if (!reasonByOrder.has(reason.orderId)) {
      reasonByOrder.set(reason.orderId, reason.notes || "");
    }
  }

  const categoryItems = [
    { label: "ID Card & Lanyard", icon: BadgeCheck, color: "bg-primary-container/50 text-primary" },
    { label: "Cetak Kalender", icon: CalendarDays, color: "bg-tertiary-container/70 text-tertiary" },
    { label: "Poster & Cetak Foto", icon: ImageIcon, color: "bg-secondary-container/60 text-secondary" },
    { label: "Brosur & Flyer", icon: Contact, color: "bg-primary-container/35 text-primary" },
    { label: "Banner & Spanduk", icon: Flag, color: "bg-tertiary-container/50 text-tertiary" },
    { label: "Stiker & Label", icon: Tag, color: "bg-secondary-container/60 text-secondary" },
    { label: "Cetak Dokumen", icon: BookOpen, color: "bg-primary-container/40 text-primary" },
    { label: "Packaging & Box", icon: Package, color: "bg-tertiary-container/60 text-tertiary" },
  ];

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 space-y-0">
      {/* Compact account and status strip */}
      <section className="px-4 sm:px-6 lg:px-8 py-5 border-b border-outline-variant/40">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-label-caps text-label-caps uppercase text-primary">
              Halo kembali
            </p>
            <h1 className="mt-1 font-epilogue text-2xl sm:text-3xl font-bold text-on-surface">
              Selamat datang, {session.user.name?.split(" ")[0] || "Pelanggan"}
            </h1>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3">
            <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/50 px-3 py-2.5 sm:min-w-32">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <ShoppingBag className="h-4 w-4" />
                <span className="text-[11px]">Pesanan</span>
              </div>
              <p className="mt-1 text-lg font-bold text-on-surface">{totalOrders}</p>
            </div>
            <div className="rounded-xl bg-primary-container/35 border border-primary-fixed-dim/30 px-3 py-2.5 sm:min-w-32">
              <div className="flex items-center gap-2 text-on-primary-fixed-variant">
                <Clock className="h-4 w-4" />
                <span className="text-[11px]">Berjalan</span>
              </div>
              <p className="mt-1 text-lg font-bold text-on-surface">{activeOrders}</p>
            </div>
            <div className="rounded-xl bg-tertiary-container/50 border border-tertiary-fixed-dim/40 px-3 py-2.5 sm:min-w-32">
              <div className="flex items-center gap-2 text-tertiary">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-[11px]">Selesai</span>
              </div>
              <p className="mt-1 text-lg font-bold text-on-surface">{completedOrders}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="px-4 sm:px-6 lg:px-8 py-5">
        <form action="/dashboard" method="get" className="mx-auto max-w-[860px]">
          <div className="flex items-center rounded-full border border-outline-variant/30 bg-surface-container-lowest p-1 shadow-[3px_3px_0px_#2D2926]">
            <Search className="ml-4 h-5 w-5 shrink-0 text-secondary" />
            <input
              name="search"
              defaultValue={searchQuery}
              placeholder="Cari cetak ID Card, kalender, banner, poster..."
              className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/60"
            />
            {selectedCategory !== "all" && (
              <input type="hidden" name="category" value={selectedCategory} />
            )}
            <button
              type="submit"
              className="hidden sm:flex h-10 items-center rounded-full bg-primary-container px-5 text-xs font-bold text-on-primary-container shadow-sm transition hover:bg-primary hover:text-on-primary"
            >
              Cari Produk
            </button>
          </div>
        </form>
      </section>

      {/* Categories */}
      <section className="bg-surface-container-low px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="font-epilogue text-xl font-semibold text-on-surface">
              Kategori Produk Cetak
            </h2>
          </div>
          <Link href="/katalog" className="hidden sm:flex items-center gap-1 text-xs font-bold text-primary">
            Lihat Semua <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {categoryItems.map((item) => {
            const Icon = item.icon;
            const categoryParam = item.label === "Cetak Kalender"
              ? null
              : item.label;
            return (
              <Link
                key={item.label}
                href={categoryParam ? `/dashboard?category=${encodeURIComponent(categoryParam)}` : "/katalog"}
                className="flex min-w-0 flex-col items-center rounded-xl bg-surface-container-lowest p-2 text-center transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-full ${item.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="w-full text-[10px] font-bold leading-tight text-on-surface sm:text-xs">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Promotion cards */}
      <section className="grid gap-3 px-4 py-5 sm:px-6 md:grid-cols-2 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-secondary-fixed/70 p-5 sm:p-6">
          <span className="inline-flex rounded-full bg-secondary px-2 py-1 font-label-caps text-[10px] uppercase text-on-secondary">
            Promo Eksklusif
          </span>
          <h3 className="mt-3 max-w-sm font-epilogue text-xl font-bold text-on-secondary-fixed">
            Paket Cetak Hemat untuk Usaha Anda
          </h3>
          <p className="mt-1 max-w-md text-xs text-on-secondary-fixed/80">
            Pilih produk favorit dan dapatkan harga cetak terbaik untuk pesanan rutin.
          </p>
          <Link
            href="/katalog"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-surface-container-lowest px-4 py-2 text-xs font-bold text-on-surface shadow-sm"
          >
            <Gift className="h-4 w-4" /> Lihat Promo
          </Link>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-tertiary-container/70 p-5 sm:p-6">
          <span className="inline-flex rounded-full bg-tertiary px-2 py-1 font-label-caps text-[10px] uppercase text-on-tertiary">
            Prepress Cepat
          </span>
          <h3 className="mt-3 max-w-sm font-epilogue text-xl font-bold text-on-tertiary-fixed">
            Unggah desain dan mulai cetak
          </h3>
          <p className="mt-1 max-w-md text-xs text-on-tertiary-fixed/80">
            Kirim file desain Anda dan pantau progress produksi secara mudah.
          </p>
          <Link
            href="/katalog"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-surface-container-lowest px-4 py-2 text-xs font-bold text-on-surface shadow-sm"
          >
            <CloudUpload className="h-4 w-4" /> Upload File Cetak
          </Link>
        </div>
      </section>

      {/* Rejected design notification */}
      {rejectedDesignOrders.length > 0 && (
        <section className="mx-4 mb-5 rounded-2xl border border-error/20 bg-error-container/35 p-4 sm:mx-6 lg:mx-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error-container text-error">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-error">Desain perlu diperbaiki</h2>
                <p className="mt-0.5 text-xs text-on-error-container">
                  {rejectedDesignOrders.length} pesanan menunggu revisi desain Anda.
                </p>
              </div>
            </div>
            <Link
              href={`/order/${rejectedDesignOrders[0].id}/upload`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-error px-4 py-2 text-xs font-bold text-on-error"
            >
              <Upload className="h-4 w-4" /> Unggah Revisi
            </Link>
          </div>
          {rejectedDesignOrders.slice(0, 2).map((order) => (
            <div key={order.id} className="mt-3 rounded-xl bg-surface-container-lowest p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-on-surface">{order.orderNumber}</p>
                  <p className="mt-0.5 text-[11px] text-on-surface-variant">{order.product.name}</p>
                  {reasonByOrder.get(order.id) && (
                    <p className="mt-1 text-[11px] text-error">
                      Catatan: {reasonByOrder.get(order.id)?.replace(/^Desain ditolak:\s*/i, "")}
                    </p>
                  )}
                </div>
                <Link href={`/orders/${order.id}/tracking`} className="shrink-0 text-xs font-bold text-primary">
                  Detail
                </Link>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Recommendations */}
      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="font-epilogue text-xl sm:text-2xl font-bold text-on-surface">
                Rekomendasi Pilihan Untukmu
              </h2>
            </div>
            <p className="mt-1 text-xs text-on-surface-variant">
              Produk cetak favorit dengan kualitas terkurasi studio.
            </p>
          </div>
          <Link href="/katalog" className="shrink-0 text-xs font-bold text-primary">
            Semua Produk
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-10 text-center">
            <p className="text-sm font-bold text-on-surface">Produk tidak ditemukan</p>
            <p className="mt-1 text-xs text-on-surface-variant">
              Coba kata kunci atau kategori lain.
            </p>
            <Link href="/dashboard" className="mt-4 inline-flex rounded-full bg-primary-container px-4 py-2 text-xs font-bold text-on-primary-container">
              Reset Pencarian
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 8).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </section>

      {/* Recent orders */}
      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-outline-variant/50 bg-surface-container-lowest">
          <div className="flex items-center justify-between border-b border-outline-variant/40 p-4 sm:p-5">
            <div>
              <h2 className="font-epilogue text-lg font-bold text-on-surface">Pesanan Terkini</h2>
              <p className="mt-0.5 text-xs text-on-surface-variant">
                Progress transaksi pesanan Anda
              </p>
            </div>
            <Link href="/orders" className="flex items-center gap-1 text-xs font-bold text-primary">
              Semua Pesanan <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="p-10 text-center">
              <ShoppingBag className="mx-auto h-8 w-8 text-outline" />
              <p className="mt-2 text-sm font-bold text-on-surface">Belum ada pesanan</p>
              <p className="mt-1 text-xs text-on-surface-variant">
                Mulai pesanan pertama Anda dari katalog produk.
              </p>
              <Link href="/katalog" className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-xs font-bold text-on-primary">
                Buka Katalog
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/30">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-on-surface">{order.orderNumber}</span>
                      <OrderStatusBadge status={order.status} size="sm" />
                    </div>
                    <p className="mt-1 text-xs font-medium text-on-surface-variant">
                      {order.product.name}
                      {order.material ? ` • ${order.material.name}` : ""}
                    </p>
                    <p className="mt-1 text-[11px] text-on-surface-variant/70">
                      {order.quantity} {order.product.unit} • {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <div className="text-right">
                      <span className="block text-[10px] text-on-surface-variant">Total</span>
                      <span className="text-sm font-bold text-on-surface">{formatRupiah(order.totalPrice)}</span>
                    </div>
                    <Link href={`/orders/${order.id}/tracking`} className="rounded-lg border border-outline-variant px-3 py-2 text-xs font-bold text-on-surface-variant">
                      Tracking
                    </Link>
                    <Link
                      href={order.status === "DESIGN_REJECTED"
                        ? `/order/${order.id}/upload`
                        : `/order/${order.productId}?repeatOrderId=${order.id}`}
                      className="rounded-lg border border-outline-variant p-2 text-on-surface-variant"
                      title="Pesan lagi"
                    >
                      {order.status === "DESIGN_REJECTED"
                        ? <Upload className="h-4 w-4" />
                        : <RefreshCw className="h-4 w-4" />}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
