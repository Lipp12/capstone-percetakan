import { prisma } from "@/lib/prisma";
import ProductsClient from "./ProductsClient";
import AdminPageHeader from "@/components/AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      materials: { include: { material: true } },
      _count: { select: { orders: true } },
    },
  });

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-6">
      <AdminPageHeader
        eyebrow="Master Data"
        title="Kelola Katalog Produk"
        description="Kelola produk cetak, kategori, harga dasar, dan foto yang ditampilkan kepada pelanggan."
      />
      <ProductsClient initialProducts={products} />
    </div>
  );
}
