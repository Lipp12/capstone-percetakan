import { prisma } from "@/lib/prisma";
import ProductsClient from "./ProductsClient";

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
    <div className="space-y-6">
      <ProductsClient initialProducts={products} />
    </div>
  );
}
