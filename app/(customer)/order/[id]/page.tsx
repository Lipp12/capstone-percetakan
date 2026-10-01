import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OrderFormClient from "./OrderFormClient";

export const dynamic = "force-dynamic";

interface Props {
  params: {
    id: string; // productId
  };
  searchParams: {
    repeatOrderId?: string;
  };
}

export default async function CustomOrderPage({ params, searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/login?callbackUrl=/order/${params.id}`);
  }

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      materials: {
        include: { material: true },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const finishings = await prisma.finishing.findMany();

  // Jika repeat order, ambil data pesanan lama untuk prefill form
  let initialData: any = null;
  if (searchParams.repeatOrderId) {
    const oldOrder = await prisma.order.findUnique({
      where: { id: searchParams.repeatOrderId },
      include: {
        finishings: true,
      },
    });

    if (oldOrder && oldOrder.productId === product.id) {
      initialData = {
        materialId: oldOrder.materialId || "",
        width: oldOrder.width || 1,
        height: oldOrder.height || 1,
        quantity: oldOrder.quantity || 1,
        pickupMethod: oldOrder.pickupMethod || "PICKUP",
        address: oldOrder.address || "",
        finishingIds: oldOrder.finishings.map((f) => f.finishingId),
        notes: oldOrder.notes || "",
      };
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="space-y-1">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          Formulir Pemesanan Custom
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Kustomisasi Pesanan: {product.name}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Tentukan spesifikasi ukuran, material, dan finishing. Estimasi harga langsung dihitung secara otomatis.
        </p>
      </div>

      <OrderFormClient
        product={product}
        finishings={finishings}
        initialData={initialData}
      />
    </div>
  );
}
