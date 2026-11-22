import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/utils";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminStatCard from "@/components/AdminStatCard";
import { Package, ShoppingBag, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminBestSellingProductsPage() {
  const completedOrders = await prisma.order.findMany({
    where: { status: "COMPLETED" },
    select: {
      quantity: true,
      totalPrice: true,
      product: { select: { id: true, name: true, unit: true } },
    },
  });

  const productSales = new Map<
    string,
    { id: string; name: string; unit: string; quantity: number; orderCount: number; revenue: number }
  >();

  completedOrders.forEach((order) => {
    const current = productSales.get(order.product.id) ?? {
      ...order.product,
      quantity: 0,
      orderCount: 0,
      revenue: 0,
    };
    current.quantity += order.quantity;
    current.orderCount += 1;
    current.revenue += order.totalPrice;
    productSales.set(order.product.id, current);
  });

  const products = [...productSales.values()]
    .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
    .slice(0, 10);
  const totalUnits = completedOrders.reduce((sum, order) => sum + order.quantity, 0);
  const topProduct = products[0];

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-6">
      <AdminPageHeader
        eyebrow="Analitik Produk"
        title="Produk Terlaris"
        description="Peringkat berdasarkan jumlah unit pada pesanan yang sudah selesai."
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminStatCard
          label="Unit terjual"
          value={totalUnits.toLocaleString("id-ID")}
          caption="Seluruh periode"
          icon={ShoppingBag}
          tone="mint"
        />
        <AdminStatCard
          label="Produk teratas"
          value={topProduct?.name ?? "Belum ada data"}
          caption="Urutan penjualan tertinggi"
          icon={TrendingUp}
          tone="yellow"
        />
        <AdminStatCard
          label="Produk terhitung"
          value={products.length}
          caption="Memiliki pesanan selesai"
          icon={Package}
          tone="lavender"
        />
      </section>

      <section className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
        <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
          <h2 className="font-semibold text-on-surface">Peringkat penjualan</h2>
          <span className="text-xs text-outline">{products.length} produk</span>
        </div>

        {products.length === 0 ? (
          <p className="border-t border-outline-variant px-4 py-10 text-center text-sm text-outline sm:px-5">
            Belum ada pesanan selesai untuk dihitung.
          </p>
        ) : (
          <ol className="divide-y divide-ink-200">
            {products.map((product, index) => (
              <li key={product.id} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 px-4 py-4 sm:grid-cols-[2.5rem_minmax(0,1fr)_10rem] sm:items-center sm:gap-4 sm:px-5">
                <span className="font-serif text-xl text-outline tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <h3 className="truncate text-sm font-semibold text-on-surface">
                      {product.name}
                    </h3>
                    <span className="text-xs font-semibold tabular-nums text-on-surface-variant">
                      {product.quantity.toLocaleString("id-ID")} {product.unit}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-outline">
                    {product.orderCount} pesanan \u00b7 {formatRupiah(product.revenue)}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-container sm:hidden">
                    <div
                      className="h-full bg-primary-container"
                      style={{ width: `${(product.quantity / products[0].quantity) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="hidden h-1.5 overflow-hidden rounded-full bg-surface-container sm:block">
                  <div
                    className="h-full bg-primary-container"
                    style={{ width: `${(product.quantity / products[0].quantity) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}