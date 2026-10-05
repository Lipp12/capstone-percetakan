import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/utils";

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
    <div className="space-y-7">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Produk terlaris</h1>
          <p className="mt-1 text-sm text-slate-500">
            Peringkat berdasarkan jumlah unit pada pesanan yang sudah selesai.
          </p>
        </div>
        <p className="text-xs text-slate-500">Data seluruh periode</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-md border border-stone-200 bg-white p-4 sm:p-5">
          <p className="text-xs font-medium text-slate-500">Unit terjual</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
            {totalUnits.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="rounded-md border border-stone-200 bg-white p-4 sm:p-5">
          <p className="text-xs font-medium text-slate-500">Produk teratas</p>
          <p className="mt-1 truncate text-lg font-bold text-rose-800">
            {topProduct?.name ?? "Belum ada data"}
          </p>
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white">
        <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
          <h2 className="font-semibold text-slate-900">Peringkat penjualan</h2>
          <span className="text-xs text-slate-500">{products.length} produk</span>
        </div>

        {products.length === 0 ? (
          <p className="border-t border-stone-200 px-4 py-10 text-center text-sm text-slate-500 sm:px-5">
            Belum ada pesanan selesai untuk dihitung.
          </p>
        ) : (
          <ol className="divide-y divide-stone-200">
            {products.map((product, index) => (
              <li key={product.id} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 px-4 py-4 sm:grid-cols-[2.5rem_minmax(0,1fr)_10rem] sm:items-center sm:gap-4 sm:px-5">
                <span className="font-serif text-xl text-stone-400 tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <h3 className="truncate text-sm font-semibold text-slate-900">
                      {product.name}
                    </h3>
                    <span className="text-xs font-semibold tabular-nums text-slate-700">
                      {product.quantity.toLocaleString("id-ID")} {product.unit}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {product.orderCount} pesanan · {formatRupiah(product.revenue)}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100 sm:hidden">
                    <div
                      className="h-full bg-rose-700"
                      style={{ width: `${(product.quantity / products[0].quantity) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="hidden h-1.5 overflow-hidden rounded-full bg-stone-100 sm:block">
                  <div
                    className="h-full bg-rose-700"
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