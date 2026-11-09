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
      <div className="space-y-1">
        <span className="font-label-caps text-label-caps text-tertiary uppercase tracking-widest">
          Formulir Pemesanan Custom
        </span>
        <h1 className="font-epilogue text-2xl sm:text-3xl font-bold text-on-surface">
          Kustomisasi Pesanan: {product.name}
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
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
