import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [orders, transactions, users, materials] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, phone: true } },
        product: true,
        material: true,
      },
    }),
    prisma.transaction.findMany({
      where: { type: "INCOME" },
      orderBy: { date: "desc" },
      select: { date: true, total: true },
    }),
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      select: { id: true, name: true, createdAt: true },
    }),
    prisma.material.findMany({
      select: { id: true, name: true, stock: true, minStock: true, unit: true },
    }),
  ]);

  const lowStockMaterials = materials.filter((m) => m.stock < m.minStock);

  return (
    <div className="space-y-6">
      <DashboardClient
        initialOrders={orders}
        initialTransactions={transactions}
        totalCustomers={users.length}
        lowStockMaterials={lowStockMaterials}
      />
    </div>
  );
}
